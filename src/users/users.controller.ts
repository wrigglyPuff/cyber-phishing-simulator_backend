import {
  Controller,
  Get,
  UseGuards,
  Request,
  Query,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorators';
import { Role } from '@prisma/client';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TRAINER, Role.GLOBAL_ADMIN)
  @Get('learners')
  getLearners(
    @Request() req,
    @Query('organisationId') organisationId?: string,
  ) {
    return this.usersService.findLearners(
      req.user,
      organisationId ? parseInt(organisationId, 10) : undefined,
    );
  }
}
