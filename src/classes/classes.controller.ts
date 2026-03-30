// src/classes/classes.controller.ts
import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, UseGuards, Request,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse,
} from '@nestjs/swagger';
import { ClassesService } from './classes.service';
import { CreateClassDto, UpdateClassDto } from './dto/class.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Classes')
@Controller('classes')
export class ClassesController {
  constructor(private classesService: ClassesService) {}

  // ── Public endpoints ──────────────────────────────────────────────────────

  @Get('today')
  @ApiOperation({
    summary: 'Classes scheduled for today — used by the Select Class home page',
    description:
      'Returns only classes that have a schedule on today\'s day-of-week. ' +
      'Each class includes a `todaySchedule` object with `scheduleId`, ' +
      '`startTime`, `endTime`, and `date` ready for the Attendance Marking page. ' +
      'Pass `?date=YYYY-MM-DD` to query any specific date instead of today.',
  })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'Optional date override (YYYY-MM-DD). Defaults to today.',
    example: '2023-10-27',
  })
  @ApiResponse({
    status: 200,
    description: 'Array of classes scheduled for the given day',
  })
  findTodayClasses(@Query('date') date?: string) {
    return this.classesService.findTodayClasses(date);
  }

  @Get()
  @ApiOperation({ summary: 'List ALL classes regardless of schedule (public)' })
  findAll() {
    return this.classesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single class with all schedules (public)' })
  findOne(@Param('id') id: string) {
    return this.classesService.findOne(id);
  }

  // ── Teacher-authenticated endpoints ───────────────────────────────────────

  @Get('teacher/mine')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('teacher-jwt')
  @ApiOperation({ summary: "List the authenticated teacher's own classes" })
  findMine(@Request() req) {
    return this.classesService.findByTeacher(req.user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('teacher-jwt')
  @ApiOperation({ summary: 'Create a new class' })
  @ApiResponse({ status: 201 })
  create(@Request() req, @Body() dto: CreateClassDto) {
    return this.classesService.create(req.user.id, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('teacher-jwt')
  @ApiOperation({ summary: 'Update a class (teacher must own it)' })
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateClassDto,
  ) {
    return this.classesService.update(req.user.id, id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('teacher-jwt')
  @ApiOperation({ summary: 'Delete a class (teacher must own it)' })
  remove(@Request() req, @Param('id') id: string) {
    return this.classesService.remove(req.user.id, id);
  }
}
