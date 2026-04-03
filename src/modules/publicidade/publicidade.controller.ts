<<<<<<< Updated upstream
import {
  Body,
  Controller,
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
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { imageFilePipe } from 'src/commons/pipes/file.pipe';
import { Publicidade } from '../../models/publicidade.model';
import {
  PublicidadeCreateDto,
  PublicidadeResponseDto,
} from './dto/publicidade-create.dto';
import { PublicidadeUpdateDto } from './dto/publicidade-update.dto';
import { PublicidadeService } from './publicidade.service';

@ApiTags('Publicidade')
=======
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { PublicidadeService } from './publicidade.service';
import { Publicidade } from 'src/models/publicidade.model';
 
>>>>>>> Stashed changes
@Controller('publicidade')
export class PublicidadeController {
  private readonly logger = new Logger(PublicidadeController.name);

  constructor(private readonly publicidadeService: PublicidadeService) {}
<<<<<<< Updated upstream

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
  @ApiOperation({ summary: 'Atualizar publicidade' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        titulo: { type: 'string', nullable: true },
        conteudo: { type: 'string', nullable: true },
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
=======
 
  @Get()
  async getAll(): Promise<Publicidade[]> {
    return this.publicidadeService.getAll();
  }
 
  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number): Promise<Publicidade> {
    return this.publicidadeService.getById(id);
>>>>>>> Stashed changes
  }
}
 