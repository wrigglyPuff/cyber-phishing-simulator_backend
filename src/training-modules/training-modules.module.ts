import { Module } from '@nestjs/common';
import { TrainingModulesService } from './training-modules.service';
import { TrainingModulesController } from './training-modules.controller';
import { PrismaModule } from '../prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [TrainingModulesController],
    providers: [TrainingModulesService],
})

export class TrainingModulesModule { }