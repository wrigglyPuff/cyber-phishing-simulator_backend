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
  ForbiddenException,
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

@ApiTags('Scenarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) //every route below requires a valid JWT
@Controller('scenarios')
export class ScenariosController {
  constructor(private readonly scenariosService: ScenariosService) { }

  //A global admin works across every organisation, so their own
  //organisationId never restricts which scenarios they can reach. null
  //means "every organisation" to the service, so anyone else without an
  //organisation is refused rather than treated like an admin.
  private scopeFor(user: { role: string; organisationId: number | null }) {
    if (user.role === Role.GLOBAL_ADMIN) {
      return null;
    }
    if (user.organisationId == null) {
      throw new ForbiddenException('Your account is not linked to an organisation');
    }
    return user.organisationId;
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.TRAINER, Role.GLOBAL_ADMIN) //only trainers can create scenarios
  @ApiOperation({ summary: 'Create a new scenario (trainer & admin only)' })
  create(@Request() req, @Body() createScenarioDto: CreateScenarioDto) {
    return this.scenariosService.create(
      createScenarioDto,
      this.scopeFor(req.user),
    );
  }

  @Get()
  @ApiOperation({
    summary: 'List all scenarios, optionally filtered by module',
  })
  @ApiQuery({ name: 'moduleId', required: false, type: Number })
  @ApiQuery({
    name: 'organisationId',
    required: false,
    type: Number,
    description: 'Global admin only: limit the list to one organisation',
  })
  findAll(
    @Request() req,
    @Query('moduleId', new ParseIntPipe({ optional: true })) moduleId?: number,
    @Query('organisationId', new ParseIntPipe({ optional: true }))
    organisationId?: number,
  ) {
    const scope =
      req.user.role === Role.GLOBAL_ADMIN
        ? (organisationId ?? null)
        : this.scopeFor(req.user);
    return this.scenariosService.findAll(
      scope,
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
      this.scopeFor(req.user),
      req.user.userId,
      req.user.role
    );
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.TRAINER, Role.GLOBAL_ADMIN) //only trainers can update scenarios
  @ApiOperation({ summary: 'Update a scenario (trainer & admin only)' })
  update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateScenarioDto: UpdateScenarioDto,
  ) {
    return this.scenariosService.update(
      id,
      updateScenarioDto,
      this.scopeFor(req.user),
    );
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.TRAINER, Role.GLOBAL_ADMIN) //only trainers can delete scenarios
  @ApiOperation({ summary: 'Delete a scenario (trainer & admin only)' })
  remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.scenariosService.remove(id, this.scopeFor(req.user));
  }
}
