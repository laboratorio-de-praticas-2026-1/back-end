import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import 'multer';
import { DocumentoFilePipe } from 'src/commons/pipes/file.pipe';
import { AdminGuard } from '../usuario/guards/admin.guard';
import { JwtAuthGuard } from '../usuario/guards/jwt-auth.guard';
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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
    @Req() req: { user: { id: number } },
  ): Promise<CreateSolicitacaoResponseDto> {
    this.logger.log('Iniciando criacao de solicitacao de servico...');
    return this.solicitacaoService.criarSolicitacao(
      solicitacaoDto,
      req.user.id,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiBearerAuth()
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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
    @Req() req: { user: { id: number } },
  ): Promise<{ message: string }> {
    return this.solicitacaoService.enviarDocumento(
      id,
      req.user.id,
      data,
      documento,
    );
  }
}
