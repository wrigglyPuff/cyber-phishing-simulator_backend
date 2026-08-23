import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { CueTag } from '@prisma/client';

export class CreateChoiceScenarioCueDto {
  @IsString()
  @IsNotEmpty()
  text!: string;

  @IsBoolean()
  @IsNotEmpty()
  isCorrect!: boolean;

  @IsEnum(CueTag)
  @IsOptional()
  tag?: CueTag;
}
