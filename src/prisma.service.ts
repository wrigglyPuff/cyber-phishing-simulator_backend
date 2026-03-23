import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    // Connect when the module initializes
    async onModuleInit() {
        await this.$connect();
    }

    // Disconnect when the module is destroyed
    async onModuleDestroy() {
        await this.$disconnect();
    }
}