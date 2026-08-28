import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ScenariosModule } from './scenarios/scenarios.module';
import { TrainingModulesModule } from './training-modules/training-modules.module';
import { AttemptsModule } from './attempts/attempts.module';
import { ResultsModule } from './results/results.module';
import { OrganisationsModule } from './organisations/organisations.module';
import { DashboardService } from './dashboard/dashboard.service';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    AuthModule,
    ScenariosModule,
    TrainingModulesModule,
    AttemptsModule,
    ResultsModule,
    OrganisationsModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
