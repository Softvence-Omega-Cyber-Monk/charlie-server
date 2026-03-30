// src/attendance/attendance.controller.ts
import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { SubmitAttendanceDto } from './dto/attendance.dto';

@ApiTags('Attendance')
@Controller('attendance')
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Post('submit')
  @ApiOperation({
    summary:
      'Submit attendance for a session (public — no auth required, as per design)',
  })
  submit(@Body() dto: SubmitAttendanceDto) {
    return this.attendanceService.submit(dto);
  }

  @Get('session')
  @ApiOperation({ summary: 'Get attendance records for a specific session (public)' })
  @ApiQuery({ name: 'scheduleId', required: true })
  @ApiQuery({ name: 'date', required: true, example: '2023-10-27' })
  getForSession(
    @Query('scheduleId') scheduleId: string,
    @Query('date') date: string,
  ) {
    return this.attendanceService.getForSession(scheduleId, date);
  }

  @Get('student/:studentId/class/:classId')
  @ApiOperation({ summary: 'Get attendance history for a student in a class (public)' })
  getStudentHistory(
    @Param('studentId') studentId: string,
    @Param('classId') classId: string,
  ) {
    return this.attendanceService.getStudentHistory(studentId, classId);
  }
}
