// src/students/students.controller.ts
import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, UseGuards, Request,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiBearerAuth,
} from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { CreateStudentDto, UpdateStudentDto, EnrollStudentDto } from './dto/student.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Students')
@Controller('students')
export class StudentsController {
  constructor(private studentsService: StudentsService) {}

  // Public: students in a class
  @Get('by-class/:classId')
  @ApiOperation({ summary: 'List students enrolled in a class (public)' })
  findByClass(@Param('classId') classId: string) {
    return this.studentsService.findByClass(classId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a student by ID (public)' })
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  // Teacher-only
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('teacher-jwt')
  @ApiOperation({ summary: 'Create a new student' })
  create(@Body() dto: CreateStudentDto) {
    return this.studentsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('teacher-jwt')
  @ApiOperation({ summary: 'Update a student' })
  update(@Param('id') id: string, @Body() dto: UpdateStudentDto) {
    return this.studentsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('teacher-jwt')
  @ApiOperation({ summary: 'Delete a student' })
  remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }

  // Enrollment management
  @Post('enroll/:classId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('teacher-jwt')
  @ApiOperation({ summary: 'Enroll a student in a class (teacher must own class)' })
  enroll(
    @Request() req,
    @Param('classId') classId: string,
    @Body() dto: EnrollStudentDto,
  ) {
    return this.studentsService.enroll(req.user.id, classId, dto.studentId);
  }

  @Delete('unenroll/:classId/:studentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('teacher-jwt')
  @ApiOperation({ summary: 'Remove a student from a class (teacher must own class)' })
  unenroll(
    @Request() req,
    @Param('classId') classId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.studentsService.unenroll(req.user.id, classId, studentId);
  }
}
