// src/classes/dto/class.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateClassDto {
  @ApiProperty({ example: 'Rally 1' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Campbell Site' })
  @IsString()
  site: string;

  @ApiProperty({ example: 'Wing B', required: false })
  @IsOptional()
  @IsString()
  room?: string;

  @ApiProperty({ example: 'academic', required: false })
  @IsOptional()
  @IsString()
  icon?: string;
}

export class UpdateClassDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  site?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  room?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  icon?: string;
}
