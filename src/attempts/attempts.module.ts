import { Module } from '@nestjs/common';
import { AttemptsService } from './attempts.service';
import { AttemptsController } from './attempts.controller';
import { PrismaModule } from '../prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [AttemptsController],
    providers: [AttemptsService],
})
export class AttemptsModule { }