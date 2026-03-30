// src/auth/auth.service.ts
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterTeacherDto, UpdateTeacherDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterTeacherDto) {
    const existing = await this.prisma.teacher.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const teacher = await this.prisma.teacher.create({
      data: { email: dto.email, name: dto.name, passwordHash },
    });

    const token = this.signToken(teacher.id, teacher.email);
    return { teacher: this.sanitize(teacher), token };
  }

  async login(dto: LoginDto) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { email: dto.email },
    });
    if (!teacher) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, teacher.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const token = this.signToken(teacher.id, teacher.email);
    return { teacher: this.sanitize(teacher), token };
  }

  async getProfile(teacherId: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
      include: { _count: { select: { classes: true } } },
    });
    if (!teacher) throw new NotFoundException('Teacher not found');
    return this.sanitize(teacher);
  }

  async updateProfile(teacherId: string, dto: UpdateTeacherDto) {
    const data: any = {};
    if (dto.name) data.name = dto.name;
    if (dto.password) data.passwordHash = await bcrypt.hash(dto.password, 10);

    const teacher = await this.prisma.teacher.update({
      where: { id: teacherId },
      data,
    });
    return this.sanitize(teacher);
  }

  private signToken(id: string, email: string): string {
    return this.jwtService.sign({ sub: id, email });
  }

  private sanitize(teacher: any) {
    const { passwordHash, ...safe } = teacher;
    return safe;
  }
}
