import { IsInt, IsNotEmpty, IsString } from 'class-validator';

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

  @IsString()
  @IsNotEmpty()
  correctActionExplanation!: string;

  @ValidateNested({ each: true })
  @ArrayNotEmpty()
  @Type(() => CreateChoiceScenarioDto)
  choices!: CreateChoiceScenarioDto[];

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateChoiceScenarioCueDto)
  cues!: CreateChoiceScenarioCueDto[];
}
