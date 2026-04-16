import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, fn, col } from 'sequelize';
import { DocumentoSolicitacao } from 'src/models/documento-solicitacao.model';
import { Solicitacao } from 'src/models/solicitacao.model';
import { Veiculo } from 'src/models/veiculo.model';
import { Debito } from 'src/models/debito.model';
import { DebitoVeiculo } from 'src/models/debito-veiculo.model';
import { DashboardReturnDto } from './dto/dashboard-return.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Solicitacao)
    private readonly solicitacaoModel: typeof Solicitacao,
    @InjectModel(DocumentoSolicitacao)
    private readonly documentoSolicitacaoModel: typeof DocumentoSolicitacao,
    @InjectModel(Veiculo)
    private readonly veiculoModel: typeof Veiculo,
    @InjectModel(Debito)
    private readonly debitoModel: typeof Debito,
    @InjectModel(DebitoVeiculo)
    private readonly debitoVeiculoModel: typeof DebitoVeiculo,
  ) {}

  async retornarInfosDashboard(): Promise<DashboardReturnDto> {
    const [
      solicitacoesEmAberto,
      solicitacoesConcluidas,
      documentosPendentesValidacao,
      totalVeiculosCadastrados,
      veiculosComSolicitacaoAtiva,
      debitosPendentesResult,
    ] = await Promise.all([
      // Queries existentes
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

      // Total de veículos cadastrados
      this.veiculoModel.count(),

      // Veículos com solicitação ativa
      this.solicitacaoModel.count({
        where: {
          veiculoId: { [Op.ne]: null },
          status: {
            [Op.in]: [
              'recebido',
              'aguardando_pagamento',
              'aguardando_documento',
              'em_andamento',
            ],
          },
        },
        distinct: true,
        col: 'veiculo_id',
      }),

      // Débitos pendentes por veículo
      this.debitoVeiculoModel.findAll({
        include: [
          {
            model: Debito,
            where: { status: 'pendente' },
            attributes: [],
          },
          {
            model: Veiculo,
            attributes: ['id', 'placa'],
          },
        ],
        attributes: [
          'idVeiculo',
          [fn('COUNT', col('DebitoVeiculo.id')), 'totalDebitos'],
          [fn('SUM', col('debito.valor')), 'valorTotal'],
        ],
        group: ['idVeiculo', 'veiculo.id'],
        raw: true,
        nest: true,
      }),
    ]);

    interface DebitoVeiculoRaw {
      idVeiculo: number;
      totalDebitos: string;
      valorTotal: string;
      veiculo: { placa: string };
    }

    const porVeiculo = (
      debitosPendentesResult as unknown as DebitoVeiculoRaw[]
    ).map((item) => ({
      veiculoId: item.idVeiculo,
      placa: item.veiculo.placa,
      totalDebitos: Number(item.totalDebitos),
      valorTotal: Number(item.valorTotal),
    }));

    const valorTotalGeral = porVeiculo.reduce(
      (acc, item) => acc + item.valorTotal,
      0,
    );

    return {
      solicitacoes: {
        solicitacoesEmAberto,
        solicitacoesConcluidas,
        documentosPendentesValidacao,
      },
      veiculos: {
        totalCadastrados: totalVeiculosCadastrados,
        comSolicitacaoAtiva: veiculosComSolicitacaoAtiva,
        comDebitoPendente: porVeiculo.length,
        debitosPendentes: {
          valorTotal: valorTotalGeral,
          porVeiculo,
        },
      },
    };
  }
}
