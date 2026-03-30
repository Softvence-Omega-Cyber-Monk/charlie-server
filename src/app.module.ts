// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ClassesModule } from './classes/classes.module';
import { SchedulesModule } from './schedules/schedules.module';
import { StudentsModule } from './students/students.module';
import { AttendanceModule } from './attendance/attendance.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ClassesModule,
    SchedulesModule,
    StudentsModule,
    AttendanceModule,
    ReportsModule,
  ],
})
export class AppModule {}
