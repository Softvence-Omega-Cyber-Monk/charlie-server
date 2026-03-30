// src/schedules/dto/schedule.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, Matches } from 'class-validator';
import { DayOfWeek } from '@prisma/client';

export class CreateScheduleDto {
  @ApiProperty({ enum: DayOfWeek, example: 'MONDAY' })
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @ApiProperty({ example: '16:05', description: 'HH:MM format' })
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'startTime must be HH:MM' })
  startTime: string;

  @ApiProperty({ example: '17:00', description: 'HH:MM format' })
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'endTime must be HH:MM' })
  endTime: string;
}

export class UpdateScheduleDto {
  @ApiProperty({ enum: DayOfWeek, required: false })
  @IsOptional()
  @IsEnum(DayOfWeek)
  dayOfWeek?: DayOfWeek;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'startTime must be HH:MM' })
  startTime?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'endTime must be HH:MM' })
  endTime?: string;
}
