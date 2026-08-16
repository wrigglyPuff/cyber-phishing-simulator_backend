import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateAttemptDto } from './dto/create-attempt.dto';
import { CreateScenarioAttemptDto } from './dto/create-scenario-attempt.dto';

@Injectable()
export class AttemptsService {
    constructor(private prisma: PrismaService) { }

    // Create a new attempt row when a learner starts a module
    async createAttempt(userId: number, dto: CreateAttemptDto) {
        const module = await this.prisma.module.findUnique({ where: { id: dto.moduleId } });
        if (!module) {
            throw new NotFoundException(`Module with ID ${dto.moduleId} not found`);
        }

        return this.prisma.attempt.create({
            data: {
                userId,
                moduleId: dto.moduleId,
            },
        });
    }

    //Learner submits an answer for a scenario within an attempt
    async submitScenarioAttempt(
        userId: number,
        attemptId: number,
        dto: CreateScenarioAttemptDto
    ) {
        const attempt = await this.ensureOwnedByUser(attemptId, userId);

        //Check learners selection belongs to the correct scenario
        const choice = await this.prisma.scenarioChoice.findUnique({
            where: { id: dto.choiceId },
            include: { scenario: true },
        });
        if (!choice || choice.scenarioId !== dto.scenarioId) {
            throw new NotFoundException(`Your chosen selection does not belong to the correct scenario`);
        }
        return this.prisma.scenarioAttempt.create({
            data: {
                attemptId: attempt.id,
                scenarioId: dto.scenarioId,
                choiceId: dto.choiceId,
                isCorrect: choice.isCorrect,
                timeTakenSeconds: dto.timeTakenSeconds ?? 0,
            },
        });
    }

    //Results Summary for one attempt and all answers submitted for each scenario
    async findOne(attemptId: number, userId: number, isTrainer: boolean) {
        const attempt = await this.prisma.attempt.findUnique({
            where: { id: attemptId },
            include: {
                scenarioAttempts: true
            },
        });
        if (!attempt) {
            throw new NotFoundException(`Your attempt was not found for ${attemptId}`);
        }
        if (!isTrainer && attempt.userId !== userId) {
            throw new ForbiddenException(`You do not have permission to view this attempt`);
        }
        return attempt;
    }

    //Fetch an attempt and confirm it belongs to the user making the request
    private async ensureOwnedByUser(attemptId: number, userId: number) {
        const attempt = await this.prisma.attempt.findUnique({
            where: { id: attemptId }
        });
        if (!attempt) {
            throw new NotFoundException(`Your attempt was not found for ${attemptId}`);
        }
        if (attempt.userId !== userId) {
            throw new ForbiddenException(`You do not have permission to view this attempt`);
        }
        return attempt;
    }
}