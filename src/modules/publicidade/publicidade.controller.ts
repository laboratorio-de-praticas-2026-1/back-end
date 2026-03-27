import { Body, Controller, Logger, Post } from '@nestjs/common';
import { PublicidadeService } from './publicidade.service';
import {
  PublicidadeCreateDto,
  PublicidadeResponseDto,
} from './dto/publicidade-create.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Publicidade } from '../../models/publicidade.model';

@ApiTags('Publicidade')
@Controller('publicidade')
export class PublicidadeController {
  private readonly logger = new Logger(PublicidadeController.name);

  constructor(private readonly publicidadeService: PublicidadeService) {}

  @ApiOperation({ summary: 'Criar uma nova publicidade' })
  @ApiResponse({ status: 201, type: PublicidadeResponseDto })
  @Post()
  criarPublicidade(
    @Body() publicidadeDto: PublicidadeCreateDto,
  ): Promise<Publicidade> {
    this.logger.log(`Iniciando criacao de publicidade...`);
    return this.publicidadeService.criarPublicidade(publicidadeDto);
  }
}
