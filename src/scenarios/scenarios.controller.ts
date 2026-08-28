import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { ScenariosService } from './scenarios.service';
import { CreateScenarioDto } from './dto/create-scenario.dto';
import { UpdateScenarioDto } from './dto/update-scenario.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorators';
import { Role } from '@prisma/client';

@ApiTags('scenarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) //every route below requires a valid JWT
@Controller('scenarios')
export class ScenariosController {
  constructor(private readonly scenariosService: ScenariosService) { }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.TRAINER, Role.GLOBAL_ADMIN) //only trainers can create scenarios
  @ApiOperation({ summary: 'Create a new scenario (trainer only)' })
  create(@Request() req, @Body() createScenarioDto: CreateScenarioDto) {
    return this.scenariosService.create(
      createScenarioDto,
      req.user.organisationId,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'List all scenarios, optionally filtered by module',
  })
  @ApiQuery({ name: 'moduleId', required: false, type: Number })
  findAll(
    @Request() req,
    @Query('moduleId', new ParseIntPipe({ optional: true })) moduleId?: number,
  ) {
    return this.scenariosService.findAll(
      req.user.organisationId,
      req.user.userId,
      req.user.role,
      moduleId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single scenario' })
  findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.scenariosService.findOne(
      id,
      req.user.organisationId,
      req.user.userId,
      req.user.role
    );
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.TRAINER, Role.GLOBAL_ADMIN) //only trainers can update scenarios
  @ApiOperation({ summary: 'Update a scenario (trainer only)' })
  update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateScenarioDto: UpdateScenarioDto,
  ) {
    return this.scenariosService.update(
      id,
      updateScenarioDto,
      req.user.organisationId,
    );
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.TRAINER, Role.GLOBAL_ADMIN) //only trainers can delete scenarios
  @ApiOperation({ summary: 'Delete a scenario (trainer only)' })
  remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.scenariosService.remove(id, req.user.organisationId);
  }
}
