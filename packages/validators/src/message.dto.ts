import { IsString, IsOptional, IsNumber, IsDefined, IsMongoId } from "class-validator";

export class SendMessageRequestDto {
  @IsString()
  @IsDefined()
  @IsMongoId()
  conversationId!: string;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  fileName?: string;
}

export class GetMessagesQueryDto {
  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsNumber()
  offset?: number;
}
