import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TokensService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly config: ConfigService,
    ) { }

    //Generates a random and secure token, used for password resetting 
    private generateRawToken(): string {
        return randomBytes(32).toString('hex');
    }

    //SHA-256 so we can look a token up by its hash in one query
    private hash(rawToken: string): string {
        return createHash('sha256').update(rawToken).digest('hex');
    }

    //Refresh tokens

    async issueRefreshToken(userId: number): Promise<string> {
        const days = Number(this.config.get('REFRESH_TOKEN_TTL_DAYS') ?? 7);
        const rawToken = this.generateRawToken();

        await this.prisma.refreshToken.create({
            data: {
                tokenHash: this.hash(rawToken),
                userId,
                expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
            },
        });

        return rawToken;
    }

    // Returns the userId if valid, or null if invalid
    async validateRefreshToken(rawToken: string): Promise<number | null> {
        const record = await this.prisma.refreshToken.findUnique({
            where: { tokenHash: this.hash(rawToken) },
        });

        if (!record) return null;
        if (record.revokedAt !== null) return null;
        if (record.expiresAt.getTime() < Date.now()) return null;

        return record.userId;
    }

    async revokeRefreshToken(rawToken: string): Promise<void> {
        await this.prisma.refreshToken.updateMany({
            where: { tokenHash: this.hash(rawToken), revokedAt: null },
            data: { revokedAt: new Date() },
        });
    }

    async revokeAllRefreshTokensForUser(userId: number): Promise<void> {
        await this.prisma.refreshToken.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: new Date() },
        });
    }

    //Password reset tokens

    async issueResetToken(userId: number): Promise<string> {
        const minutes = Number(this.config.get('RESET_TOKEN_TTL_MINUTES') ?? 30);
        const rawToken = this.generateRawToken();

        await this.prisma.passwordResetToken.create({
            data: {
                tokenHash: this.hash(rawToken),
                userId,
                expiresAt: new Date(Date.now() + minutes * 60 * 1000),
            },
        });

        return rawToken;
    }

    //Checks if password reset token is valid & and unused, marks token as ised and resturns userId
    async consumeResetToken(rawToken: string): Promise<number | null> {
        const record = await this.prisma.passwordResetToken.findUnique({
            where: { tokenHash: this.hash(rawToken) },
        });

        if (!record) return null;
        if (record.usedAt !== null) return null;
        if (record.expiresAt.getTime() < Date.now()) return null;

        await this.prisma.passwordResetToken.update({
            where: { id: record.id },
            data: { usedAt: new Date() },
        });

        return record.userId;
    }
}