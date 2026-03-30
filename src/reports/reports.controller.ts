// src/reports/reports.controller.ts
import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('system')
  @ApiOperation({ summary: 'Get system-wide attendance overview (public)' })
  getSystemReport() {
    return this.reportsService.getSystemReport();
  }

  @Get('class/:classId')
  @ApiOperation({
    summary: 'Get full attendance report for a class (public) — mirrors Reports page',
  })
  getClassReport(@Param('classId') classId: string) {
    return this.reportsService.getClassReport(classId);
  }

  @Get('class/:classId/export/csv')
  @ApiOperation({ summary: 'Export class attendance report as CSV (public)' })
  async exportCsv(@Param('classId') classId: string, @Res() res: Response) {
    const csv = await this.reportsService.exportClassReportCsv(classId);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="attendance-report-${classId}.csv"`,
    );
    res.send(csv);
  }
}
