// src/students/dto/student.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateStudentDto {
  @ApiProperty({ example: '2023-0041' })
  @IsString()
  studentCode: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;
}

export class UpdateStudentDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  studentCode?: string;
}

export class EnrollStudentDto {
  @ApiProperty({ example: 'student-uuid-here' })
  @IsString()
  studentId: string;
}
