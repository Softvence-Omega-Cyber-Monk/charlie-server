// src/auth/auth.controller.ts
import {
  Controller, Post, Get, Patch, Body, UseGuards, Request,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterTeacherDto, UpdateTeacherDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new teacher account' })
  @ApiResponse({ status: 201, description: 'Teacher registered successfully' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  register(@Body() dto: RegisterTeacherDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login as a teacher' })
  @ApiResponse({ status: 200, description: 'Returns JWT token and teacher profile' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('teacher-jwt')
  @ApiOperation({ summary: 'Get current teacher profile' })
  getProfile(@Request() req) {
    return this.authService.getProfile(req.user.id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('teacher-jwt')
  @ApiOperation({ summary: 'Update teacher name or password' })
  updateProfile(@Request() req, @Body() dto: UpdateTeacherDto) {
    return this.authService.updateProfile(req.user.id, dto);
  }
}
