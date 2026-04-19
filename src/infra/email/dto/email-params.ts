import { IsString, IsOptional, IsObject } from 'class-validator';

export class EmailParams {
  @IsString()
  to: string;

  @IsString()
  template: string;

  @IsString()
  assunto: string;

  @IsOptional()
  withHeader?: boolean;

  @IsObject()
  dados: Record<string, any>;
}