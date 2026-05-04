import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Logger,
  Param,
  ParseIntPipe,
  ForbiddenException,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiCreatedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { ContatoService } from './contato.service';
import { EmpresaDto } from './dto/empresa-response.dto';
import { ContatoUpdateDto } from './dto/contato-update.dto';
import { EnviarEmailDto } from './dto/enviar-email-dto';

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
  @ApiOperation({
    summary: 'Atualiza dados do contato (somente ID = 1 permitido)',
  })
  @ApiOkResponse({ description: 'Contato atualizado com sucesso' })
  @ApiNotFoundResponse({ description: 'Contato não encontrado' })
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

