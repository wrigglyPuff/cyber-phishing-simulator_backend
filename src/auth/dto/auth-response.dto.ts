import { UserDto } from '../../users/dto/user.dto';

export class AuthResponseDto {
  success!: boolean;
  token!: string;
  user!: UserDto;
}
