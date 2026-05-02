import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Logger,
  Param,
  ParseIntPipe,
  ForbiddenException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';
import { ContatoService } from './contato.service';
import { EmpresaDto } from './dto/empresa-response.dto';
import { ContatoUpdateDto } from './dto/contato-update.dto';
import {
  ContatoEmailRequestDto,
  ContatoEmailResponseDto,
} from './dto/contato-email.dto';

@ApiTags('Contato')
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

  @Post('enviar')
  @ApiOperation({ summary: 'Envia email de contato' })
  @ApiBody({ type: ContatoEmailRequestDto })
  @ApiCreatedResponse({
    description: 'E-mail enviado com sucesso',
    type: ContatoEmailResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Dados invalidos para envio' })
  @ApiInternalServerErrorResponse({ description: 'Erro ao enviar e-mail' })
  async enviarEmail(
    @Body() data: ContatoEmailRequestDto,
  ): Promise<ContatoEmailResponseDto> {
    try {
      this.logger.log(`Email recebido de: ${data.email}`);

      await this.contatoService.enviarEmail(data);

      return {
        message: 'E-mail enviado com sucesso',
      };
    } catch (error) {
      this.logger.error('Erro ao enviar email', error);

      throw new HttpException(
        {
          message: 'Erro ao enviar e-mail',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
