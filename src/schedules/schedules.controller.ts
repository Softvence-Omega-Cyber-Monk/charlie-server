// src/schedules/schedules.controller.ts
import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, UseGuards, Request,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiBearerAuth,
} from '@nestjs/swagger';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto, UpdateScheduleDto } from './dto/schedule.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Schedules')
@Controller('classes/:classId/schedules')
export class SchedulesController {
  constructor(private schedulesService: SchedulesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all schedules for a class (public)' })
  findByClass(@Param('classId') classId: string) {
    return this.schedulesService.findByClass(classId);
  }

  @Get(':scheduleId')
  @ApiOperation({ summary: 'Get a single schedule (public)' })
  findOne(
    @Param('classId') classId: string,
    @Param('scheduleId') scheduleId: string,
  ) {
    return this.schedulesService.findOne(scheduleId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('teacher-jwt')
  @ApiOperation({ summary: 'Add a schedule to a class (teacher must own class)' })
  create(
    @Request() req,
    @Param('classId') classId: string,
    @Body() dto: CreateScheduleDto,
  ) {
    return this.schedulesService.create(req.user.id, classId, dto);
  }

  @Patch(':scheduleId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('teacher-jwt')
  @ApiOperation({ summary: 'Update a schedule (teacher must own class)' })
  update(
    @Request() req,
    @Param('classId') classId: string,
    @Param('scheduleId') scheduleId: string,
    @Body() dto: UpdateScheduleDto,
  ) {
    return this.schedulesService.update(req.user.id, classId, scheduleId, dto);
  }

  @Delete(':scheduleId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('teacher-jwt')
  @ApiOperation({ summary: 'Delete a schedule (teacher must own class)' })
  remove(
    @Request() req,
    @Param('classId') classId: string,
    @Param('scheduleId') scheduleId: string,
  ) {
    return this.schedulesService.remove(req.user.id, classId, scheduleId);
  }
}
