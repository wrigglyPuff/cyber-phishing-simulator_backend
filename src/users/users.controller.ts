import {
  Controller,
  Get,
  UseGuards,
  Request,
  Query,
  Body,
  Post,
  Param,
  ParseIntPipe,
  Delete,
  Patch,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorators';
import { Role } from '@prisma/client';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TRAINER, Role.GLOBAL_ADMIN)
  @Post()
  createUser(@Request() req, @Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOneUser(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOneUser(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  updateUser(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(id, updateUserDto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TRAINER, Role.GLOBAL_ADMIN)
  @Delete(':id')
  removeUser(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.usersService.removeUser(id, req.user);
  }
}
