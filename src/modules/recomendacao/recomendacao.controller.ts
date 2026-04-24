import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RecomendacaoInteracaoRequestDto } from './dto/recomendacao-interacao-request.dto';
import { RecomendacaoInteracaoResponseDto } from './dto/recomendacao-interacao-response.dto';
import { RecomendacaoRespostaDto } from './dto/recomendacao-resposta.dto';
import { RecomendacaoService } from './recomendacao.service';

@ApiTags('Recomendações')
@Controller('recomendacoes')
export class RecomendacaoController {
  private readonly logger = new Logger(RecomendacaoController.name);
  constructor(private readonly recomendacaoService: RecomendacaoService) {}

  @Get(':usuarioId')
  @ApiOperation({ summary: 'Gera recomendações de serviços para o usuário' })
  @ApiResponse({
    status: 200,
    description: 'Lista de serviços recomendados retornada com sucesso.',
    type: RecomendacaoRespostaDto,
    isArray: true,
  })
  async getRecomendacao(@Param('usuarioId', ParseIntPipe) usuarioId: number) {
    return this.recomendacaoService.obterRecomendacoes(usuarioId);
  }

  @Post()
  @ApiOperation({ summary: 'Registrar interação do usuário com o blog' })
  criarInteracao(
    @Body() interacaoDto: RecomendacaoInteracaoRequestDto,
  ): Promise<RecomendacaoInteracaoResponseDto> {
    const { usuarioId } = interacaoDto;
    return this.recomendacaoService.criarInteracao(usuarioId, interacaoDto);
  }
}