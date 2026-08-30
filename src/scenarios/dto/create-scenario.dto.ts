import {
  IsString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  ArrayNotEmpty,
  ValidateNested,
  MaxLength,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ScenarioCategory, ScenarioDifficulty, ScenarioInteractionType } from '@prisma/client';
import { IsFictionalEmail } from './validators/is-fictional-email.validator';
import { IsSafeText } from './validators/is-safe-text.validator';

export class CreateScenarioDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  @IsSafeText()
  title!: string;

  @IsInt()
  @IsNotEmpty()
  moduleId!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  @IsSafeText()
  content!: string;

  @IsEnum(ScenarioCategory)
  @IsNotEmpty()
  category!: ScenarioCategory;

  @IsEnum(ScenarioDifficulty)
  @IsNotEmpty()
  difficulty!: ScenarioDifficulty;

  @IsEnum(ScenarioInteractionType)
  @IsNotEmpty()
  interactionType!: ScenarioInteractionType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  @IsSafeText()
  scenarioDescription!: string;

  @IsString()
  @IsOptional()
  @IsFictionalEmail()
  sender?: string;

  @IsString()
  @IsOptional()
  @IsFictionalEmail()
  recipient?: string;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsOptional()
  correctActionExplanation?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  correctAnswer?: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  correctCues?: string[];
}
