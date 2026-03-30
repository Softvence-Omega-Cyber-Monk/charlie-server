// src/auth/dto/auth.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'teacher@tdaacademy.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;
}

export class RegisterTeacherDto {
  @ApiProperty({ example: 'teacher@tdaacademy.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Mr. Campbell' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;
}

export class UpdateTeacherDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false, minLength: 6 })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}
