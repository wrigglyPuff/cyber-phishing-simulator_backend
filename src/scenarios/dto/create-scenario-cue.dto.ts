import { IsString, IsNotEmpty, IsBoolean } from 'class-validator';

export class CreateChoiceScenarioCueDto {
    @IsString()
    @IsNotEmpty()
    text!: string;

    @IsBoolean()
    @IsNotEmpty()
    isCorrect!: boolean;
}