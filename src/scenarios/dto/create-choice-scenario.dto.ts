import { IsString, IsNotEmpty, IsBoolean } from 'class-validator';

export class CreateChoiceScenarioDto {
  @IsString()
  @IsNotEmpty()
  text!: string;

  @IsBoolean()
  @IsNotEmpty()
  isCorrect!: boolean;

  @IsString()
  @IsNotEmpty()
  feedback!: string;
}
