import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiOkResponse,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorators';
import { Role } from '@prisma/client';
import { OrgOverviewDto } from './dto/org-overview.dto';
import { ModulesBreakdownDto } from './dto/modules-breakdown.dto';
import { ModuleDetailDto } from './dto/module-detail.dto';
import { UsersBreakdownDto } from './dto/users-breakdown.dto';
import { UserDetailReportDto } from './dto/user-detail-report.dto';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.TRAINER, Role.GLOBAL_ADMIN)
@Controller('organisations/:orgId/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) { }

  @Get('overview')
  @ApiOperation({
    summary: 'Org-wide headline numbers for a date range (trainer/admin)',
  })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiOkResponse({ type: OrgOverviewDto })
  getOverview(
    @Request() req,
    @Param('orgId', ParseIntPipe) orgId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getOverview(orgId, req.user, startDate, endDate);
  }

  @Get('modules')
  @ApiOperation({
    summary:
      'Per-module completion/score/pass rates for a date range (trainer/admin)',
  })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiOkResponse({ type: ModulesBreakdownDto })
  getModules(
    @Request() req,
    @Param('orgId', ParseIntPipe) orgId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getModulesBreakdown(
      orgId,
      req.user,
      startDate,
      endDate,
    );
  }

  @Get('modules/:moduleId')
  @ApiOperation({
    summary:
      'Score distribution and status breakdown for one module (trainer/admin)',
  })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiOkResponse({ type: ModuleDetailDto })
  getModuleDetail(
    @Request() req,
    @Param('orgId', ParseIntPipe) orgId: number,
    @Param('moduleId', ParseIntPipe) moduleId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getModuleDetail(
      orgId,
      moduleId,
      req.user,
      startDate,
      endDate,
    );
  }

  @Get('users')
  @ApiOperation({
    summary:
      'Per-learner completion/score/at-risk flags for a date range (trainer/admin)',
  })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['notStarted', 'inProgress', 'completed'],
  })
  @ApiOkResponse({ type: UsersBreakdownDto })
  getUsers(
    @Request() req,
    @Param('orgId', ParseIntPipe) orgId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
  ) {
    return this.reportsService.getUsersBreakdown(
      orgId,
      req.user,
      startDate,
      endDate,
      status,
    );
  }

  @Get('users/:userId')
  @ApiOperation({
    summary: "One learner's per-module scores and status",
  })
  @ApiOkResponse({ type: UserDetailReportDto })
  getUserDetail(
    @Request() req,
    @Param('orgId', ParseIntPipe) orgId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.reportsService.getUserDetail(orgId, userId, req.user);
  }

  @Get('export')
  @ApiOperation({
    summary: 'Export overview + module breakdown as CSV (trainer/admin)',
  })
  @ApiQuery({ name: 'format', required: true, enum: ['csv'] })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'moduleId', required: false, type: Number })
  async exportCsv(
    @Request() req,
    @Res() res: Response,
    @Param('orgId', ParseIntPipe) orgId: number,
    @Query('format') format: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('moduleId') moduleId?: string,
  ) {
    if (format !== 'csv') {
      throw new BadRequestException('Only format=csv is currently supported');
    }
    const csv = await this.reportsService.getExportCsv(
      orgId,
      req.user,
      startDate,
      endDate,
      moduleId ? parseInt(moduleId, 10) : undefined,
    );
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="report.csv"');
    res.send(csv);
  }
}