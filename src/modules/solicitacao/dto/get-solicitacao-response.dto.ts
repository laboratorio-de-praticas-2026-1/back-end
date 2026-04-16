import { ApiProperty } from '@nestjs/swagger';

export class UsuarioSolicitacaoDto {
  @ApiProperty({
    description: 'ID do usuário',
    example: 2,
  })
  id!: number;

  @ApiProperty({
    description: 'Nome do usuário',
    example: 'João Silva',
  })
  nome!: string;

  @ApiProperty({
    description: 'CPF ou CNPJ do usuário',
    example: '00000000000',
    nullable: true,
  })
  cpf_cnpj!: string | null;
}

export class VeiculoSolicitacaoDto {
  @ApiProperty({
    description: 'ID do veículo',
    example: 5,
  })
  id!: number;

  @ApiProperty({
    description: 'Modelo do veículo',
    example: 'Civic',
    nullable: true,
  })
  modelo!: string | null;

  @ApiProperty({
    description: 'Placa do veículo',
    example: 'ABC1234',
  })
  placa!: string;
}

export class ServicoSolicitacaoDto {
  @ApiProperty({
    description: 'ID do serviço',
    example: 1,
  })
  id!: number;

  @ApiProperty({
    description: 'Nome do serviço',
    example: 'Licenciamento Anual',
  })
  nome!: string;
}

export class GetSolicitacaoResponseDto {
  @ApiProperty({
    description: 'ID da solicitação',
    example: 10,
  })
  id!: number;

  @ApiProperty({
    description: 'ID do usuário',
    example: 2,
  })
  usuario_id!: number;

  @ApiProperty({
    description: 'ID do veículo',
    example: 5,
    nullable: true,
  })
  veiculo_id!: number | null;

  @ApiProperty({
    description: 'ID do serviço',
    example: 1,
  })
  servico_id!: number;

  @ApiProperty({
    description: 'Status da solicitação',
    example: 'em_andamento',
  })
  status!: string;

  @ApiProperty({
    description: 'Observação do cliente',
    example: 'Exemplo',
    nullable: true,
  })
  observacao_cliente!: string | null;

  @ApiProperty({
    description: 'Observação do administrador',
    example: null,
    nullable: true,
  })
  observacao_admin!: string | null;

  @ApiProperty({
    description: 'Data da solicitação',
    example: '2026-04-14T10:00:00Z',
  })
  data_solicitacao!: string;

  @ApiProperty({
    description: 'Data de conclusão da solicitação',
    example: '2026-04-16T11:00:00Z',
    nullable: true,
  })
  data_conclusao!: string | null;

  @ApiProperty({
    description: 'Dados do usuário',
    type: UsuarioSolicitacaoDto,
  })
  usuario!: UsuarioSolicitacaoDto;

  @ApiProperty({
    description: 'Dados do veículo',
    type: VeiculoSolicitacaoDto,
    nullable: true,
  })
  veiculo!: VeiculoSolicitacaoDto | null;

  @ApiProperty({
    description: 'Dados do serviço',
    type: ServicoSolicitacaoDto,
  })
  servico!: ServicoSolicitacaoDto;
}
