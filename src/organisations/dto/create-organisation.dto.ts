import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsOrganisationName } from '../../common/validators/is-organisation-name.validator';

export class CreateOrganisationDto {
    @ApiProperty({ example: 'Acme Corp' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    @IsOrganisationName()
    name!: string;
}