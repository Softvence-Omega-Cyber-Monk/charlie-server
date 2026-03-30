// src/attendance/dto/attendance.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString, IsEnum, IsOptional, IsDateString, IsArray, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceStatus } from '@prisma/client';

export class AttendanceRecordDto {
  @ApiProperty({ example: 'student-uuid' })
  @IsString()
  studentId: string;

  @ApiProperty({ enum: AttendanceStatus })
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @ApiProperty({
    example: 'Medical appointment',
    required: false,
    description: 'Required when status is EXCUSED',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class SubmitAttendanceDto {
  @ApiProperty({ example: 'schedule-uuid' })
  @IsString()
  scheduleId: string;

  @ApiProperty({ example: '2023-10-27', description: 'ISO date string YYYY-MM-DD' })
  @IsDateString()
  date: string;

  @ApiProperty({ type: [AttendanceRecordDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendanceRecordDto)
  records: AttendanceRecordDto[];
}

export class GetAttendanceQueryDto {
  @ApiProperty({ example: 'schedule-uuid' })
  @IsString()
  scheduleId: string;

  @ApiProperty({ example: '2023-10-27' })
  @IsDateString()
  date: string;
}
