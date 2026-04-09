export class DebitoItemDto {
  id: number;
  descricao: string;
  valor: number;
  status: string;
}

export class DebitoResponseDto {
  placa: string;
  debitos: DebitoItemDto[];
  total: number;
}