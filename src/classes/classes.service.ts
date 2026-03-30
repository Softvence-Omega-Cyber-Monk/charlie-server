// src/classes/classes.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DayOfWeek } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClassDto, UpdateClassDto } from './dto/class.dto';

// Maps JS getDay() (0=Sun ... 6=Sat) to Prisma DayOfWeek enum
const JS_DAY_TO_ENUM: Record<number, DayOfWeek> = {
  0: DayOfWeek.SUNDAY,
  1: DayOfWeek.MONDAY,
  2: DayOfWeek.TUESDAY,
  3: DayOfWeek.WEDNESDAY,
  4: DayOfWeek.THURSDAY,
  5: DayOfWeek.FRIDAY,
  6: DayOfWeek.SATURDAY,
};

@Injectable()
export class ClassesService {
  constructor(private prisma: PrismaService) {}

  // Public: list ALL classes
  async findAll() {
    return this.prisma.class.findMany({
      include: {
        schedules: true,
        teacher: { select: { id: true, name: true } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Public: classes that have a schedule TODAY (or on a given date).
   *
   * Optional query param `date` (YYYY-MM-DD) — defaults to server today.
   *
   * Each returned class includes a `todaySchedule` object:
   *   - scheduleId  : pass this to the Attendance Marking page
   *   - dayOfWeek
   *   - startTime / endTime  : display "4:05 PM – 5:00 PM"
   *   - date        : resolved calendar date (YYYY-MM-DD)
   *
   * This is what the "Select Class" home page calls on load.
   */
  async findTodayClasses(dateParam?: string): Promise<any[]> {
    let target: Date;
    if (dateParam) {
      target = new Date(dateParam);
      if (isNaN(target.getTime())) target = new Date();
    } else {
      target = new Date();
    }

    const dayOfWeek = JS_DAY_TO_ENUM[target.getDay()];

    const schedules = await this.prisma.schedule.findMany({
      where: { dayOfWeek },
      include: {
        class: {
          include: {
            teacher: { select: { id: true, name: true } },
            _count: { select: { enrollments: true } },
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    // Deduplicate: if a class has two slots on the same day, show it once
    const seen = new Set<string>();
    const result: any[] = [];

    for (const sched of schedules) {
      if (seen.has(sched.classId)) continue;
      seen.add(sched.classId);

      result.push({
        ...sched.class,
        todaySchedule: {
          scheduleId: sched.id,
          dayOfWeek: sched.dayOfWeek,
          startTime: sched.startTime,
          endTime: sched.endTime,
        },
        date: target.toISOString().split('T')[0],
      });
    }

    return result;
  }

  // Public: get single class with schedules
  async findOne(id: string) {
    const cls = await this.prisma.class.findUnique({
      where: { id },
      include: {
        schedules: { orderBy: { dayOfWeek: 'asc' } },
        teacher: { select: { id: true, name: true } },
        _count: { select: { enrollments: true } },
      },
    });
    if (!cls) throw new NotFoundException('Class not found');
    return cls;
  }

  // Teacher: create a class
  async create(teacherId: string, dto: CreateClassDto) {
    return this.prisma.class.create({
      data: { ...dto, teacherId },
      include: { schedules: true },
    });
  }

  // Teacher: update own class
  async update(teacherId: string, classId: string, dto: UpdateClassDto) {
    await this.assertOwnership(teacherId, classId);
    return this.prisma.class.update({
      where: { id: classId },
      data: dto,
      include: { schedules: true },
    });
  }

  // Teacher: delete own class
  async remove(teacherId: string, classId: string) {
    await this.assertOwnership(teacherId, classId);
    await this.prisma.class.delete({ where: { id: classId } });
    return { message: 'Class deleted successfully' };
  }

  // Teacher: list only their own classes
  async findByTeacher(teacherId: string) {
    return this.prisma.class.findMany({
      where: { teacherId },
      include: {
        schedules: true,
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async assertOwnership(teacherId: string, classId: string) {
    const cls = await this.prisma.class.findUnique({ where: { id: classId } });
    if (!cls) throw new NotFoundException('Class not found');
    if (cls.teacherId !== teacherId)
      throw new ForbiddenException('You do not own this class');
    return cls;
  }
}
