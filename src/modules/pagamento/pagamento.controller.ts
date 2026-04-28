import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PagamentoService } from './pagamento.service';
import {
  SimulacaoPagamentoRequestDto,
  SimulacaoPagamentoResponseDto,
} from './dto/simulacao-pagamento-request-require.dto';

@ApiTags('Pagamentos')
@Controller('pagamentos')
export class PagamentoController {
  constructor(private readonly pagamentoService: PagamentoService) {}

  @Post('parcela/simulacao')
  @ApiOperation({
    summary: 'Simulação de pagamento de débitos (à vista ou parcelado)',
  })
  @ApiResponse({
    status: 200,
    description: 'Resultado da simulação de Pagamento e Parcelamento',
    type: SimulacaoPagamentoResponseDto,
  })
  async simularPagamento(
    @Body() request: SimulacaoPagamentoRequestDto,
  ): Promise<SimulacaoPagamentoResponseDto> {
    return this.pagamentoService.simularPagamento(request);
  }
}
