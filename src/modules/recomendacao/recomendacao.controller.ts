import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { RecomendacaoService } from './recomendacao.service';
import { RecomendacaoRespostaDto } from './dto/recomendacao-resposta.dto';

@ApiTags('Recomendações')
@Controller('recomendacoes')
export class RecomendacaoController {
  constructor(private readonly recomendacaoService: RecomendacaoService) {}

  @Get(':usuarioId')
  @ApiOperation({ summary: 'Gera recomendações de serviços para o usuário' })
  @ApiResponse({
    status: 200,
    description: 'Lista de serviços recomendados retornada com sucesso.',
    type: RecomendacaoRespostaDto,
    isArray: true, 
  })
  async getRecomendacao(
    @Param('usuarioId', ParseIntPipe) usuarioId: number,
  ) {
    return await this.recomendacaoService.obterRecomendacoes(usuarioId);
  }
}