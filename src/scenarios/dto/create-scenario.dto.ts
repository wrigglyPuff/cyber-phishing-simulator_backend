import { IsString, IsInt, IsNotEmpty } from 'class-validator';

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
}
