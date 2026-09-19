import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsEnum,
  IsOptional,
} from 'class-validator';
export const CueTag = {
  URGENCY: 'URGENCY',
  MISMATCHED_DOMAIN: 'MISMATCHED_DOMAIN',
  UNEXPECTED_ATTACHMENT: 'UNEXPECTED_ATTACHMENT',
  SUSPICIOUS_LINK: 'SUSPICIOUS_LINK',
  AUTHORITY_IMPERSONATION: 'AUTHORITY_IMPERSONATION',
  SPELLING_GRAMMAR: 'SPELLING_GRAMMAR',
  GENERIC_GREETING: 'GENERIC_GREETING',
  OTHER: 'OTHER',
} as const;
export type CueTag = (typeof CueTag)[keyof typeof CueTag];

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
