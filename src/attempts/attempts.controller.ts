import { Controller, Post, Get, Body, Param, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AttemptsService } from './attempts.service';
import { CreateAttemptDto } from './dto/create-attempt.dto';
import { CreateScenarioAttemptDto } from './dto/create-scenario-attempt.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';

@ApiTags('attempts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) // every route below requires a valid JWT
@Controller('attempts')
export class AttemptsController {
    constructor(private readonly attemptsService: AttemptsService) { }

    @Post()
    @ApiOperation({ summary: 'Start a new attempt for a module' })
    create(@Request() req, @Body() createAttemptDto: CreateAttemptDto) {
        return this.attemptsService.createAttempt(req.user.userId, createAttemptDto);
    }

    @Post(':id/scenario-attempts')
    @ApiOperation({ summary: 'Record an answer to one scenario within an attempt' })
    submitScenarioAttempt(
        @Request() req,
        @Param('id') id: string,
        @Body() dto: CreateScenarioAttemptDto,
    ) {
        return this.attemptsService.submitScenarioAttempt(req.user.userId, +id, dto);
    }

    @Get(':id')
    @ApiOperation({ summary: 'View one attempt and its results (own attempts, or any attempt if trainer from the same organisation)' })
    findOne(@Request() req, @Param('id') id: string) {
        const isTrainer = req.user.role === 'trainer';
        return this.attemptsService.findOne(+id, req.user.userId, isTrainer, req.user.organisation);
    }
}