import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { DocumentoSolicitacao } from 'src/models/documento-solicitacao.model';
import { Solicitacao } from 'src/models/solicitacao.model';
import { DashboardReturnDto } from './dto/dashboard-return.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Solicitacao)
    private readonly solicitacaoModel: typeof Solicitacao,
    @InjectModel(DocumentoSolicitacao)
    private readonly documentoSolicitacaoModel: typeof DocumentoSolicitacao,
  ) {}

  async retornarInfosDashboard(): Promise<DashboardReturnDto> {
    const [
      solicitacoesEmAberto,
      solicitacoesConcluidas,
      documentosPendentesValidacao,
    ] = await Promise.all([
      this.solicitacaoModel.count({
        where: {
          status: {
            [Op.in]: [
              'recebido',
              'aguardando_pagamento',
              'aguardando_documento',
              'em_andamento',
            ],
          },
        },
      }),
      this.solicitacaoModel.count({
        where: { status: 'concluido' },
      }),
      this.documentoSolicitacaoModel.count({
        where: { statusValidacao: 'pendente' },
      }),
    ]);

    return {
      solicitacoes: {
        solicitacoesEmAberto,
        solicitacoesConcluidas,
        documentosPendentesValidacao,
      },
    };
  }
}
