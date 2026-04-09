import {
  Controller,
  Get,
  Put,
  Body,
  Logger,
  Param,
  ParseIntPipe,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { ContatoService } from './contato.service';
import { EmpresaDto } from './dto/empresa-response.dto';
import { ContatoUpdateDto } from './dto/contato-update.dto';

@Controller('contato')
export class ContatoController {
  private readonly logger = new Logger(ContatoController.name);

  private readonly CNPJ_EMPRESA = '12.345.678/0001-99';

  constructor(private readonly contatoService: ContatoService) {}

  @Get()
  @ApiOperation({
    summary: 'Retorna dados do contato da empresa bortone',
  })
  @ApiOkResponse({ type: EmpresaDto })
  @ApiNotFoundResponse({ description: 'Dados de contato não encontrados' })
  buscarContato(): Promise<EmpresaDto> {
    const cnpj = this.getCnpjValido();

    this.logger.log(`Buscando contato para CNPJ: ${cnpj}`);

    return this.contatoService.buscarContato(cnpj);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retorna dados do contato da empresa bortone. (Fallback)',
    description:
      'Busca dados do contato da empresa bortone por ID. Usado caso o dado no banco tenha id diferente de 1.',
  })
  @ApiOkResponse({ type: EmpresaDto })
  @ApiNotFoundResponse({ description: 'Dados de contato não encontrados' })
  buscarContatoById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<EmpresaDto> {
    const cnpj = this.getCnpjValido();

    this.logger.log(`Buscando contato ID ${id} para CNPJ: ${cnpj}`);

    return this.contatoService.buscarContatoById(id, cnpj);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Atualiza dados de contato da empresa bortone pelo Id.',
  })
  @ApiOkResponse({ description: 'Contato atualizado com sucesso' })
  @ApiNotFoundResponse({ description: 'Contato não encontrado' })
  async atualizarContato(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: ContatoUpdateDto,
  ): Promise<void> {
    const cnpj = this.getCnpjValido();

    this.logger.log(`Atualizando contato ID ${id} para CNPJ: ${cnpj}`);

    return this.contatoService.atualizarContato(id, cnpj, data);
  }

  private getCnpjValido(): string {
    if (!this.CNPJ_EMPRESA) {
      throw new ForbiddenException('CNPJ inválido');
    }

    return this.CNPJ_EMPRESA;
  }
}
