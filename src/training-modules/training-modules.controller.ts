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
  Query,
  ParseIntPipe,
  ParseBoolPipe,
} from '@nestjs/common';
import { TrainingModulesService } from './training-modules.service';
import { CreateTrainingModuleDto } from './dto/create-training-module.dto';
import { UpdateTrainingModuleDto } from './dto/update-training-module.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorators';
import { Role } from '@prisma/client';
import { AssignUserDto } from './dto/assign-user.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';

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
  @ApiOperation({ summary: 'Create a new training module (trainer & admin only)' })
  create(
    @Body() createTrainingModuleDto: CreateTrainingModuleDto,
    @Req() req: any,
  ) {
    return this.trainingModulesService.create(
      createTrainingModuleDto,
      req.user,
    );
  }

  @Get()
  @ApiOperation({ summary: 'List training modules, optionally filtered to the current user\'s assigned modules' })
  @ApiQuery({ name: 'assignedToMe', required: false, type: Boolean })
  findAll(
    @Req() req: any,
    @Query('assignedToMe', new ParseBoolPipe({ optional: true })) assignedToMe?: boolean,
  ) {
    return this.trainingModulesService.findAll(req.user, assignedToMe);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single module, including its scenarios' })
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.trainingModulesService.findOne(id, req.user);
    //protection validator
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.TRAINER, Role.GLOBAL_ADMIN)
  @ApiOperation({ summary: 'Update a training module (admin & trainer only)' })
  update(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTrainingModuleDto: UpdateTrainingModuleDto,
  ) {
    return this.trainingModulesService.update(id, updateTrainingModuleDto, req.user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.TRAINER, Role.GLOBAL_ADMIN) @ApiOperation({ summary: 'Delete a training module (admin & trainer only)' })
  remove(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.trainingModulesService.remove(id, req.user.organisationId);
  }

  @Post(':moduleId/assignments')
  @UseGuards(RolesGuard)
  @Roles(Role.TRAINER, Role.GLOBAL_ADMIN)
  @ApiOperation({ summary: 'Assign a learner to a module (admin & trainer only)' })
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
  @ApiOperation({ summary: 'Unassign a learner from a module (admin & trainer only)' })
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
