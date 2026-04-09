import { Controller, Get, Param } from '@nestjs/common';
import { DebitoService } from './debito.service';
import { DebitoResponseDto } from './dto/debito-response.dto';

@Controller('veiculos')
export class DebitoController {
  constructor(private readonly debitoService: DebitoService) {}

  @Get(':placa/debitos')
  async buscarDebitos(
    @Param('placa') placa: string,
  ): Promise<DebitoResponseDto> {
    return this.debitoService.buscarDebitosPorPlaca(placa);
  }
}