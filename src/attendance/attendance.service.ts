// src/attendance/attendance.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitAttendanceDto } from './dto/attendance.dto';
import { AttendanceStatus } from '@prisma/client';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  /**
   * Public: Submit attendance for a schedule session.
   * Uses upsert so re-submissions overwrite existing records.
   */
  async submit(dto: SubmitAttendanceDto) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id: dto.scheduleId },
      include: { class: true },
    });
    if (!schedule) throw new NotFoundException('Schedule not found');

    const sessionDate = new Date(dto.date);
    if (isNaN(sessionDate.getTime()))
      throw new BadRequestException('Invalid date');

    // Validate excused records have a reason
    for (const record of dto.records) {
      if (record.status === AttendanceStatus.EXCUSED && !record.reason) {
        throw new BadRequestException(
          `Student ${record.studentId} marked EXCUSED but no reason provided`,
        );
      }
    }

    // Verify all students are enrolled in the class
    const enrollments = await this.prisma.enrollment.findMany({
      where: { classId: schedule.classId },
      select: { studentId: true },
    });
    const enrolledIds = new Set(enrollments.map((e) => e.studentId));

    for (const record of dto.records) {
      if (!enrolledIds.has(record.studentId)) {
        throw new BadRequestException(
          `Student ${record.studentId} is not enrolled in this class`,
        );
      }
    }

    // Upsert all records in a transaction
    const results = await this.prisma.$transaction(
      dto.records.map((record) =>
        this.prisma.attendance.upsert({
          where: {
            studentId_scheduleId_date: {
              studentId: record.studentId,
              scheduleId: dto.scheduleId,
              date: sessionDate,
            },
          },
          update: {
            status: record.status,
            reason: record.reason ?? null,
          },
          create: {
            studentId: record.studentId,
            scheduleId: dto.scheduleId,
            date: sessionDate,
            status: record.status,
            reason: record.reason ?? null,
          },
          include: { student: true },
        }),
      ),
    );

    return {
      message: 'Attendance submitted successfully',
      date: dto.date,
      scheduleId: dto.scheduleId,
      classId: schedule.classId,
      className: schedule.class.name,
      records: results,
    };
  }

  /**
   * Public: Get attendance for a specific schedule + date.
   */
  async getForSession(scheduleId: string, date: string) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id: scheduleId },
    });
    if (!schedule) throw new NotFoundException('Schedule not found');

    const sessionDate = new Date(date);
    if (isNaN(sessionDate.getTime()))
      throw new BadRequestException('Invalid date');

    return this.prisma.attendance.findMany({
      where: { scheduleId, date: sessionDate },
      include: { student: true },
      orderBy: { student: { name: 'asc' } },
    });
  }

  /**
   * Public: Get full attendance history for a student in a class.
   */
  async getStudentHistory(studentId: string, classId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student) throw new NotFoundException('Student not found');

    const schedules = await this.prisma.schedule.findMany({
      where: { classId },
      select: { id: true },
    });
    const scheduleIds = schedules.map((s) => s.id);

    const records = await this.prisma.attendance.findMany({
      where: { studentId, scheduleId: { in: scheduleIds } },
      include: {
        schedule: true,
      },
      orderBy: { date: 'desc' },
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
      total > 0 ? ((totalPresent / total) * 100).toFixed(1) : '0.0';

    return {
      student,
      classId,
      summary: { totalPresent, totalAbsent, totalExcused, total, attendanceRate },
      records,
    };
  }
}
