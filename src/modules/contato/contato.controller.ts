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
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';

import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { ContatoService } from './contato.service';

import { EmpresaDto, TipoEmpresa } from './dto/empresa-response.dto';

import { ContatoUpdateDto } from './dto/contato-update.dto';
import { EnviarEmailDto } from './dto/enviar-email-dto';

import { Roles } from '../usuario/decorators/roles.decorator';
import { JwtAuthGuard } from '../usuario/guards/jwt-auth.guard';
import { RolesGuard } from '../usuario/guards/roles.guard';

@Controller('contato')
export class ContatoController {
  private readonly logger = new Logger(ContatoController.name);

  private readonly EMPRESA_ID = 1;

  constructor(private readonly contatoService: ContatoService) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Retorna dados do contato (somente ID = 1 permitido)',
  })
  @ApiOkResponse({ type: EmpresaDto })
  @ApiNotFoundResponse({ description: 'Dados de contato não encontrados' })
  buscarContatoById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<EmpresaDto> {
    if (id !== this.EMPRESA_ID) {
      throw new ForbiddenException(
        'Somente a empresa com ID = 1 pode ser acessada',
      );
    }

    this.logger.log(`Buscando contato ID: ${id}`);
    return this.contatoService.buscarContatoById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('administrador')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualiza dados do contato (somente ID = 1 permitido)',
    requestBody: {
      description: 'Dados a serem atualizados (todos os campos opcionais)',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              nomeFantasia: { type: 'string', example: 'Auto Vistoria' },
              cnpj: { type: 'string', example: '12.345.678/0001-90' },
              telefone: { type: 'string', example: '11987654321' },
              email: {
                type: 'string',
                example: 'contato@autovistoria.com.br',
              },
              endereco: {
                type: 'string',
                example: 'Rua Exemplo, 123',
              },
              cidade: {
                type: 'string',
                example: 'São Paulo',
              },
              estado: {
                type: 'string',
                example: 'SP',
                description: 'Sigla do estado (2 letras)',
              },
              site: {
                type: 'string',
                example: 'www.autovistoria.com.br',
              },
              tipo: {
                type: 'string',
                enum: Object.values(TipoEmpresa),
                example: 'vistoria',
                description: 'Tipo da empresa (clinica, vistoria ou detran)',
              },
              latitude: {
                type: 'string',
                example: '-23.55052',
              },
              longitude: {
                type: 'string',
                example: '-46.633308',
              },
              enderecoCompleto: {
                type: 'string',
                example: 'Rua Exemplo, 123, São Paulo, SP',
                description: 'Endereço completo (endereço + cidade + estado)',
              },
            },
          },
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Contato atualizado com sucesso',
  })
  @ApiNotFoundResponse({
    description: 'Contato não encontrado',
  })
  async atualizarContatoById(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: ContatoUpdateDto,
  ): Promise<{ message: string }> {
    if (id !== this.EMPRESA_ID) {
      throw new ForbiddenException(
        'Somente a empresa com ID = 1 pode ser atualizada',
      );
    }

    this.logger.log(`Atualizando contato ID: ${id}`);

    return this.contatoService.atualizarContato(id, data);
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
