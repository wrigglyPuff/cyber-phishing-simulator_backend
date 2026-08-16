import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTrainingModuleDto } from './dto/create-training-module.dto';
import { UpdateTrainingModuleDto } from './dto/update-training-module.dto';

@Injectable()
export class TrainingModulesService {
    constructor(private prisma: PrismaService) { }

    //Trainers create a new module
    async create(createTrainingModuleDto: CreateTrainingModuleDto) {
        return this.prisma.module.create({
            data: createTrainingModuleDto,
        });
    }

    //All roles (both trainer and learners) need to list modules
    async findAll() {
        return this.prisma.module.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    //Single module with included scenarios for frontend to render
    async findOne(id: number) {
        const module = await this.prisma.module.findUnique({
            where: { id },
            include: { scenarios: true },
        });
        if (!module) {
            throw new NotFoundException(`Module ${id} not found`);
        }
        return module;
    }

    async update(id: number, updateTrainingModuleDto: UpdateTrainingModuleDto) {
        await this.ensureExists(id);

        return this.prisma.module.update({
            where: { id },
            data: updateTrainingModuleDto,
        });
    }

    async remove(id: number) {
        await this.ensureExists(id);

        return this.prisma.module.delete({
            where: { id },
        });
    }

    //clean 404 instead of Prisma's default error for not found
    private async ensureExists(id: number) {
        const module = await this.prisma.module.findUnique({
            where: { id },
        });
        if (!module) {
            throw new NotFoundException(`Module ${id} not found`);
        }
    }
}   