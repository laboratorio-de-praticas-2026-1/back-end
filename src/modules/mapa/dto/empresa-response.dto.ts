import { ApiProperty } from '@nestjs/swagger';

export class EmpresaResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty({ nullable: true })
  nomeFantasia!: string | null;

  @ApiProperty({ nullable: true })
  cnpj!: string | null;

  @ApiProperty({ nullable: true })
  telefone!: string | null;

  @ApiProperty({ nullable: true })
  email!: string | null;

  @ApiProperty({ nullable: true })
  endereco!: string | null;

  @ApiProperty({ nullable: true })
  cidade!: string | null;

  @ApiProperty({ nullable: true })
  estado!: string | null;

  @ApiProperty({ nullable: true })
  site!: string | null;

  @ApiProperty({ enum: ['clinica', 'vistoria', 'detran'], nullable: true })
  tipo!: 'clinica' | 'vistoria' | 'detran' | null;

  @ApiProperty({ nullable: true })
  latitude!: string | null;

  @ApiProperty({ nullable: true })
  longitude!: string | null;
}
