import { ApiProperty } from '@nestjs/swagger';

export class ClienteProtocoloDto {
  @ApiProperty({
    description: 'Nome do cliente',
    example: 'Amanda Vithoria Alves Freitas',
  })
  nome: string;
}

export class ServicoProtocoloDto {
  @ApiProperty({
    description: 'Nome do serviço',
    example: 'Renovação CNH',
  })
  nome: string;

  @ApiProperty({
    description: 'Valor base do serviço',
    example: 200,
    nullable: true,
  })
  valor_base: number | null;
}

export class DadosSolicitacaoProtocoloDto {
  @ApiProperty({
    description: 'Data em que a solicitação foi criada',
    example: '2026-03-10',
  })
  data_solicitacao: string;

  @ApiProperty({
    description: 'Prazo estimado calculado para a solicitação',
    example: '2026-03-20',
  })
  prazo_estimado: string;
}

export class ProtocoloSolicitacaoDto {
  @ApiProperty({
    description: 'Dados do cliente',
    type: ClienteProtocoloDto,
  })
  cliente: ClienteProtocoloDto;

  @ApiProperty({
    description: 'Dados do serviço',
    type: ServicoProtocoloDto,
  })
  servico: ServicoProtocoloDto;

  @ApiProperty({
    description: 'Dados da solicitação',
    type: DadosSolicitacaoProtocoloDto,
  })
  solicitacao: DadosSolicitacaoProtocoloDto;
}

export class CreateSolicitacaoResponseDto {
  @ApiProperty({
    description: 'Mensagem de sucesso da criação da solicitação',
    example: 'Agendamento de serviço realizado com sucesso',
  })
  message: string;

  @ApiProperty({
    description: 'Protocolo da solicitação criada',
    type: ProtocoloSolicitacaoDto,
  })
  protocolo: ProtocoloSolicitacaoDto;
}
