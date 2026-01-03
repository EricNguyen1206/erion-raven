import { IsString, IsNotEmpty, IsMongoId } from "class-validator";

export class SendFriendRequestApiRequestDto {
  @IsString()
  @IsMongoId()
  @IsNotEmpty()
  toUserId!: string;
}

export class AcceptFriendRequestApiRequestDto {
  @IsString()
  @IsMongoId()
  @IsNotEmpty()
  requestId!: string;
}

export class DeclineFriendRequestApiRequestDto {
  @IsString()
  @IsMongoId()
  @IsNotEmpty()
  requestId!: string;
}
