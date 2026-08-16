import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TrainingModulesService } from './training-modules.service';
import { CreateTrainingModuleDto } from './dto/create-training-module.dto';
import { UpdateTrainingModuleDto } from './dto/update-training-module.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, ROLES_KEY } from '../auth/roles.decorators';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Training Modules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) //every route below requires a valid JWT
@Controller('training-modules')
export class TrainingModulesController {
    constructor(private readonly trainingModulesService: TrainingModulesService) { }

    @Post()
    @UseGuards(RolesGuard) //only trainers can create modules
    @Roles('trainer')
    @ApiOperation({ summary: 'Create a new training module (trainer only)' })
    create(@Body() createTrainingModuleDto: CreateTrainingModuleDto) {
        return this.trainingModulesService.create(createTrainingModuleDto);
    }

    @Get()
    @ApiOperation({ summary: 'List all training modules)' })
    findAll() {
        return this.trainingModulesService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a single module, including its scenarios)' })
    findOne(@Param('id') id: string) {
        return this.trainingModulesService.findOne(+id);
    }

    @Patch(':id')
    @UseGuards(RolesGuard)
    @Roles('trainer')
    @ApiOperation({ summary: 'Update a training module (trainer only)' })
    update(@Param('id') id: string, @Body() updateTrainingModuleDto: UpdateTrainingModuleDto) {
        return this.trainingModulesService.update(+id, updateTrainingModuleDto);
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles('trainer')
    @ApiOperation({ summary: 'Delete a training module (trainer only)' })
    remove(@Param('id') id: string) {
        return this.trainingModulesService.remove(+id);
    }
}