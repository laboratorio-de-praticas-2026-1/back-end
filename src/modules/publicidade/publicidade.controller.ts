import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminGuard } from '../usuario/guards/admin.guard';
import { imageFilePipe } from 'src/commons/pipes/file.pipe';
import { Publicidade } from '../../models/publicidade.model';
import {
  PublicidadeCreateDto,
  PublicidadeResponseDto,
} from './dto/publicidade-create.dto';
import { PublicidadeUpdateDto } from './dto/publicidade-update.dto';
import { PublicidadeService } from './publicidade.service';

@ApiTags('Publicidade')
@Controller('publicidade')
export class PublicidadeController {
  private readonly logger = new Logger(PublicidadeController.name);

  constructor(private readonly publicidadeService: PublicidadeService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas as publicidades' })
  @ApiResponse({ status: 200, type: PublicidadeResponseDto, isArray: true })
  getAll(): Promise<Publicidade[]> {
    this.logger.log('Listando todas as publicidades...');
    return this.publicidadeService.getAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar publicidade por ID' })
  @ApiResponse({ status: 200, type: PublicidadeResponseDto })
  getById(@Param('id', ParseIntPipe) id: number): Promise<Publicidade> {
    this.logger.log(`Buscando publicidade ID: ${id}`);
    return this.publicidadeService.getById(id);
  }

  @Get('/status/:status')
  @ApiOperation({ summary: 'Buscar publicidade por status (ativo, inativo)' })
  @ApiResponse({ status: 200, type: PublicidadeResponseDto })
  getByStatus(@Param('status') status: string): Promise<Publicidade[]> {
    this.logger.log(`Buscando publicidade por status: ${status}`);
    if (status !== 'ativo' && status !== 'inativo') {
      throw new BadRequestException(
        "Status inválido. Use 'ativo' ou 'inativo'.",
      );
    }
    return this.publicidadeService.getByStatus(
      status === 'ativo' ? true : false,
    );
  }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar uma nova publicidade' })
  @ApiResponse({ status: 201, type: PublicidadeResponseDto })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        titulo: { type: 'string', example: 'Seguro Auto Completo' },
        conteudo: {
          type: 'string',
          example: 'Proteja seu veiculo com nosso parceiro credenciado.',
        },
        ativo: {
          type: 'boolean',
          example: true,
          default: true,
        },
        file: { type: 'string', format: 'binary' },
      },
      required: ['titulo', 'conteudo', 'file'],
    },
  })
  @ApiConsumes('multipart/form-data')
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  criarPublicidade(
    @Body() publicidadeDto: PublicidadeCreateDto,
    @UploadedFile(imageFilePipe) file: Express.Multer.File,
  ): Promise<Publicidade> {
    this.logger.log(`Iniciando criacao de publicidade...`);
    return this.publicidadeService.criarPublicidade(publicidadeDto, file);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar publicidade' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        titulo: { type: 'string', nullable: true },
        conteudo: { type: 'string', nullable: true },
        ativo: { type: 'boolean', nullable: true },
        imagem: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('imagem'))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PublicidadeUpdateDto,
    @UploadedFile(imageFilePipe)
    imagem?: Express.Multer.File,
  ): Promise<Publicidade> {
    this.logger.log(`Atualizando publicidade...`);

    return this.publicidadeService.update(id, dto, imagem);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover publicidade por ID' })
  @ApiResponse({ status: 200, description: 'Publicidade removida com sucesso' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Removendo publicidade ID: ${id}`);
    await this.publicidadeService.remove(id);
    return { message: `Publicidade com ID ${id} removida com sucesso` };
  }
}
