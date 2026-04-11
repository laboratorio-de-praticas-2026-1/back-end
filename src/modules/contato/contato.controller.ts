import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse } from '@nestjs/swagger';

import { ContatoService } from './contato.service';
import { ContatoUpdateDto } from './dto/contato-update.dto';
import { EmpresaDto } from './dto/empresa-response.dto';
import { EnviarEmailDto } from './dto/enviar-email-dto';

@Controller('contato')
export class ContatoController {
  private readonly logger = new Logger(ContatoController.name);

  private readonly CNPJ_EMPRESA = '12.345.678/0001-99';

  constructor(private readonly contatoService: ContatoService) {}

  @Get()
  @ApiOkResponse({ type: EmpresaDto })
  @ApiNotFoundResponse({ description: 'Dados de contato não encontrados' })
  buscarContato(): Promise<EmpresaDto> {
    const cnpj = this.getCnpjValido();

    this.logger.log(`Buscando contato para CNPJ: ${cnpj}`);

    return this.contatoService.buscarContato(cnpj);
  }

  @Get(':id')
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

  @Post('enviar-email')
  @ApiCreatedResponse({ description: 'Mensagem enviada com sucesso' })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  async enviarMensagemContato(
    @Body(ValidationPipe) dados: EnviarEmailDto,
  ): Promise<{ message: string }> {
    this.logger.log(
      `Recebendo mensagem de contato de: ${dados.nome} (${dados.email})`,
    );
    return this.contatoService.enviarMensagemContato(dados);
  }
}