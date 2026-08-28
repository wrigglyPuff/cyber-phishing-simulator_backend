import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { TrainingModulesService } from './training-modules.service';
import { CreateTrainingModuleDto } from './dto/create-training-module.dto';
import { UpdateTrainingModuleDto } from './dto/update-training-module.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorators';
import { Role } from '@prisma/client';
import { AssignUserDto } from './dto/assign-user.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Training Modules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) //every route below requires a valid JWT
@Controller('training-modules')
export class TrainingModulesController {
  constructor(
    private readonly trainingModulesService: TrainingModulesService,
  ) { }

  @Post()
  @UseGuards(RolesGuard) //only trainers can create modules
  @Roles(Role.TRAINER, Role.GLOBAL_ADMIN)
  @ApiOperation({ summary: 'Create a new training module (trainer only)' })
  create(
    @Body() createTrainingModuleDto: CreateTrainingModuleDto,
    @Req() req: any,
  ) {
    return this.trainingModulesService.create(
      createTrainingModuleDto,
      req.user.organisationId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'List all training modules)' })
  findAll(@Req() req: any) {
    return this.trainingModulesService.findAll(req.user.organisationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single module, including its scenarios)' })
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.trainingModulesService.findOne(+id, req.user.organisationId);
    //protection validator
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.TRAINER, Role.GLOBAL_ADMIN)
  @ApiOperation({ summary: 'Update a training module (trainer only)' })
  update(
    @Param('id') id: string,
    @Body() updateTrainingModuleDto: UpdateTrainingModuleDto,
  ) {
    return this.trainingModulesService.update(+id, updateTrainingModuleDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.TRAINER, Role.GLOBAL_ADMIN) @ApiOperation({ summary: 'Delete a training module (trainer only)' })
  remove(@Param('id') id: string) {
    return this.trainingModulesService.remove(+id);
  }

  @Post(':moduleId/assignments')
  @UseGuards(RolesGuard)
  @Roles(Role.TRAINER, Role.GLOBAL_ADMIN)
  @ApiOperation({ summary: 'Assign a learner to a module (trainer only)' })
  assignUser(
    @Req() req: any,
    @Param('moduleId', ParseIntPipe) moduleId: number,
    @Body() assignUserDto: AssignUserDto,
  ) {
    return this.trainingModulesService.assignUser(
      moduleId,
      assignUserDto.userId,
      req.user.organisationId,
    );
  }

  @Delete(':moduleId/assignments/:userId')
  @UseGuards(RolesGuard)
  @Roles(Role.TRAINER, Role.GLOBAL_ADMIN)
  @ApiOperation({ summary: 'Unassign a learner from a module (trainer only)' })
  unassignUser(
    @Req() req: any,
    @Param('moduleId', ParseIntPipe) moduleId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.trainingModulesService.unassignUser(
      moduleId,
      userId,
      req.user.organisationId,
    );
  }
}
