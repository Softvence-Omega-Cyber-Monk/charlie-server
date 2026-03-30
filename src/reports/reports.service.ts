// src/reports/reports.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AttendanceStatus } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Public: Full attendance report for a class — mirrors the Reports page.
   * Returns aggregate stats per student + overall metrics.
   */
  async getClassReport(classId: string) {
    const cls = await this.prisma.class.findUnique({
      where: { id: classId },
      include: {
        schedules: true,
        teacher: { select: { name: true } },
      },
    });
    if (!cls) throw new NotFoundException('Class not found');

    const scheduleIds = cls.schedules.map((s) => s.id);

    const enrollments = await this.prisma.enrollment.findMany({
      where: { classId },
      include: { student: true },
      orderBy: { student: { name: 'asc' } },
    });

    const studentRows = await Promise.all(
      enrollments.map(async ({ student }) => {
        const records = await this.prisma.attendance.findMany({
          where: {
            studentId: student.id,
            scheduleId: { in: scheduleIds },
          },
        });

        const totalPresent = records.filter(
          (r) => r.status === AttendanceStatus.PRESENT,
        ).length;
        const totalAbsent = records.filter(
          (r) => r.status === AttendanceStatus.ABSENT,
        ).length;
        const totalExcused = records.filter(
          (r) => r.status === AttendanceStatus.EXCUSED,
        ).length;
        const total = records.length;
        const attendanceRate =
          total > 0
            ? parseFloat(((totalPresent / total) * 100).toFixed(1))
            : 0;

        return {
          student,
          totalPresent,
          totalAbsent,
          totalExcused,
          total,
          attendanceRate,
          isCritical: total > 0 && attendanceRate < 80,
        };
      }),
    );

    // Overall metrics
    const allRates = studentRows
      .filter((r) => r.total > 0)
      .map((r) => r.attendanceRate);
    const averagePresence =
      allRates.length > 0
        ? parseFloat(
            (allRates.reduce((a, b) => a + b, 0) / allRates.length).toFixed(1),
          )
        : 0;

    const totalExcusedAll = studentRows.reduce(
      (sum, r) => sum + r.totalExcused,
      0,
    );
    const criticalAlerts = studentRows.filter((r) => r.isCritical).length;

    return {
      class: cls,
      summary: {
        averagePresence,
        totalExcused: totalExcusedAll,
        criticalAlerts,
        totalStudents: enrollments.length,
      },
      students: studentRows,
    };
  }

  /**
   * Public: Export class report as CSV string.
   */
  async exportClassReportCsv(classId: string): Promise<string> {
    const report = await this.getClassReport(classId);

    const headers = [
      'Student Name',
      'Student ID',
      'Total Present',
      'Total Absent',
      'Total Excused',
      'Attendance Rate (%)',
      'Critical Alert',
    ];

    const rows = report.students.map((r) => [
      r.student.name,
      r.student.studentCode,
      r.totalPresent,
      r.totalAbsent,
      r.totalExcused,
      r.attendanceRate,
      r.isCritical ? 'YES' : 'NO',
    ]);

    const csvLines = [
      `# Attendance Report: ${report.class.name} — ${report.class.site}`,
      `# Generated: ${new Date().toISOString()}`,
      `# Average Presence: ${report.summary.averagePresence}%`,
      `# Total Excused: ${report.summary.totalExcused}`,
      `# Critical Alerts (< 80%): ${report.summary.criticalAlerts}`,
      '',
      headers.join(','),
      ...rows.map((r) => r.join(',')),
    ];

    return csvLines.join('\n');
  }

  /**
   * Public: Report across all classes — for a system-wide dashboard.
   */
  async getSystemReport() {
    const classes = await this.prisma.class.findMany({
      include: {
        _count: { select: { enrollments: true } },
        teacher: { select: { name: true } },
      },
    });

    const classReports = await Promise.all(
      classes.map(async (cls) => {
        const { summary } = await this.getClassReport(cls.id);
        return { class: cls, summary };
      }),
    );

    const allRates = classReports
      .filter((r) => r.summary.totalStudents > 0)
      .map((r) => r.summary.averagePresence);
    const overallAverage =
      allRates.length > 0
        ? parseFloat(
            (allRates.reduce((a, b) => a + b, 0) / allRates.length).toFixed(1),
          )
        : 0;

    return {
      overallAverage,
      totalClasses: classes.length,
      classes: classReports,
    };
  }
}
