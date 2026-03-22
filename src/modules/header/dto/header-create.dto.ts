import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class HeaderCreateDto {
  @ApiProperty({ example: 'Banner de exemplo' })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  ativo: boolean;
}
