import { PrismaClient } from '@prisma/client';

export class ReportQueries {
  constructor(private readonly prisma: PrismaClient) {}
  async getFinancialSummary(inicio: Date, fim: Date) {
    const debitos = await this.prisma.debito.findMany({
      where: { createdAt: { gte: inicio, lte: fim } },
      include: { pagamento: true },
    });

    const totalArrecadado = debitos
      .filter((d) => d.status === 'pago')
      .reduce((acc, d) => acc + Number(d.valor), 0);

    const totalTaxas = debitos
      .filter((d) => d.status === 'pago')
      .reduce((acc, d) => acc + Number(d.pagamento?.taxa ?? 0), 0);

    const totalPendente = debitos
      .filter((d) => d.status === 'pendente')
      .reduce((acc, d) => acc + Number(d.valor), 0);

    return { totalArrecadado, totalTaxas, totalPendente };
  }

  async getFaturamentoDiluido(inicio: Date, fim: Date) {
    const pagamentos = await this.prisma.pagamento.findMany({
      where: { createdAt: { gte: inicio, lte: fim } },
      include: { debito: true },
      orderBy: { createdAt: 'asc' },
    });

    // Group by ISO week
    const weekMap: Record<string, number> = {};
    for (const p of pagamentos) {
      const date = new Date(p.createdAt);
      const startOfYear = new Date(date.getFullYear(), 0, 1);
      const week = Math.ceil(
        ((date.getTime() - startOfYear.getTime()) / 86400000 +
          startOfYear.getDay() +
          1) /
          7,
      );
      const key = `Sem ${week}`;
      weekMap[key] = (weekMap[key] ?? 0) + Number(p.valorTotal);
    }

    return Object.entries(weekMap).map(([semana, valor]) => ({
      semana,
      valor,
    }));
  }

  async getTodosDebitos(inicio: Date, fim: Date) {
    return this.prisma.debito.findMany({
      where: { createdAt: { gte: inicio, lte: fim } },
      include: {
        debitoServico: { include: { servico: true } },
        debitoVeiculo: { include: { veiculo: true } },
        pagamento: true,
      },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async getParcelasVencer30Dias() {
    const hoje = new Date();
    const em30 = new Date();
    em30.setDate(em30.getDate() + 30);

    return this.prisma.parcela.findMany({
      where: {
        status: { not: 'pago' },
        vencimento: { gte: hoje, lte: em30 },
      },
      include: { pagamento: { include: { debito: true } } },
      orderBy: { vencimento: 'asc' },
    });
  }

  async getFluxoRecebimento(inicio: Date, fim: Date) {
    return this.prisma.pagamento.findMany({
      where: { createdAt: { gte: inicio, lte: fim } },
      include: { debito: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getMetodosPagamento(inicio: Date, fim: Date) {
    const pagamentos = await this.prisma.pagamento.findMany({
      where: { createdAt: { gte: inicio, lte: fim } },
    });

    const map: Record<string, number> = {};
    for (const p of pagamentos) {
      const m = p.metodoPagamento.toLowerCase();
      map[m] = (map[m] ?? 0) + 1;
    }
    return map;
  }

  async getDetalhesParcelas(inicio: Date, fim: Date) {
    const hoje = new Date();
    const parcelas = await this.prisma.parcela.findMany({
      where: {
        pagamento: { createdAt: { gte: inicio, lte: fim } },
      },
      include: { pagamento: { include: { debito: true } } },
      orderBy: { vencimento: 'asc' },
    });

    const vencidas = parcelas.filter(
      (p) => p.vencimento < hoje && p.status !== 'pago',
    );

    return { parcelas, vencidas };
  }

  async getArrecadacaoPorServico(inicio: Date, fim: Date) {
    const debitosServico = await this.prisma.debitoServico.findMany({
      include: {
        debito: {
          where: { status: 'pago', createdAt: { gte: inicio, lte: fim } },
        },
        servico: true,
      },
    });

    const map: Record<string, { nome: string; total: number }> = {};
    for (const ds of debitosServico) {
      if (!ds.debito) continue;
      const nome = ds.servico.nome;
      if (!map[nome]) map[nome] = { nome, total: 0 };
      map[nome].total += Number(ds.debito.valor);
    }

    return Object.values(map)
      .sort((a, b) => b.total - a.total)
      .map((item, i) => ({ top: i + 1, ...item }));
  }

  async getFaturamentoComTaxa(inicio: Date, fim: Date) {
    const pagamentos = await this.prisma.pagamento.findMany({
      where: { createdAt: { gte: inicio, lte: fim } },
    });
    return pagamentos.reduce(
      (acc, p) => acc + Number(p.valorTotal) + Number(p.taxa),
      0,
    );
  }

  async getServicosPrestados() {
    return this.prisma.servico.findMany({
      orderBy: { id: 'asc' },
    });
  }

  async getSolicitacoesPorServico(inicio: Date, fim: Date) {
    const solicitacoes = await this.prisma.solicitacao.findMany({
      where: { dataSolicitacao: { gte: inicio, lte: fim } },
      include: { servico: true },
    });

    const map: Record<string, { nome: string; total: number }> = {};
    for (const s of solicitacoes) {
      const nome = s.servico.nome;
      if (!map[nome]) map[nome] = { nome, total: 0 };
      map[nome].total++;
    }
    return Object.values(map).sort((a, b) => b.total - a.total);
  }

  async getSolicitacoesPorStatus(inicio: Date, fim: Date) {
    const solicitacoes = await this.prisma.solicitacao.findMany({
      where: { dataSolicitacao: { gte: inicio, lte: fim } },
    });

    const map: Record<string, number> = {};
    for (const s of solicitacoes) {
      map[s.status] = (map[s.status] ?? 0) + 1;
    }
    return { total: solicitacoes.length, porStatus: map };
  }

  async getTodasSolicitacoes(inicio: Date, fim: Date) {
    return this.prisma.solicitacao.findMany({
      where: { dataSolicitacao: { gte: inicio, lte: fim } },
      include: { servico: true, usuario: true, veiculo: true },
      orderBy: { dataSolicitacao: 'desc' },
    });
  }

  async getDocumentosPorStatus(inicio: Date, fim: Date) {
    const docs = await this.prisma.documentoSolicitacao.findMany({
      where: { dataUpload: { gte: inicio, lte: fim } },
    });

    const map: Record<string, number> = { pendente: 0, aprovado: 0, rejeitado: 0 };
    for (const d of docs) {
      map[d.statusValidacao] = (map[d.statusValidacao] ?? 0) + 1;
    }
    return { total: docs.length, porStatus: map };
  }

  async getDocumentosByStatus(status: string, inicio: Date, fim: Date) {
    return this.prisma.documentoSolicitacao.findMany({
      where: {
        statusValidacao: status as any,
        dataUpload: { gte: inicio, lte: fim },
      },
      include: { solicitacao: { include: { usuario: true, servico: true } } },
      orderBy: { dataUpload: 'asc' },
    });
  }

  async getVeiculosComDebitosPendentes(inicio: Date, fim: Date) {
    return this.prisma.debitoVeiculo.findMany({
      include: {
        debito: {
          where: { status: 'pendente', createdAt: { gte: inicio, lte: fim } },
          include: { pagamento: true },
        },
        veiculo: { include: { usuario: true } },
      },
    });
  }

  async getTotalVeiculos(inicio: Date, fim: Date) {
    return this.prisma.veiculo.count({
      where: {
        solicitacoes: {
          some: { dataSolicitacao: { gte: inicio, lte: fim } },
        },
      },
    });
  }

  async getClientesNoperiodo(inicio: Date, fim: Date) {
    const clientes = await this.prisma.usuario.findMany({
      where: {
        nivel: 'cliente',
        dataCadastro: { gte: inicio, lte: fim },
      },
      include: {
        veiculos: true,
        solicitacoes: { where: { dataSolicitacao: { gte: inicio, lte: fim } } },
      },
      orderBy: { dataCadastro: 'desc' },
    });

    const total = await this.prisma.usuario.count({ where: { nivel: 'cliente' } });
    const comSolicitacao = clientes.filter((c) => c.solicitacoes.length > 0).length;
    const taxaConversao =
      clientes.length > 0
        ? Math.round((comSolicitacao / clientes.length) * 100)
        : 0;

    return { clientes, total, taxaConversao };
  }

  async getClientesComParcelasAtrasadas() {
    const hoje = new Date();
    const parcelas = await this.prisma.parcela.findMany({
      where: { status: { not: 'pago' }, vencimento: { lt: hoje } },
      include: {
        pagamento: {
          include: {
            debito: {
              include: {
                debitoServico: {
                  include: {
                    servico: {
                      include: {
                        solicitacoes: { include: { usuario: true } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { vencimento: 'asc' },
    });

    return parcelas;
  }

  async getTempoMedioConclusao(inicio: Date, fim: Date) {
    const concluidas = await this.prisma.solicitacao.findMany({
      where: {
        status: 'concluido',
        dataSolicitacao: { gte: inicio, lte: fim },
        dataConclusao: { not: null },
      },
      include: { servico: true },
    });

    const tempoTotal = concluidas.reduce((acc, s) => {
      const diff =
        (new Date(s.dataConclusao!).getTime() -
          new Date(s.dataSolicitacao).getTime()) /
        86400000;
      return acc + diff;
    }, 0);

    const tempoMedio =
      concluidas.length > 0
        ? Math.round(tempoTotal / concluidas.length)
        : 0;

    const comparativo = concluidas.map((s) => {
      const utilizado = Math.round(
        (new Date(s.dataConclusao!).getTime() -
          new Date(s.dataSolicitacao).getTime()) /
          86400000,
      );
      const estimado = s.servico.prazoEstimadoDias ?? 0;
      return {
        id: s.id,
        servico: s.servico.nome,
        tempoUtilizado: utilizado,
        prazoEstimado: estimado,
        dentroPrazo: utilizado <= estimado,
      };
    });

    return { tempoMedio, comparativo };
  }

  async getCasosEmVencimento(inicio: Date, fim: Date) {
    const pendentes = await this.prisma.solicitacao.findMany({
      where: {
        status: {
          notIn: ['concluido', 'cancelado'],
        },
        dataSolicitacao: { gte: inicio, lte: fim },
      },
      include: { servico: true, usuario: true },
      orderBy: { dataSolicitacao: 'asc' },
    });

    return pendentes.map((s) => {
      const inicio = new Date(s.dataSolicitacao);
      const estimado = s.servico.prazoEstimadoDias ?? 0;
      const dataVenc = new Date(inicio);
      dataVenc.setDate(dataVenc.getDate() + estimado);
      return {
        idUsuario: s.usuarioId,
        usuario: s.usuario.nome,
        servico: s.servico.nome,
        dataInicio: s.dataSolicitacao,
        tempoEstimado: estimado,
        dataVencimento: dataVenc,
      };
    });
  }

  async getFunilConversao(inicio: Date, fim: Date) {
    const solicitacoes = await this.prisma.solicitacao.findMany({
      where: { dataSolicitacao: { gte: inicio, lte: fim } },
      include: { servico: true },
    });

    const porServico: Record<
      string,
      { nome: string; total: number; concluidas: number }
    > = {};
    for (const s of solicitacoes) {
      const nome = s.servico.nome;
      if (!porServico[nome])
        porServico[nome] = { nome, total: 0, concluidas: 0 };
      porServico[nome].total++;
      if (s.status === 'concluido') porServico[nome].concluidas++;
    }

    const concluidas = solicitacoes.filter((s) => s.status === 'concluido').length;
    const naoConvertidas = await this.prisma.solicitacao.findMany({
      where: {
        dataSolicitacao: { gte: inicio, lte: fim },
        status: { notIn: ['concluido'] },
      },
      include: { servico: true, usuario: true },
      orderBy: { dataSolicitacao: 'asc' },
    });

    return {
      totalConcluidas: concluidas,
      porServico: Object.values(porServico).map((s) => ({
        ...s,
        taxaConversao:
          s.total > 0 ? Math.round((s.concluidas / s.total) * 100) : 0,
      })),
      naoConvertidas,
    };
  }

  async getGargalos(inicio: Date, fim: Date) {
    const hoje = new Date();

    // Solicitações paradas (sem atualização, mais antigas e ainda abertas)
    const paradas = await this.prisma.solicitacao.findMany({
      where: {
        status: { notIn: ['concluido', 'cancelado'] },
        dataSolicitacao: { gte: inicio, lte: fim },
      },
      include: { servico: true },
      orderBy: { dataSolicitacao: 'asc' },
    });

    const paradasComTempo = paradas.map((s) => {
      const diasDecorridos = Math.round(
        (hoje.getTime() - new Date(s.dataSolicitacao).getTime()) / 86400000,
      );
      return {
        id: s.id,
        servico: s.servico.nome,
        status: s.status,
        diasDecorridos,
        prazoEstimado: s.servico.prazoEstimadoDias ?? 0,
      };
    });

    const concluidas = await this.prisma.solicitacao.findMany({
      where: {
        status: 'concluido',
        dataSolicitacao: { gte: inicio, lte: fim },
        dataConclusao: { not: null },
      },
      include: { servico: true },
    });

    const tempoAcimaMap: Record<
      string,
      { nome: string; totalDias: number; count: number; prazo: number }
    > = {};
    for (const s of concluidas) {
      const utilizado = Math.round(
        (new Date(s.dataConclusao!).getTime() -
          new Date(s.dataSolicitacao).getTime()) /
          86400000,
      );
      const prazo = s.servico.prazoEstimadoDias ?? 0;
      if (utilizado > prazo) {
        const nome = s.servico.nome;
        if (!tempoAcimaMap[nome])
          tempoAcimaMap[nome] = { nome, totalDias: 0, count: 0, prazo };
        tempoAcimaMap[nome].totalDias += utilizado;
        tempoAcimaMap[nome].count++;
      }
    }

    const tempoAcima = Object.values(tempoAcimaMap).map((t) => ({
      servico: t.nome,
      tempoMedio: Math.round(t.totalDias / t.count),
      prazoEstimado: t.prazo,
    }));

    const acumuloStatus: Record<string, number> = {};
    for (const s of paradas) {
      acumuloStatus[s.status] = (acumuloStatus[s.status] ?? 0) + 1;
    }

    const docsPendentes = await this.prisma.documentoSolicitacao.findMany({
      where: {
        statusValidacao: 'pendente',
        dataUpload: { gte: inicio, lte: fim },
      },
      include: { solicitacao: { include: { usuario: true, servico: true } } },
      orderBy: { dataUpload: 'asc' },
    });

    // Clientes travando fluxo (com solicitações aguardando_documento)
    const clientesTravando = await this.prisma.solicitacao.findMany({
      where: {
        status: 'aguardando_documento',
        dataSolicitacao: { gte: inicio, lte: fim },
      },
      include: { usuario: true, servico: true },
      orderBy: { dataSolicitacao: 'asc' },
    });

    return {
      paradasComTempo,
      tempoAcima,
      acumuloStatus,
      docsPendentes,
      clientesTravando,
    };
  }
}
