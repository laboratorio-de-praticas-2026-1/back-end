import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { DocumentoFilePipe } from '../../commons/pipes/file.pipe';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { CreateSolicitacaoResponseDto } from './dto/create-solicitacao-response.dto';
import { CreateSolicitacaoDto } from './dto/create-solicitacao.dto';
import { GetSolicitacaoResponseDto } from './dto/get-solicitacao-response.dto';
import { ListSolicitacoesResponseDto } from './dto/list-solicitacoes-response.dto';
import { UpdateSolicitacaoStatusDto } from './dto/update-solicitacao-status.dto';
import { SolicitacaoService } from './solicitacao.service';
import { Patch } from '@nestjs/common';

@ApiTags('solicitacao')
@Controller('solicitacoes')
export class SolicitacaoController {
  private readonly logger: Logger = new Logger(SolicitacaoController.name);

  constructor(private readonly solicitacaoService: SolicitacaoService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar uma solicitação',
    description:
      'Criar uma nova solicitação com dados básicos iniciais. Id de usuário, Id do Veículo (Opcional), Id do serviço, Observação do Cliente (Opcional).',
  })
  @ApiCreatedResponse({
    description: 'Solicitação criada com sucesso com retorno de protocolo',
    type: CreateSolicitacaoResponseDto,
  })
  criarSolicitacao(
    @Body() solicitacaoDto: CreateSolicitacaoDto,
  ): Promise<CreateSolicitacaoResponseDto> {
    this.logger.log('Iniciando criacao de solicitacao de servico...');
    return this.solicitacaoService.criarSolicitacao(solicitacaoDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todas as solicitações',
    description:
      'Retorna uma lista com todas as solicitações do sistema com dados do cliente e serviço.',
  })
  @ApiOkResponse({
    description: 'Lista de solicitações retornada com sucesso',
    type: ListSolicitacoesResponseDto,
  })
  async listarSolicitacoes(): Promise<ListSolicitacoesResponseDto> {
    this.logger.log('Buscando lista de solicitações...');
    return this.solicitacaoService.listarSolicitacoes();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retornar os dados completos de uma solicitação',
    description:
      'Retorna os dados completos de uma solicitação pelo seu identificador. Rota destinada ao uso administrativo (CMS).',
  })
  @ApiOkResponse({
    description: 'Solicitação encontrada com sucesso',
    type: GetSolicitacaoResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Solicitação não encontrada',
    schema: {
      type: 'object',
      properties: {
        error: { type: 'string', example: 'SOLICITACAO_NAO_ENCONTRADA' },
        message: {
          type: 'string',
          example: 'A solicitação não foi encontrada',
        },
      },
    },
  })
  getSolicitacaoById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<GetSolicitacaoResponseDto> {
    this.logger.log(`Buscando solicitação com id=${id}...`);
    return this.solicitacaoService.getSolicitacaoById(id);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Atualizar status de solicitação',
    description:
      'Atualização parcial do status de uma solicitação com envio controlado de e-mails e proteção anti-spam.',
  })
  @ApiBody({
    type: UpdateSolicitacaoStatusDto,
    description: 'Dados para atualização do status da solicitação',
  })
  @ApiOkResponse({
    description: 'Status da solicitação atualizado com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Status da solicitação atualizado com sucesso.',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Solicitação não encontrada',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Solicitação com ID 999 não encontrada',
        },
        error: { type: 'string', example: 'Not Found' },
        statusCode: { type: 'number', example: 404 },
      },
    },
  })
  updateSolicitacaoStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSolicitacaoStatusDto: UpdateSolicitacaoStatusDto,
  ): Promise<{ message: string }> {
    return this.solicitacaoService.updateSolicitacaoStatusById(
      id,
      updateSolicitacaoStatusDto,
    );
  }

  @Post(':id/cancelar')
  @ApiOperation({
    summary: 'Cancelar solicitação',
    description:
      'Cancela uma solicitação utilizando a função central de atualização de status.',
  })
  @ApiOkResponse({
    description: 'Cancelamento realizado com sucesso',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 123 },
        status: { type: 'string', example: 'cancelado' },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Solicitação não encontrada',
  })
  @HttpCode(HttpStatus.OK)
  cancelarSolicitacao(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ id: number; status: 'cancelado' }> {
    return this.solicitacaoService.cancelarSolicitacao(id);
  }

  @Post(':id/reabrir')
  @ApiOperation({
    summary: 'Reabrir solicitação',
    description:
      'Reabre uma solicitação cancelada utilizando a função central de atualização de status.',
  })
  @ApiOkResponse({
    description: 'Reabertura realizada com sucesso',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 123 },
        status: { type: 'string', example: 'em_andamento' },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Solicitação não encontrada',
  })
  @HttpCode(HttpStatus.OK)
  reabrirSolicitacao(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ id: number; status: 'em_andamento' }> {
    return this.solicitacaoService.reabrirSolicitacao(id);
  }

  @Post(':id/documentos')
  @ApiOperation({
    summary: 'Adicionar um documento novo em uma solicitação existente.',
    description:
      'Adicionar um documento em uma solicitação com o status PENDENTE.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse({
    description: 'Documento enviado com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Documento enviado com sucesso e aguardando validação.',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Solicitação não encontrada',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tipo_documento: {
          type: 'string',
          example: 'RG',
        },
        documento: { type: 'string', format: 'binary' },
      },
      required: ['tipo_documento', 'documento'],
    },
  })
  @UseInterceptors(
    FileInterceptor('documento', {
      limits: {
        fileSize: 10 * 1024 * 1024, // Limite de 10MB
      },
    }),
  )
  enviarDocumento(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: CreateDocumentoDto,
    @UploadedFile(DocumentoFilePipe)
    documento: Express.Multer.File,
  ): Promise<{ message: string }> {
    return this.solicitacaoService.enviarDocumento(id, data, documento);
  }

  @Patch(':id/documentos/:docId')
  @ApiOperation({
    summary: 'Substituir arquivo de um documento vinculado a uma solicitação',
    description:
      'Substitui o arquivo de um documento já vinculado a uma solicitação, mantendo o mesmo vínculo e identificação do documento.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({
    description: 'Documento substituído com sucesso',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        mensagem: {
          type: 'string',
          example: 'Documento substituído com sucesso',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Solicitação ou documento não encontrado',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        documento: { type: 'string', format: 'binary' },
      },
      required: ['documento'],
    },
  })
  @UseInterceptors(
    FileInterceptor('documento', {
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  substituirDocumento(
    @Param('id', ParseIntPipe) id: number,
    @Param('docId', ParseIntPipe) docId: number,
    @UploadedFile(DocumentoFilePipe)
    documento: Express.Multer.File,
  ): Promise<{ id: number; mensagem: string }> {
    return this.solicitacaoService.substituirDocumento(id, docId, documento);
  }
}
