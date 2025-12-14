import { IsEmail, IsString, MinLength, MaxLength, Matches } from "class-validator";

// Password must be at least 6 characters and contain both letters and numbers
const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/;
const PASSWORD_MESSAGE = "Password must be at least 6 characters and contain both letters and numbers";

export class SignupRequestDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  @Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
  password!: string;
}

export class SigninRequestDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  @Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
  password!: string;
}

export class UpdateProfileDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username?: string;

  @IsString()
  avatar?: string;

  @IsString()
  @MinLength(6)
  @Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
  password?: string;

  @IsString()
  currentPassword!: string;
}
