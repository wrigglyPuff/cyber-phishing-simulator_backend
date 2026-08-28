import {
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Request,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorators';
import { Role } from '@prisma/client';

@ApiTags('trainer dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.TRAINER, Role.GLOBAL_ADMIN)
@Controller('organisations/:orgId/trainer-dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get()
    @ApiOperation({
        summary: 'Headline training stats for an organisation (trainer only)',
    })
    getOverview(@Request() req, @Param('orgId', ParseIntPipe) orgId: number) {
        return this.dashboardService.getOverview(
            orgId,
            req.user.organisationId,
            req.user.role,
        );
    }

    @Get('activity')
    @ApiOperation({
        summary: 'Ten most recent learner activity items (trainer only)',
    })
    getActivity(@Request() req, @Param('orgId', ParseIntPipe) orgId: number) {
        return this.dashboardService.getActivity(
            orgId,
            req.user.organisationId,
            req.user.role,
        );
    }
}