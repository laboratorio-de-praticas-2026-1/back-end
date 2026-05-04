import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty()
  estado: string;

  @ApiProperty()
  site: string;

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
    // Concatena os campos para formar o endereço completo
    this.enderecoCompleto = [endereco, cidade, estado]
      .filter(Boolean)
      .join(', ');
  }
}
