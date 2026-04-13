import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { Body, Controller, Logger, Post } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { RecomendacaoInteracaoRequestDto } from './dto/recomendacao-interacao-request.dto';
import { RecomendacaoInteracaoResponseDto } from './dto/recomendacao-interacao-response.dto';
import { RecomendacaoService } from './recomendacao.service';
import { RecomendacaoRespostaDto } from './dto/recomendacao-resposta.dto';

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
  async getRecomendacao(
    @Param('usuarioId', ParseIntPipe) usuarioId: number,
  ) {
    return await this.recomendacaoService.obterRecomendacoes(usuarioId);
  }
}
  @Post()
  @ApiOperation({ summary: 'Registrar interação do usuário com o blog' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        categoriaBlog: {
          type: 'string',
          enum: ['Documentacao', 'Debitos', 'Multas', 'Legislacao', 'Condutor'],
          example: 'Documentacao',
        },
        dataInteracao: {
          type: 'string',
          format: 'date',
          example: '2024-05-20',
        },
      },
      required: ['categoriaBlog', 'dataInteracao'],
    },
  })
  criarInteracao(
    // @Req() req: Request & { user?: { id?: number } },
    @Body() interacaoDto: RecomendacaoInteracaoRequestDto,
  ): Promise<RecomendacaoInteracaoResponseDto> {
    // const usuarioId = req.user?.id;
    // if (!usuarioId) {
    //   throw new UnauthorizedException('Usuário não autenticado.');
    // }
    const usuarioId = 1;

    this.logger.log(
      `Registrando interação do usuário ${usuarioId} com blog na categoria ${interacaoDto.categoriaBlog}`,
    );

    return this.recomendacaoService.criarInteracao(usuarioId, interacaoDto);
  }
}
