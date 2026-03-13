import { Body, Controller, Logger, Post } from '@nestjs/common';
import { CreateSolicitacaoDto } from './dto/create-solicitacao.dto';
import { SolicitacaoService } from './solicitacao.service';

@Controller('solicitacao')
export class SolicitacaoController {
  private readonly logger = new Logger(SolicitacaoController.name);

  constructor(private readonly solicitacaoService: SolicitacaoService) {}

  @Post()
  criarSolicitacao(@Body() solicitacaoDto: CreateSolicitacaoDto) {
    this.logger.log('Iniciando criacao de solicitacao de servico...');
    return this.solicitacaoService.criarSolicitacao(solicitacaoDto);
  }
}
