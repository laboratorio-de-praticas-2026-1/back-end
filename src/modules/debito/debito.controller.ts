import { Controller, Get, Logger, Param } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { DebitoResponseDto } from './dto/debito-response.dto';
import { DebitoService } from './debito.service';

@ApiTags('debitos')
@Controller('debitos')
export class DebitoController {
  private readonly logger = new Logger(DebitoController.name);

  constructor(private readonly debitoService: DebitoService) {}

  @Get('veiculos/:placa')
  @ApiOkResponse({ type: DebitoResponseDto })
  @ApiNotFoundResponse({ description: 'Veículo não encontrado' })
  async buscarDebitos(
    @Param('placa') placa: string,
  ): Promise<DebitoResponseDto> {
    this.logger.log(`Iniciando busca de débitos para placa: ${placa}`);
    return this.debitoService.buscarDebitosPorPlaca(placa);
  }
}
