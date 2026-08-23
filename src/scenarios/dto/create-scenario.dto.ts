import {
  IsString,
  IsInt,
  IsNotEmpty,
  IsEnum,
  ArrayNotEmpty,
  ValidateNested,
} from 'class-validator';
import { CreateChoiceScenarioDto } from './create-choice-scenario.dto';
import { CreateChoiceScenarioCueDto } from './create-scenario-cue.dto';
import { Type } from 'class-transformer';
import { ScenarioCategory, ScenarioDifficulty } from '@prisma/client';
import { IsFictionalEmail } from './validators/is-fictional-email.validator';

export class CreateScenarioDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsInt()
  @IsNotEmpty()
  moduleId!: number;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsEnum(ScenarioCategory)
  @IsNotEmpty()
  category!: ScenarioCategory;

  @IsEnum(ScenarioDifficulty)
  @IsNotEmpty()
  difficulty!: ScenarioDifficulty;

  @IsString()
  @IsNotEmpty()
  interactionType!: string;

  @IsString()
  @IsNotEmpty()
  scenarioDescription!: string;

  @IsString()
  @IsNotEmpty()
  @IsFictionalEmail()
  sender!: string;

  @IsString()
  @IsNotEmpty()
  @IsFictionalEmail()
  recipient!: string;

  @IsString()
  @IsNotEmpty()
  subject!: string;

  @IsString()
  @IsNotEmpty()
  correctActionExplanation?: string;

  @ValidateNested({ each: true })
  @Type(() => CreateChoiceScenarioDto)
  @ArrayNotEmpty()
  choices?: CreateChoiceScenarioDto[];

  @ValidateNested({ each: true })
  @Type(() => CreateChoiceScenarioCueDto)
  @ArrayNotEmpty()
  cues?: CreateChoiceScenarioCueDto[];
}
