import { Body, Controller, Get, Logger, Param, ParseIntPipe, Post, ValidationPipe } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiCreatedResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { ContatoService } from './contato.service';
import { EmpresaDto } from './dto/empresa-response.dto';
import { EnviarEmailDto } from './dto/enviar-email.dto';

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

  @Post('enviar')
  @ApiCreatedResponse({ description: 'Mensagem enviada com sucesso' })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  async enviarEmail(@Body(ValidationPipe) dados: EnviarEmailDto): Promise<{ message: string }> {
    this.logger.log(`Recebendo mensagem de contato de: ${dados.nome} (${dados.email})`);
    return this.contatoService.enviarEmail(dados);
  }
}