import { Module } from '@nestjs/common';
import { OrganisationsController } from './organisations.controller';
import { OrganisationsService } from './organisations.service';
import { PrismaModule } from '../prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [OrganisationsController],
    providers: [OrganisationsService],
})
export class OrganisationsModule { }