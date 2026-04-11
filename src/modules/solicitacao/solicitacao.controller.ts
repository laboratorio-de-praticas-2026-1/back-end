import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
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
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { DocumentoFilePipe } from 'src/commons/pipes/file.pipe';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { CreateSolicitacaoResponseDto } from './dto/create-solicitacao-response.dto';
import { CreateSolicitacaoDto } from './dto/create-solicitacao.dto';
import { ListSolicitacoesResponseDto } from './dto/list-solicitacoes-response.dto';
import { UpdateSolicitacaoStatusDto } from './dto/update-solicitacao-status.dto';
import { SolicitacaoService } from './solicitacao.service';

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

  @Put(':id')
  @ApiOperation({
    summary: 'Atualizar status de solicitação',
    description: 'Atualizar status de solicitação e mudar observação de Admin.',
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
}
