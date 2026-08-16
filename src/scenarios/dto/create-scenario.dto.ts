import { IsString, IsInt, IsNotEmpty, ArrayNotEmpty, Validate, ValidateNested } from 'class-validator';
import { CreateChoiceScenarioDto } from './create-choice-scenario.dto';
import { CreateChoiceScenarioCueDto } from './create-scenario-cue.dto';
import { Type } from 'class-transformer';

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

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsString()
  @IsNotEmpty()
  difficulty!: string;

  @IsString()
  @IsNotEmpty()
  interactionType!: string;

  @IsString()
  @IsNotEmpty()
  scenarioDescription!: string;

  @IsString()
  @IsNotEmpty()
  sender!: string;

  @IsString()
  @IsNotEmpty()
  recipient!: string;

  @IsString()
  @IsNotEmpty()
  subject!: string;
}
