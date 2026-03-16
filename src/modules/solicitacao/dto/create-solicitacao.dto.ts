import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateSolicitacaoDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  usuario_id: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  veiculo_id?: number | null;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  servico_id: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  observacao_cliente?: string;
}
