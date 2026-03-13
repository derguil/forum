import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator'
import { IsInt, Min, IsOptional } from 'class-validator';

export class UpdatePostDto {
  @IsNotEmpty()
  @IsString()
  title: string

  @IsNotEmpty()
  @IsString()
  content: string
}