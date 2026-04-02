import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  HttpCode,
  HttpStatus,
  Put,
  Delete,
} from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';
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

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: EmpresaDto })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  createContato(@Body() empresa: EmpresaDto): Promise<EmpresaDto> {
    this.logger.log(`Iniciando criação de Contato...`);
    return this.contatoService.criarContato(empresa);
  }

  @Put(':id')
  @ApiOkResponse({ type: EmpresaDto })
  atualizarContato(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<EmpresaDto>,
  ): Promise<EmpresaDto> {
    this.logger.log(`Atualizando contato...`);
    return this.contatoService.atualizarContato(id, data);
  }

  @Delete(':id')
  @ApiNoContentResponse({ description: 'Contato deletado com sucesso' })
  @ApiNotFoundResponse({ description: 'Dados de contato não encontrados' })
  async deletarContato(@Param('id', ParseIntPipe) id: number): Promise<void> {
    this.logger.log(`Deletando contato...`);
    return this.contatoService.deletarContato(id);
  }
}
