import { BadRequestException, Injectable } from '@nestjs/common';
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
    @InjectModel(Usuario)
    private readonly usuarioModel: typeof Usuario,
  ) {}

  async retornarInfosDashboard(
    inicio?: string,
    fim?: string,
  ): Promise<DashboardReturnDto> {
    const de = inicio ? this.parseYmdDate(inicio, 'inicio') : undefined;
    const ate = fim ? this.parseYmdDate(fim, 'fim') : undefined;

    if (de && ate && de.key > ate.key) {
      throw new BadRequestException(
        'Intervalo inválido: "inicio" não pode ser maior que "fim"',
      );
    }

    const dataFim = ate ? new Date(`${ate.ymd}T23:59:59`) : new Date();
    const dataInicio = de ? new Date(`${de.ymd}T00:00:00`) : new Date();

    if (!inicio) {
      dataInicio.setMonth(dataFim.getMonth() - 6);
      dataInicio.setHours(0, 0, 0, 0);
    }

    const inicioMesAtual = new Date();
    inicioMesAtual.setDate(1);
    inicioMesAtual.setHours(0, 0, 0, 0);

    const [
      abertas,
      concluidasNoPeriodo,
      docsPendentes,
      clientesNovos,
      totalCriadasPeriodo,
      totalCanceladasPeriodo,
      financeiroDebitos,
      parcelasVencidasRes,
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
        where: {
          status: 'concluido',
          dataConclusao: { [Op.between]: [dataInicio, dataFim] },
        },
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
        where: {
          status: 'cancelado',
          updatedAt: { [Op.between]: [dataInicio, dataFim] },
        },
      }),
      this.solicitacaoModel.findAll({
        attributes: [
          [fn('COUNT', col('Solicitacao.id')), 'qtd'],
          [fn('SUM', col('servico.valor_base')), 'total'],
        ],
        include: [{ model: Servico, attributes: [] }],
        where: { status: 'aguardando_pagamento' },
        raw: true,
      }),
      this.solicitacaoModel.findAll({
        attributes: [
          [fn('COUNT', col('Solicitacao.id')), 'qtd'],
          [fn('SUM', col('servico.valor_base')), 'total'],
        ],
        include: [{ model: Servico, attributes: [] }],
        where: { status: 'vencido' },
        raw: true,
      }),
    ]);

    const taxaPct =
      totalCriadasPeriodo > 0
        ? (totalCanceladasPeriodo / totalCriadasPeriodo) * 100
        : 0;
    const finRes = financeiroDebitos[0] as unknown as {
      qtd: number;
      total: number;
    };
    const parcRes = parcelasVencidasRes[0] as unknown as {
      qtd: number;
      total: number;
    };
    return {
      geral: {
        solicitacoesEmAberto: abertas,
        solicitacoesConcluidas: concluidasNoPeriodo,
        documentosPendentesValidacao: docsPendentes,
        clientesNovosMesAtual: clientesNovos,
        taxaCancelamentoPct: Number(taxaPct.toFixed(2)),
        debitosEmAberto: {
          quantidade: Number(finRes?.qtd) || 0,
          valorTotal: Number(finRes?.total) || 0,
        },
        parcelasVencidasNaoPagas: {
          quantidade: Number(parcRes?.qtd) || 0,
          valorTotal: Number(parcRes?.total) || 0,
        },
      },
    };
  }

  private parseYmdDate(
    valor: string,
    campo: string,
  ): { ymd: string; key: number } {
    const match = valor.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) {
      throw new BadRequestException(
        `Campo "${campo}" deve estar no formato YYYY-MM-DD`,
      );
    }

    const dia = Number(match[3]);
    const mes = Number(match[2]);
    const ano = Number(match[1]);

    const dataUtc = new Date(Date.UTC(ano, mes - 1, dia, 0, 0, 0, 0));

    const isDataValida =
      dataUtc.getUTCFullYear() === ano &&
      dataUtc.getUTCMonth() === mes - 1 &&
      dataUtc.getUTCDate() === dia;

    if (!isDataValida) {
      throw new BadRequestException(`Data inválida no campo "${campo}"`);
    }

    return {
      ymd: `${String(ano).padStart(4, '0')}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`,
      key: ano * 10000 + mes * 100 + dia,
    };
  }
}
