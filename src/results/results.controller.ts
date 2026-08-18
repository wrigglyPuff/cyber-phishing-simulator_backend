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
} from '@nestjs/swagger';
import { ResultsService } from './results.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorators';

@ApiTags('results')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('results')
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Post('attempts/:attemptId/finalize')
  @ApiOperation({ summary: 'Finalize an attempt and store the result' })
  finalize(@Request() req, @Param('attemptId') attemptId: string) {
    return this.resultsService.finalizeAttempt(+attemptId, req.user.userId);
  }

  @Get('me')
  @ApiOperation({
    summary: "Logged in learner's own results, per module and per scenario",
  })
  @ApiQuery({ name: 'moduleId', required: false, type: Number })
  getMyResults(@Request() req, @Query('moduleId') moduleId?: string) {
    return this.resultsService.getMySummary(
      req.user.userId,
      moduleId ? +moduleId : undefined,
    );
  }

  @Get('module/:moduleId')
  @UseGuards(RolesGuard)
  @Roles('trainer')
  @ApiOperation({
    summary:
      "Trainer's view of all learners' results for a specific module, by ID (same organisation only)",
  })
  @ApiQuery({ name: 'moduleId', required: false, type: Number })
  getLearnerSummary(
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
  @Roles('trainer')
  @ApiOperation({
    summary:
      "Trainer's view of all learner's results for a specific module (same organisation only)",
  })
  getModuleResults(@Request() req, @Param('moduleId') moduleId: string) {
    return this.resultsService.getModuleResults(
      +moduleId,
      req.user.organisationId,
    );
  }
}
