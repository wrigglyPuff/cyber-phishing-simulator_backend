import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AttemptsService } from './attempts.service';
import { CreateAttemptDto } from './dto/create-attempt.dto';
import { CreateScenarioAttemptDto } from './dto/create-scenario-attempt.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { FindAttemptsDto } from './find-attempts.dto';

@ApiTags('Attempts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) // every route below requires a valid JWT
@Controller('attempts')
export class AttemptsController {
  constructor(private readonly attemptsService: AttemptsService) { }

  @Post()
  @ApiOperation({ summary: 'Start a new attempt for a module' })
  create(@Request() req, @Body() createAttemptDto: CreateAttemptDto) {
    return this.attemptsService.createAttempt(
      req.user.userId,
      createAttemptDto,
    );
  }

  @Post(':id/scenario-attempts')
  @ApiOperation({
    summary: 'Record an answer to one scenario within an attempt',
  })
  submitScenarioAttempt(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: CreateScenarioAttemptDto,
  ) {
    return this.attemptsService.submitScenarioAttempt(
      req.user.userId,
      +id,
      dto,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'List scenario attempts for a module (own attempts, or a specific learner if trainer/globalAdmin)',
  })
  findAttemptsForModule(@Request() req, @Query() query: FindAttemptsDto) {
    return this.attemptsService.findAttemptsForModule(
      req.user.userId,
      req.user.role,
      query.moduleId,
      query.userId,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary:
      'View one attempt and its results (own attempts, or any attempt if trainer from the same organisation)',
  })
  findOne(@Request() req, @Param('id') id: string) {
    const isTrainer = req.user.role === 'trainer';
    return this.attemptsService.findOne(
      +id,
      req.user.userId,
      isTrainer,
      req.user.organisation,
    );
  }
}
