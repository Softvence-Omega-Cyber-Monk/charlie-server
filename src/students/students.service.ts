// src/students/students.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto, UpdateStudentDto } from './dto/student.dto';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  // Public: list students enrolled in a class
  async findByClass(classId: string) {
    const cls = await this.prisma.class.findUnique({ where: { id: classId } });
    if (!cls) throw new NotFoundException('Class not found');

    const enrollments = await this.prisma.enrollment.findMany({
      where: { classId },
      include: { student: true },
      orderBy: { student: { name: 'asc' } },
    });
    return enrollments.map((e) => e.student);
  }

  // Public: get a single student
  async findOne(id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        enrollments: { include: { class: true } },
      },
    });
    if (!student) throw new NotFoundException('Student not found');
    return student;
  }

  // Teacher: create a student and optionally enroll
  async create(dto: CreateStudentDto) {
    const existing = await this.prisma.student.findUnique({
      where: { studentCode: dto.studentCode },
    });
    if (existing) throw new ConflictException('Student code already exists');

    return this.prisma.student.create({ data: dto });
  }

  // Teacher: update student details
  async update(id: string, dto: UpdateStudentDto) {
    await this.findOne(id);
    return this.prisma.student.update({ where: { id }, data: dto });
  }

  // Teacher: delete student
  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.student.delete({ where: { id } });
    return { message: 'Student deleted successfully' };
  }

  // Teacher: enroll a student into a class (teacher must own class)
  async enroll(teacherId: string, classId: string, studentId: string) {
    await this.assertTeacherOwnsClass(teacherId, classId);
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student) throw new NotFoundException('Student not found');

    const existing = await this.prisma.enrollment.findUnique({
      where: { studentId_classId: { studentId, classId } },
    });
    if (existing) throw new ConflictException('Student already enrolled');

    return this.prisma.enrollment.create({
      data: { studentId, classId },
      include: { student: true, class: true },
    });
  }

  // Teacher: remove a student from a class
  async unenroll(teacherId: string, classId: string, studentId: string) {
    await this.assertTeacherOwnsClass(teacherId, classId);
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { studentId_classId: { studentId, classId } },
    });
    if (!enrollment) throw new NotFoundException('Enrollment not found');

    await this.prisma.enrollment.delete({
      where: { studentId_classId: { studentId, classId } },
    });
    return { message: 'Student unenrolled successfully' };
  }

  private async assertTeacherOwnsClass(teacherId: string, classId: string) {
    const cls = await this.prisma.class.findUnique({ where: { id: classId } });
    if (!cls) throw new NotFoundException('Class not found');
    if (cls.teacherId !== teacherId)
      throw new ForbiddenException('You do not own this class');
    return cls;
  }
}
