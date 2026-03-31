import {
  Body,
  Controller,
  Logger,
  Post,
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
import { PublicidadeService } from './publicidade.service';
import {
  PublicidadeCreateDto,
  PublicidadeResponseDto,
} from './dto/publicidade-create.dto';

@ApiTags('Publicidade')
@Controller('publicidade')
export class PublicidadeController {
  private readonly logger = new Logger(PublicidadeController.name);

  constructor(private readonly publicidadeService: PublicidadeService) {}

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
}
