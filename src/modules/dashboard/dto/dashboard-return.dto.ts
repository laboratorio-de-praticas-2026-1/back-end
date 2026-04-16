import { ApiProperty } from '@nestjs/swagger';

class FinanceiroItemDto {
  @ApiProperty()
  quantidade: number;

  @ApiProperty()
  valorTotal: number;
}

class GeralDashboardDto {
  @ApiProperty()
  solicitacoesEmAberto: number;

  @ApiProperty()
  solicitacoesConcluidas: number;

  @ApiProperty()
  documentosPendentesValidacao: number;

  @ApiProperty()
  clientesNovosMesAtual: number;

  @ApiProperty()
  taxaCancelamentoPct: number;

  @ApiProperty({ type: FinanceiroItemDto })
  debitosEmAberto: FinanceiroItemDto;

  @ApiProperty({ type: FinanceiroItemDto })
  parcelasVencidasNaoPagas: FinanceiroItemDto;
}

export class DashboardReturnDto {
  @ApiProperty({ type: GeralDashboardDto })
  geral: GeralDashboardDto;
}
