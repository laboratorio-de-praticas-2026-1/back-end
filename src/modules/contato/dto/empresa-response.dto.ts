import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, MaxLength } from 'class-validator';

export enum TipoEmpresa {
  CLINICA = 'clinica',
  VISTORIA = 'vistoria',
  DETRAN = 'detran',
}

export class EmpresaDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  nomeFantasia: string;

  @ApiProperty()
  cnpj: string;

  @ApiProperty()
  telefone: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  endereco: string;

  @ApiProperty()
  cidade: string;

  @ApiProperty({
    description: 'Estado da empresa (sigla de 2 letras)',
    example: 'SP',
  })
  @IsString({ message: 'O estado deve ser uma string' })
  @MaxLength(2, { message: 'O estado deve conter no máximo 2 caracteres' })
  estado: string;

  @ApiProperty()
  site: string;

  @ApiProperty({
    description: 'Tipo da empresa',
    required: false,
  })
  @IsEnum(TipoEmpresa, {
    message: `O tipo deve ser um dos seguintes valores: ${Object.values(TipoEmpresa).join(', ')}`,
  })
  tipo?: TipoEmpresa | null;

  @ApiProperty({
    description: 'Latitude da empresa',
    required: false,
  })
  latitude?: string;

  @ApiProperty({
    description: 'Longitude da empresa',
    required: false,
  })
  longitude?: string;

  @ApiProperty({
    description: 'Endereço completo (endereço + cidade + estado)',
  })
  enderecoCompleto: string;

  constructor(
    id: number,
    nomeFantasia: string,
    cnpj: string,
    telefone: string,
    email: string,
    endereco: string,
    cidade: string,
    estado: string,
    site: string,
    tipo?: TipoEmpresa | null,
    latitude?: string,
    longitude?: string,
  ) {
    this.id = id;
    this.nomeFantasia = nomeFantasia;
    this.cnpj = cnpj;
    this.telefone = telefone;
    this.email = email;
    this.endereco = endereco;
    this.cidade = cidade;
    this.estado = estado;
    this.site = site;
    this.tipo = tipo;
    this.latitude = latitude;
    this.longitude = longitude;

    this.enderecoCompleto = [endereco, cidade, estado]
      .filter(Boolean)
      .join(', ');
  }
}
