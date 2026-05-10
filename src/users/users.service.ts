import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {

    constructor(private readonly prisma: PrismaService) {
    }
    //Finds user by email
    findByEmail = (email: string) => this.prisma.user.findUnique({ where: { email } });
    private isValidPassword(password: string): boolean {
        const minLength = password.length >= 6;
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%*?]/.test(password);
        return minLength && hasNumber && hasSpecialChar;
    }
    async create(username: string, email: string, password: string) {
        if (!this.isValidPassword(password)) {
            throw new BadRequestException('Password must be at least 6 charachters and include at least 1 number and 1 special charachter (!@#$%*?)');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        return await this.prisma.user.create({ data: { username: username, email: email, passwordHash: hashedPassword } });
    }
}
