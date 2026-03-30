// src/schedules/schedules.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleDto, UpdateScheduleDto } from './dto/schedule.dto';

@Injectable()
export class SchedulesService {
  constructor(private prisma: PrismaService) {}

  // Public: get schedules for a class
  async findByClass(classId: string) {
    await this.assertClassExists(classId);
    return this.prisma.schedule.findMany({
      where: { classId },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  // Public: get single schedule
  async findOne(scheduleId: string) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: { class: true },
    });
    if (!schedule) throw new NotFoundException('Schedule not found');
    return schedule;
  }

  // Teacher: add schedule to own class
  async create(teacherId: string, classId: string, dto: CreateScheduleDto) {
    await this.assertTeacherOwnsClass(teacherId, classId);
    return this.prisma.schedule.create({
      data: { ...dto, classId },
    });
  }

  // Teacher: update schedule on own class
  async update(
    teacherId: string,
    classId: string,
    scheduleId: string,
    dto: UpdateScheduleDto,
  ) {
    await this.assertTeacherOwnsClass(teacherId, classId);
    await this.assertScheduleBelongsToClass(scheduleId, classId);
    return this.prisma.schedule.update({
      where: { id: scheduleId },
      data: dto,
    });
  }

  // Teacher: delete schedule
  async remove(teacherId: string, classId: string, scheduleId: string) {
    await this.assertTeacherOwnsClass(teacherId, classId);
    await this.assertScheduleBelongsToClass(scheduleId, classId);
    await this.prisma.schedule.delete({ where: { id: scheduleId } });
    return { message: 'Schedule deleted successfully' };
  }

  private async assertClassExists(classId: string) {
    const cls = await this.prisma.class.findUnique({ where: { id: classId } });
    if (!cls) throw new NotFoundException('Class not found');
    return cls;
  }

  private async assertTeacherOwnsClass(teacherId: string, classId: string) {
    const cls = await this.assertClassExists(classId);
    if (cls.teacherId !== teacherId)
      throw new ForbiddenException('You do not own this class');
    return cls;
  }

  private async assertScheduleBelongsToClass(scheduleId: string, classId: string) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id: scheduleId },
    });
    if (!schedule || schedule.classId !== classId)
      throw new NotFoundException('Schedule not found in this class');
    return schedule;
  }
}
