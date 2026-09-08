import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateTrainingModuleDto } from './create-training-module.dto';

//PartialType takes every field from CreateTrainingModuleDto and makes it optional for UpdateTrainingModuleDto
export class UpdateTrainingModuleDto extends PartialType(
  OmitType(CreateTrainingModuleDto, ['organisationId']),
) { }
