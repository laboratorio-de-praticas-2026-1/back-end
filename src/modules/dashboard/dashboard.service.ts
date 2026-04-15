import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, fn, col } from 'sequelize';
import { Usuario } from 'src/models/usuario.model';
import { DocumentoSolicitacao } from 'src/models/documento-solicitacao.model';
import { Servico } from 'src/models/servico.model';
import { Solicitacao } from 'src/models/solicitacao.model';
import { DashboardReturnDto } from './dto/dashboard-return.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Solicitacao)
    private readonly solicitacaoModel: typeof Solicitacao,
    @InjectModel(DocumentoSolicitacao)
    private readonly documentoSolicitacaoModel: typeof DocumentoSolicitacao,
    @InjectModel(Usuario) private readonly usuarioModel: typeof Usuario,
    ) {}

  async retornarInfosDashboard(inicio?: string, fim?: string): Promise<DashboardReturnDto> {
    const dataFim = fim ? new Date(`${fim}T23:59:59`) : new Date();
    const dataInicio = inicio ? new Date(`${inicio}T00:00:00`) : new Date();
    if (!inicio) dataInicio.setMonth(dataFim.getMonth() -6);

    const inicioMesAtual = new Date();
    inicioMesAtual.setDate(1);
    inicioMesAtual.setHours(0, 0, 0, 0);
  
    const [
      abertas,
      concluidasNoPeriodo,
      docsPendentes,
      clientesNovosMesAtual,
      totalCriadasPeriodo,
      totalCanceladasPeriodo,
      financeiroDebitos
    ] = await Promise.all([
      this.solicitacaoModel.count({
        where: { status: { [Op.in]: ['recebido', 'aguardando_pagamento', 'aguardando_documento', 'em_andamento'] } },
      }),

      this.solicitacaoModel.count({
        where: { status: 'concluido', dataConclusao: { [Op.between]: [dataInicio, dataFim] } },
      }),

      this.documentoSolicitacaoModel.count({
        where: { statusValidacao: 'pendente' },
      }),

      this.usuarioModel.count({
        where: { nivel: 'cliente', dataCadastro: { [Op.gte]: inicioMesAtual } },
      }),

      this.solicitacaoModel.count({
        where: { dataSolicitacao: { [Op.between]: [dataInicio, dataFim] } },
      }),

      this.solicitacaoModel.count({
        where: { status: 'cancelado', updatedAt: { [Op.between]: [dataInicio, dataFim] } },
      }),

      this.solicitacaoModel.findAll({
        attributes: [
          [fn('COUNT', col('Solicitacao.id')), 'qtd'],
          [fn('SUM', col('servico.valor_base')), 'total']
        ],
        include: [{ model: Servico, attributes: [] }],
        where: { status: 'aguardando_pagamento' },
        raw: true,
      })
    ]);

    const taxaPct = totalCriadasPeriodo > 0 ? (totalCanceladasPeriodo / totalCriadasPeriodo) * 100 : 0;
    const finRes = financeiroDebitos[0] as any;
    
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
      geral: {
        solicitacoesEmAberto: abertas, 
        solicitacoesConcluidas: concluidasNoPeriodo, 
        documentosPendentesValidacao: docsPendentes,
        clientesNovosMesAtual,
        taxaCancelamentoPct: Number(taxaPct.toFixed(2)),
        debitosEmAberto: {
          quantidade: Number(finRes?.qtd) || 0,
          valorTotal: Number(finRes?.total) || 0
        },
        parcelasVencidasNaoPagas: {
          quantidade: 0,
          valorTotal: 0
        }
      }
    } as any;
  }
}