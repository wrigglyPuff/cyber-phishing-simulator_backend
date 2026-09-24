import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiOkResponse,
} from '@nestjs/swagger';

import { ResultsService } from './results.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorators';
import { Role } from '@prisma/client';
import { LearnerResultsSummaryDto } from './dto/learner-results-summary.dto';
import { ModuleResultsSummaryDto } from './dto/module-results-summary.dto';

@ApiTags('Results')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('results')
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) { }

  @Post('attempts/:attemptId/finalise')
  @ApiOperation({ summary: 'Finalise an attempt and store the result' })
  finalise(@Request() req, @Param('attemptId') attemptId: string) {
    return this.resultsService.finaliseAttempt(+attemptId, req.user.userId);
  }

  @Get('me')
  @ApiOperation({
    summary: "Detailed results for learner, sorted by module and scenario",
  })
  @ApiQuery({ name: 'moduleId', required: false, type: Number })
  @ApiOkResponse({ type: LearnerResultsSummaryDto })
  getMyResults(@Request() req, @Query('moduleId') moduleId?: string,) {
    return this.resultsService.getMySummary(
      req.user.userId,
      moduleId ? +moduleId : undefined,
    );
  }

  @Get('user/:userId')
  @UseGuards(RolesGuard)
  @Roles(Role.TRAINER, Role.GLOBAL_ADMIN)
  @ApiOperation({
    summary:
      "Trainer's view of a specific learner's results (same organisation only)"
  })
  @ApiQuery({ name: 'moduleId', required: false, type: Number })
  @ApiOkResponse({ type: LearnerResultsSummaryDto })
  getLearnersSummary(
    @Request() req,
    @Param('userId') userId: string,
    @Query('moduleId') moduleId?: string,
  ) {
    return this.resultsService.getLearnerSummary(
      +userId,
      req.user.organisationId,
      moduleId ? +moduleId : undefined,
    );
  }

  @Get('module/:moduleId')
  @UseGuards(RolesGuard)
  @Roles(Role.TRAINER, Role.GLOBAL_ADMIN)
  @ApiOperation({
    summary:
      "Trainer's view of all learner's results for a specific module (same organisation only)",
  })
  @ApiOkResponse({ type: ModuleResultsSummaryDto })
  getModuleResults(@Request() req, @Param('moduleId') moduleId: string) {
    return this.resultsService.getModuleResults(
      +moduleId,
      req.user.organisationId,
    );
  }
}
