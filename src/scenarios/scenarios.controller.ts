import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ScenariosService } from './scenarios.service';
import { CreateScenarioDto } from './dto/create-scenario.dto';
import { UpdateScenarioDto } from './dto/update-scenario.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, ROLES_KEY } from '../auth/roles.decorators';


@ApiTags('scenarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) //every route below requires a valid JWT
@Controller('scenarios')
export class ScenariosController {
  constructor(private readonly scenariosService: ScenariosService) { }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('trainer') //only trainers can create scenarios
  @ApiOperation({ summary: 'Create a new scenario (trainer only)' })
  create(@Body() createScenarioDto: CreateScenarioDto) {
    return this.scenariosService.create(createScenarioDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all scenarios' })
  findAll() {
    return this.scenariosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single scenario' })
  findOne(@Param('id') id: string) {
    return this.scenariosService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('trainer') //only trainers can update scenarios
  @ApiOperation({ summary: 'Update a scenario (trainer only)' })
  update(@Param('id') id: string, @Body() updateScenarioDto: UpdateScenarioDto) {
    return this.scenariosService.update(+id, updateScenarioDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('trainer') //only trainers can delete scenarios
  @ApiOperation({ summary: 'Delete a scenario (trainer only)' })
  remove(@Param('id') id: string) {
    return this.scenariosService.remove(+id);
  }
}
