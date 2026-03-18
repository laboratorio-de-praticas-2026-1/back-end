import { Transform } from 'class-transformer';
import { IsIn, IsString } from 'class-validator';

export class BuscaBannerStatusDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsString()
  @IsIn(['ativo', 'inativo'], {
    message: 'Campo "status" deve ser "ativo" ou "inativo"',
  })
  declare status: string;
}
