import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../usuario/guards/jwt-auth.guard';
import { RecomendacaoInteracaoRequestDto } from './dto/recomendacao-interacao-request.dto';
import { RecomendacaoInteracaoResponseDto } from './dto/recomendacao-interacao-response.dto';
import { RecomendacaoRespostaDto } from './dto/recomendacao-resposta.dto';
import { RecomendacaoService } from './recomendacao.service';

@ApiTags('Recomendações')
@Controller('recomendacoes')
export class RecomendacaoController {
  private readonly logger = new Logger(RecomendacaoController.name);
  constructor(private readonly recomendacaoService: RecomendacaoService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Gera recomendações de serviços para o usuário autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de serviços recomendados retornada com sucesso.',
    type: RecomendacaoRespostaDto,
    isArray: true,
  })
  async getRecomendacao(@Req() req: { user: { id: number } }) {
    const user = req.user;
    this.logger.log(`Gerando recomendações para o usuário ${user.id}`);
    return this.recomendacaoService.obterRecomendacoes(user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Registrar interação do usuário com o blog' })
  @ApiResponse({
    status: 201,
    description: 'Interação registrada com sucesso.',
    type: RecomendacaoInteracaoResponseDto,
  })
  criarInteracao(
    @Req() req: { user: { id: number } },
    @Body() interacaoDto: RecomendacaoInteracaoRequestDto,
  ): Promise<RecomendacaoInteracaoResponseDto> {
    const user = req.user;
    this.logger.log(
      `Registrando interação para o usuário ${user.id} na categoria ${interacaoDto.categoriaBlog} em ${interacaoDto.dataInteracao}`,
    );
    return this.recomendacaoService.criarInteracao(user.id, interacaoDto);
  }
}
