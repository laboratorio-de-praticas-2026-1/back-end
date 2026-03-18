// import { ApiProperty } from '@nestjs/swagger';

export class EmpresaDto {
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
  }
  id: number;
  nomeFantasia: string;
  cnpj: string;
  telefone: string;
  email: string;
  endereco: string;
  cidade: string;
  estado: string;
  site: string;
}
