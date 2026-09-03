import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Request,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { OrganisationsService } from './organisations.service';
import { CreateOrganisationDto } from './dto/create-organisation.dto';
import { UpdateOrganisationDto } from './dto/update-organisation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorators';
import { Role } from '@prisma/client';

@ApiTags('Organisations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('organisations')
export class OrganisationsController {
    constructor(private readonly organisationsService: OrganisationsService) { }

    @Post()
    @UseGuards(RolesGuard)
    @Roles(Role.GLOBAL_ADMIN)
    @ApiOperation({ summary: 'Create an organisation (global admin only)' })
    create(@Body() createOrganisationDto: CreateOrganisationDto) {
        return this.organisationsService.create(createOrganisationDto);
    }

    @Get(':id')
    @UseGuards(RolesGuard)
    @Roles(Role.TRAINER, Role.GLOBAL_ADMIN)
    @ApiOperation({ summary: 'Read one organisation with member counts' })
    findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
        return this.organisationsService.findOne(id, req.user);
    }

    @Patch(':id')
    @UseGuards(RolesGuard)
    @Roles(Role.TRAINER, Role.GLOBAL_ADMIN)
    @ApiOperation({ summary: 'Rename an organisation' })
    update(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
        @Body() updateOrganisationDto: UpdateOrganisationDto,
    ) {
        return this.organisationsService.update(id, updateOrganisationDto, req.user);
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles(Role.GLOBAL_ADMIN)
    @ApiOperation({ summary: 'Delete an organisation (global admin only)' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.organisationsService.remove(id);
    }
}