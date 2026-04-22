import { ApiProperty } from '@nestjs/swagger';

export class EmpresaResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  nomeFantasia: string;

  @ApiProperty({
    description: 'Tipo da empresa (clinica, vistoria, detran)',
  })
  tipo: string;

  @ApiProperty()
  cidade: string;

  @ApiProperty()
  estado: string;

  @ApiProperty()
  endereco: string;

  @ApiProperty()
  latitude: string;

  @ApiProperty()
  longitude: string;

  @ApiProperty({
    description: 'Endereço completo formatado',
  })
  enderecoCompleto: string;

  constructor(
    id: number,
    nomeFantasia: string,
    tipo: string,
    cidade: string,
    estado: string,
    endereco: string,
    latitude: string,
    longitude: string,
  ) {
    this.id = id;
    this.nomeFantasia = nomeFantasia;
    this.tipo = tipo;
    this.cidade = cidade;
    this.estado = estado;
    this.endereco = endereco;
    this.latitude = latitude;
    this.longitude = longitude;

    this.enderecoCompleto = [endereco, cidade, estado]
      .filter(Boolean)
      .join(', ');
  }
}
