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
    // @Req() req: Request & { user?: { id?: number } },
    @Body() interacaoDto: RecomendacaoInteracaoRequestDto,
  ): Promise<RecomendacaoInteracaoResponseDto> {
    // import de @nestjs/common: Req, UnauthorizedException
    // import { Request } from 'express';
    // const usuarioId = req.user?.id;
    // if (!usuarioId) {
    //   throw new UnauthorizedException('Usuário não autenticado.');
    // }
    const { usuarioId } = interacaoDto;

    this.logger.log(
      `Registrando interação do usuário ${usuarioId} com blog na categoria ${interacaoDto.categoriaBlog}`,
    );

    return this.recomendacaoService.criarInteracao(usuarioId, interacaoDto);
  }
}