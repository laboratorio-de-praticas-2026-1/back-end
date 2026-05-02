import { ApiProperty } from '@nestjs/swagger';

export class ClienteDto {
  @ApiProperty({
    description: 'ID do cliente',
    example: 12,
  })
  id: number;

  @ApiProperty({
    description: 'Nome do cliente',
    example: 'Amanda Vithória',
  })
  nome: string;

  @ApiProperty({
    description: 'Email do cliente',
    example: 'amanda@gmail.com',
  })
  email: string;
}

export class ServicoDto {
  @ApiProperty({
    description: 'ID do serviço',
    example: 13,
  })
  id: number;

  @ApiProperty({
    description: 'Tipo do serviço',
    example: 'Renovação CNH',
  })
  tipo: string;

  @ApiProperty({
    description: 'Valor base do serviço',
    example: 200.0,
  })
  valorBase: number;
}

export class SolicitacaoInfoDto {
  @ApiProperty({
    description: 'ID da solicitação',
    example: 101,
  })
  id: number;

  @ApiProperty({
    description: 'Status da solicitação',
    example: 'Recebido',
  })
  status: string;

  @ApiProperty({
    description: 'Observação do cliente',
    example: 'Exemplo',
  })
  observacaoCliente: string;

  @ApiProperty({
    description: 'Observação do administrador',
    example: '',
  })
  observacaoAdmin: string;

  @ApiProperty({
    description: 'Data da solicitação',
    example: '2026-03-10T14:00:00',
  })
  dataSolicitacao: Date;

  @ApiProperty({
    description: 'Data de conclusão',
    example: '2026-03-20T15:00:00',
    nullable: true,
  })
  dataConclusao: Date | null;
}

export class SolicitacaoCompletaDto {
  @ApiProperty({
    description: 'Dados do cliente',
    type: ClienteDto,
  })
  cliente: ClienteDto;

  @ApiProperty({
    description: 'Dados do serviço',
    type: ServicoDto,
  })
  servico: ServicoDto;

  @ApiProperty({
    description: 'Dados da solicitação',
    type: SolicitacaoInfoDto,
  })
  solicitacao: SolicitacaoInfoDto;
}

export class ListSolicitacoesResponseDto {
  @ApiProperty({
    description: 'Quantidade total de solicitações',
    example: 25,
  })
  total: number;

  @ApiProperty({
    description: 'Página atual',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Quantidade de registros por página',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Total de páginas',
    example: 3,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Indica se existe próxima página',
    example: true,
  })
  hasNext: boolean;

  @ApiProperty({
    description: 'Indica se existe página anterior',
    example: false,
  })
  hasPrevious: boolean;

  @ApiProperty({
    description: 'Lista de solicitações',
    type: [SolicitacaoCompletaDto],
  })
  solicitacoes: SolicitacaoCompletaDto[];
}
