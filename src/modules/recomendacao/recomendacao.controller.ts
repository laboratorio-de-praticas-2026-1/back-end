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
import { JwtPayload } from 'jsonwebtoken';
import { RecomendacaoInteracaoRequestDto } from './dto/recomendacao-interacao-request.dto';
import { RecomendacaoInteracaoResponseDto } from './dto/recomendacao-interacao-response.dto';
import { RecomendacaoRespostaDto } from './dto/recomendacao-resposta.dto';
import { RecomendacaoService } from './recomendacao.service';
import { UsuarioOwnerGuard } from '../usuario/guards/usuario-owner.guard';

@ApiTags('Recomendações')
@Controller('recomendacoes')
@UseGuards(UsuarioOwnerGuard)
@ApiBearerAuth()
export class RecomendacaoController {
  private readonly logger = new Logger(RecomendacaoController.name);
  constructor(private readonly recomendacaoService: RecomendacaoService) {}

  @Get()
  @ApiOperation({
    summary: 'Gera recomendações de serviços para o usuário autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de serviços recomendados retornada com sucesso.',
    type: RecomendacaoRespostaDto,
    isArray: true,
  })
  async getRecomendacao(@Req() request: Request) {
    const user = (request as Request & { user: JwtPayload }).user;
    this.logger.log(`Gerando recomendações para o usuário ${user.id}`);
    return this.recomendacaoService.obterRecomendacoes(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Registrar interação do usuário com o blog' })
  @ApiResponse({
    status: 201,
    description: 'Interação registrada com sucesso.',
    type: RecomendacaoInteracaoResponseDto,
  })
  criarInteracao(
    @Req() request: Request,
    @Body() interacaoDto: RecomendacaoInteracaoRequestDto,
  ): Promise<RecomendacaoInteracaoResponseDto> {
    const user = (request as Request & { user: JwtPayload }).user;
    this.logger.log(
      `Registrando interação para o usuário ${user.id} na categoria ${interacaoDto.categoriaBlog} em ${interacaoDto.dataInteracao}`,
    );
    return this.recomendacaoService.criarInteracao(user.id, interacaoDto);
  }
}
