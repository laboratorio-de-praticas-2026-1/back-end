import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Patch,
  Param,
  ParseIntPipe,
  Post,
  Query,
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
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { DocumentoFilePipe } from 'src/commons/pipes/file.pipe';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { CreateSolicitacaoResponseDto } from './dto/create-solicitacao-response.dto';
import { CreateSolicitacaoDto } from './dto/create-solicitacao.dto';
import { GetSolicitacaoResponseDto } from './dto/get-solicitacao-response.dto';
import {
  ListSolicitacoesQueryDto,
  SOLICITACAO_ORDER_BY_FIELDS,
} from './dto/list-solicitacoes-query.dto';
import { ListSolicitacoesKanbanQueryDto } from './dto/list-solicitacoes-kanban-query.dto';
import {
  ListSolicitacoesResponseDto,
  ListSolicitacoesKanbanResponseDto,
} from './dto/list-solicitacoes-response.dto';
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
  })
  @ApiCreatedResponse({
    type: CreateSolicitacaoResponseDto,
  })
  criarSolicitacao(
    @Body() solicitacaoDto: CreateSolicitacaoDto,
  ): Promise<CreateSolicitacaoResponseDto> {
    this.logger.log('Iniciando criacao de solicitacao...');
    return this.solicitacaoService.criarSolicitacao(solicitacaoDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todas as solicitações',
  })
  @ApiOkResponse({
    type: ListSolicitacoesResponseDto,
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    enum: SOLICITACAO_ORDER_BY_FIELDS,
  })
  @ApiQuery({
    name: 'order',
    required: false,
    enum: ['asc', 'desc'],
  })
  async listarSolicitacoes(
    @Query() query: ListSolicitacoesQueryDto,
  ): Promise<ListSolicitacoesResponseDto> {
    this.logger.log('Buscando lista de solicitações...');
    return this.solicitacaoService.listarSolicitacoes(query);
  }

  @Get('kanban')
  @ApiOperation({
    summary: 'Listar solicitações no formato Kanban',
    description:
      'Retorna todas as solicitações agrupadas por status (sem paginação). Aplica todos os filtros exceto status.',
  })
  @ApiOkResponse({ type: ListSolicitacoesKanbanResponseDto })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    enum: SOLICITACAO_ORDER_BY_FIELDS,
  })
  @ApiQuery({
    name: 'order',
    required: false,
    enum: ['asc', 'desc'],
  })
  @ApiQuery({ name: 'usuario_id', required: false })
  @ApiQuery({ name: 'servico_id', required: false })
  @ApiQuery({ name: 'veiculo_id', required: false })
  @ApiQuery({ name: 'nome', required: false })
  @ApiQuery({ name: 'cpf_cnpj', required: false })
  @ApiQuery({ name: 'data_solicitacao_inicio', required: false })
  @ApiQuery({ name: 'data_solicitacao_fim', required: false })
  @ApiQuery({ name: 'data_conclusao_inicio', required: false })
  @ApiQuery({ name: 'data_conclusao_fim', required: false })
  @ApiQuery({ name: 'concluida', required: false })
  listarSolicitacoesKanban(
    @Query() query: ListSolicitacoesKanbanQueryDto,
  ): Promise<ListSolicitacoesKanbanResponseDto> {
    this.logger.log('Buscando solicitações no formato Kanban...');
    return this.solicitacaoService.listarSolicitacoesKanban(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: GetSolicitacaoResponseDto })
  @ApiNotFoundResponse({
    description: 'Solicitação não encontrada',
  })
  getSolicitacaoById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<GetSolicitacaoResponseDto> {
    return this.solicitacaoService.getSolicitacaoById(id);
  }

  @Patch(':id/status')
  @ApiBody({ type: UpdateSolicitacaoStatusDto })
  updateSolicitacaoStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSolicitacaoStatusDto,
  ): Promise<{ message: string }> {
    return this.solicitacaoService.updateSolicitacaoStatusById(id, dto);
  }

  @Post(':id/cancelar')
  @HttpCode(HttpStatus.OK)
  cancelarSolicitacao(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ id: number; status: 'cancelado' }> {
    return this.solicitacaoService.cancelarSolicitacao(id);
  }

  @Post(':id/reabrir')
  @HttpCode(HttpStatus.OK)
  reabrirSolicitacao(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ id: number; status: 'em_andamento' }> {
    return this.solicitacaoService.reabrirSolicitacao(id);
  }

  @Post(':id/documentos')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('documento'))
  enviarDocumento(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: CreateDocumentoDto,
    @UploadedFile(DocumentoFilePipe) file: Express.Multer.File,
  ): Promise<{ message: string }> {
    return this.solicitacaoService.enviarDocumento(id, data, file);
  }

  @Get(':id/documentos')
  listarDocumentos(@Param('id', ParseIntPipe) id: number): Promise<unknown> {
    return this.solicitacaoService.listarDocumentos(id);
  }

  @Patch(':id/documentos/:docId')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('documento'))
  substituirDocumento(
    @Param('id', ParseIntPipe) id: number,
    @Param('docId', ParseIntPipe) docId: number,
    @UploadedFile(DocumentoFilePipe) file: Express.Multer.File,
  ): Promise<{ id: number; mensagem: string }> {
    return this.solicitacaoService.substituirDocumento(id, docId, file);
  }
}
