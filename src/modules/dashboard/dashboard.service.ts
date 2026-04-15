import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, fn, col, literal } from 'sequelize';
import { Solicitacao } from 'src/models/solicitacao.model';
import { Servico } from 'src/models/servico.model';
import { DashboardReturnDto } from './dto/dashboard-return.dto';

type StatusCountRow = {
  status: string;
  quantidade: number | string;
};

type TempoConclusaoRow = {
  servicoId: number | string;
  servicoNome: string;
  prazoEstimadoDias: number | string | null;
  mediaRealDias: number | string;
  totalConcluidas: number | string;
};

@Injectable()
export class DashboardService {
  private readonly DIAS_ALERTA_VENCIMENTO = 3;

  constructor(
    @InjectModel(Solicitacao)
    private readonly solicitacaoModel: typeof Solicitacao,

    @InjectModel(Servico)
    private readonly servicoModel: typeof Servico,
  ) {}

  private obterPeriodo(inicio?: string, fim?: string) {
    const hoje = new Date();

    const dataFim = fim ? new Date(`${fim}T23:59:59.999`) : hoje;

    const dataInicio = inicio
      ? new Date(`${inicio}T00:00:00.000`)
      : new Date(new Date().setMonth(new Date().getMonth() - 6));

    return { dataInicio, dataFim };
  }

  async retornarInfosDashboard(
    inicio?: string,
    fim?: string,
  ): Promise<DashboardReturnDto> {
    const { dataInicio, dataFim } = this.obterPeriodo(inicio, fim);

    const statusAbertos = [
      'recebido',
      'aguardando_pagamento',
      'aguardando_documento',
      'em_andamento',
    ];

    const [
      porStatusRaw,
      proximasDeVencerQuantidade,
      tempoConclusaoPorServicoRaw,
      foraDoPrazoQuantidade,
      totalConcluidas,
    ] = await Promise.all([
      this.solicitacaoModel.findAll({
        attributes: [
          'status',
          [fn('COUNT', col('Solicitacao.id')), 'quantidade'],
        ],
        where: {
          dataSolicitacao: {
            [Op.between]: [dataInicio, dataFim],
          },
        },
        group: [col('Solicitacao.status')],
        raw: true,
      }) as unknown as Promise<StatusCountRow[]>,

      this.solicitacaoModel.count({
        include: [
          {
            model: Servico,
            attributes: [],
            required: true,
          },
        ],
        where: {
          status: {
            [Op.in]: statusAbertos,
          },
          dataSolicitacao: {
            [Op.between]: [dataInicio, dataFim],
          },
          [Op.and]: [
            literal('`servico`.`prazo_estimado_dias` IS NOT NULL'),
            literal(`
              DATEDIFF(NOW(), \`Solicitacao\`.\`data_solicitacao\`)
              BETWEEN GREATEST(\`servico\`.\`prazo_estimado_dias\` - ${this.DIAS_ALERTA_VENCIMENTO}, 0)
              AND \`servico\`.\`prazo_estimado_dias\`
            `),
          ],
        },
      }),

      this.solicitacaoModel.findAll({
        attributes: [
          [col('Solicitacao.servico_id'), 'servicoId'],
          [col('servico.nome'), 'servicoNome'],
          [col('servico.prazo_estimado_dias'), 'prazoEstimadoDias'],
          [
            fn(
              'AVG',
              literal(
                'DATEDIFF(`Solicitacao`.`data_conclusao`, `Solicitacao`.`data_solicitacao`)',
              ),
            ),
            'mediaRealDias',
          ],
          [fn('COUNT', col('Solicitacao.id')), 'totalConcluidas'],
        ],
        include: [
          {
            model: Servico,
            attributes: [],
            required: true,
          },
        ],
        where: {
          status: 'concluido',
          dataConclusao: {
            [Op.between]: [dataInicio, dataFim],
          },
        },
        group: [
          col('Solicitacao.servico_id'),
          col('servico.id'),
          col('servico.nome'),
          col('servico.prazo_estimado_dias'),
        ],
        order: [[literal('mediaRealDias'), 'DESC']],
        raw: true,
      }) as unknown as Promise<TempoConclusaoRow[]>,

      this.solicitacaoModel.count({
        include: [
          {
            model: Servico,
            attributes: [],
            required: true,
          },
        ],
        where: {
          status: 'concluido',
          dataConclusao: {
            [Op.between]: [dataInicio, dataFim],
          },
          [Op.and]: [
            literal('`servico`.`prazo_estimado_dias` IS NOT NULL'),
            literal(`
              DATEDIFF(\`Solicitacao\`.\`data_conclusao\`, \`Solicitacao\`.\`data_solicitacao\`)
              > \`servico\`.\`prazo_estimado_dias\`
            `),
          ],
        },
      }),

      this.solicitacaoModel.count({
        where: {
          status: 'concluido',
          dataConclusao: {
            [Op.between]: [dataInicio, dataFim],
          },
        },
      }),
    ]);

    const porStatusBase = {
      recebido: 0,
      emAndamento: 0,
      aguardandoPagamento: 0,
      aguardandoDocumento: 0,
      concluido: 0,
      cancelado: 0,
    };

    const porStatus = porStatusRaw.reduce((acc, item) => {
      const quantidade = Number(item.quantidade ?? 0);

      if (item.status === 'recebido') {
        acc.recebido = quantidade;
      }

      if (item.status === 'em_andamento') {
        acc.emAndamento = quantidade;
      }

      if (item.status === 'aguardando_pagamento') {
        acc.aguardandoPagamento = quantidade;
      }

      if (item.status === 'aguardando_documento') {
        acc.aguardandoDocumento = quantidade;
      }

      if (item.status === 'concluido') {
        acc.concluido = quantidade;
      }

      if (item.status === 'cancelado') {
        acc.cancelado = quantidade;
      }

      return acc;
    }, porStatusBase);

    const tempoConclusaoPorServico = tempoConclusaoPorServicoRaw.map(
      (item) => ({
        servicoId: Number(item.servicoId),
        servicoNome: item.servicoNome,
        prazoEstimadoDias: Number(item.prazoEstimadoDias ?? 0),
        mediaRealDias: Number(Number(item.mediaRealDias).toFixed(2)),
        totalConcluidas: Number(item.totalConcluidas),
      }),
    );

    const percentual =
      totalConcluidas > 0
        ? Number(((foraDoPrazoQuantidade / totalConcluidas) * 100).toFixed(2))
        : 0;

    return {
      solicitacoes: {
        porStatus,
        proximasDeVencer: {
          quantidade: proximasDeVencerQuantidade,
        },
        tempoConclusaoPorServico,
        foraDoPrazo: {
          quantidade: foraDoPrazoQuantidade,
          totalConcluidas,
          percentual,
        },
      },
    };
  }
}
