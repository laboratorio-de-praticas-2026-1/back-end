import { Controller, Get, Logger, Param, ParseIntPipe } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse } from '@nestjs/swagger';
import { ContatoService } from './contato.service';
import { EmpresaDto } from './dto/empresa-response.dto';

@Controller('contato')
export class ContatoController {
  private readonly logger = new Logger(ContatoController.name);

  constructor(private readonly contatoService: ContatoService) {}

  @Get()
  @ApiOkResponse({ type: EmpresaDto })
  @ApiNotFoundResponse({ description: 'Dados de contato não encontrados' })
  buscarContato(): Promise<EmpresaDto> {
    this.logger.log(`Iniciando busca de dados de contato...`);
    return this.contatoService.buscarContato();
  }

  @Get(':id')
  @ApiOkResponse({ type: EmpresaDto })
  @ApiNotFoundResponse({ description: 'Dados de contato não encontrados' })
  buscarContatoById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<EmpresaDto> {
    this.logger.log(`Iniciando busca de dados de contato por Id...`);
    return this.contatoService.buscarContatoById(id);
  }
}
