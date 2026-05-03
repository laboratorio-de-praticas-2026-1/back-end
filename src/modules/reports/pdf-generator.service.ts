import { Injectable, Logger } from '@nestjs/common';
import puppeteer, { Browser } from 'puppeteer';

import { RelatorioCategoria } from 'src/models/relatorio.model';
import { Solicitacao } from 'src/models/solicitacao.model';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportQueries } from './queries/reports.queries';

import { pageShell } from './templates/base.template';
import { coverPage, summaryPage } from './templates/cover.template';
import {
  arrecadacaoPorServico,
  debitosTableSection,
  detalheParcelas,
  financialPartOneContent,
  fluxoRecebimentoSection,
  parcelasVencer30Section,
} from './templates/financeiro.template';
import {
  clientesTabelaSection,
  documentosListSection,
  documentosSection,
  funilConversaoTabelaSection,
  gargalosTabelaSection,
  servicosPrestadosTabelaSection,
  solicitacoesGraficoSection,
  solicitacoesPorServicoSection,
  solicitacoesResumoSection,
  tempoMedioTabelaSection,
  todasSolicitacoesSection,
  veiculosTabelaSection,
} from './templates/operacional.template';
import { renderLineChart, renderPieChart } from './utils/chart-renderer';
import { Formatters } from 'src/commons/utils/formatters';

const COMPANY_NAME = 'Despachante Bortone';

@Injectable()
export class PdfGeneratorService {
  private readonly logger = new Logger(PdfGeneratorService.name);
  private readonly rowsPerPageSafetyMargin = 8;

  constructor(
    private readonly queries: ReportQueries,
    private readonly formatters: Formatters,
  ) {}

  async generate(dto: CreateReportDto): Promise<Buffer> {
    const inicio = dto.dataPeriodoInicio!;
    const fim = dto.dataPeriodoFim!;

    const periodoLabel = `Período: ${this.formatters.fmtDate(inicio)} — ${this.formatters.fmtDate(fim)}`;

    const categoria = dto.categoria;
    const isCompleto = categoria === RelatorioCategoria.RELATORIO_COMPLETO;

    // logoBase64 is no longer needed — logo is embedded via template-assets.ts
    const logoBase64 = '';
    const generationStartedAt = Date.now();

    const htmlPages: string[] = [];
    const summaryItems: string[] = [];

    // Capa (page 0 — no number shown)
    htmlPages.push(
      coverPage(
        dto.nome,
        dto.descricao,
        this.categoriaLabel(categoria),
        inicio,
        fim,
        new Date(),
        COMPANY_NAME,
      ),
    );

    if (isCompleto || categoria === RelatorioCategoria.PERFORMANCE_FINANCEIRA) {
      summaryItems.push('Indicadores Financeiros');
      const [
        summary,
        faturamentoDiluido,
        debitos,
        metodos,
        parcelas30,
        fluxo,
        { parcelas, vencidas },
        ranking,
        faturamentoComTaxa,
      ] = await Promise.all([
        this.queries.getFinancialSummary(inicio, fim),
        this.queries.getFaturamentoDiluido(inicio, fim),
        this.queries.getTodosDebitos(inicio, fim),
        this.queries.getMetodosPagamento(inicio, fim),
        this.queries.getParcelasVencer30Dias(),
        this.queries.getFluxoRecebimento(inicio, fim),
        this.queries.getDetalhesParcelas(inicio, fim),
        this.queries.getArrecadacaoPorServico(inicio, fim),
        this.queries.getFaturamentoComTaxa(inicio, fim),
      ]);

      const lineChart = renderLineChart(
        faturamentoDiluido.map((d) => d.semana),
        faturamentoDiluido.map((d) => d.valor),
        'Faturamento',
      );
      const pieMetodos = renderPieChart(
        Object.keys(metodos),
        Object.values(metodos),
      );

      const finOverviewContent = financialPartOneContent({
        ...summary,
        faturamentoComTaxa,
        faturamentoDiluido,
        metodosPagamento: metodos,
        lineChartBase64: lineChart,
        pieChartBase64: pieMetodos,
      });

      htmlPages.push(
        pageShell(
          'Indicadores Financeiros I',
          periodoLabel,
          finOverviewContent,
          logoBase64,
          COMPANY_NAME,
        ),
      );

      const debitosChunks = this.chunkRows(debitos, 24);
      debitosChunks.forEach((chunk, idx) => {
        const parteLabel =
          debitosChunks.length > 1 ? ` (parte ${idx + 1})` : '';
        htmlPages.push(
          pageShell(
            `Indicadores Financeiros - Débitos${parteLabel}`,
            periodoLabel,
            debitosTableSection(chunk),
            logoBase64,
            COMPANY_NAME,
          ),
        );
      });

      const parcelas30Chunks = this.chunkRows(parcelas30, 22);
      parcelas30Chunks.forEach((chunk, idx) => {
        const parteLabel =
          parcelas30Chunks.length > 1 ? ` (parte ${idx + 1})` : '';
        htmlPages.push(
          pageShell(
            `Indicadores Financeiros - Parcelas 30 Dias${parteLabel}`,
            periodoLabel,
            parcelasVencer30Section(chunk),
            logoBase64,
            COMPANY_NAME,
          ),
        );
      });

      const fluxoChunks = this.chunkRows(fluxo, 20);
      fluxoChunks.forEach((chunk, idx) => {
        const parteLabel = fluxoChunks.length > 1 ? ` (parte ${idx + 1})` : '';
        htmlPages.push(
          pageShell(
            `Indicadores Financeiros - Fluxo${parteLabel}`,
            periodoLabel,
            fluxoRecebimentoSection(chunk),
            logoBase64,
            COMPANY_NAME,
          ),
        );
      });

      const {
        firstChunk: parcelasDetalhePrimeira,
        otherChunks: parcelasDetalheDemais,
      } = this.splitRowsWithFirstPageCapacity(parcelas, 18, 24);

      htmlPages.push(
        pageShell(
          `Indicadores Financeiros - Detalhamento de Parcelas${
            parcelasDetalheDemais.length ? ' (parte 1)' : ''
          }`,
          periodoLabel,
          detalheParcelas(parcelasDetalhePrimeira, vencidas, {
            showResumo: true,
          }),
          logoBase64,
          COMPANY_NAME,
        ),
      );

      parcelasDetalheDemais.forEach((chunk, idx) => {
        const parte = idx + 2;
        htmlPages.push(
          pageShell(
            `Indicadores Financeiros - Detalhamento de Parcelas (parte ${parte})`,
            periodoLabel,
            detalheParcelas(chunk, [], { showResumo: false }),
            logoBase64,
            COMPANY_NAME,
          ),
        );
      });

      const rankingChunks = this.chunkRows(ranking, 26);
      rankingChunks.forEach((chunk, idx) => {
        const parteLabel =
          rankingChunks.length > 1 ? ` (parte ${idx + 1})` : '';
        htmlPages.push(
          pageShell(
            `Indicadores Financeiros - Arrecadação por Serviço${parteLabel}`,
            periodoLabel,
            arrecadacaoPorServico(chunk),
            logoBase64,
            COMPANY_NAME,
          ),
        );
      });
    }

    if (
      isCompleto ||
      categoria === RelatorioCategoria.DESEMPENHO_OPERACIONAL ||
      categoria === RelatorioCategoria.PERFORMANCE_SERVICOS
    ) {
      summaryItems.push('Performance de Serviços');
      const [servicos, porServico] = await Promise.all([
        this.queries.getServicosPrestados(),
        this.queries.getSolicitacoesPorServico(inicio, fim),
      ]);

      const pieServicos = renderPieChart(
        porServico.map((s) => s.nome),
        porServico.map((s) => s.total),
        360,
        260,
        { includeZeroInLegend: true },
      );

      const srvSolicitacoesContent = solicitacoesPorServicoSection(
        porServico,
        pieServicos,
      );

      const shouldRenderServicesTogether =
        this.canRenderServicesTogetherOnSinglePage({
          totalServicos: servicos.length,
          totalLegendaItens: porServico.length,
          pieChartDataUrl: pieServicos,
        });

      if (shouldRenderServicesTogether) {
        htmlPages.push(
          pageShell(
            'Serviços',
            periodoLabel,
            servicosPrestadosTabelaSection(servicos) + srvSolicitacoesContent,
            logoBase64,
            COMPANY_NAME,
          ),
        );
      } else {
        const servicosChunks = this.chunkRows(servicos, 24);
        servicosChunks.forEach((chunk, idx) => {
          const parteLabel =
            servicosChunks.length > 1 ? ` (parte ${idx + 1})` : '';
          htmlPages.push(
            pageShell(
              `Serviços - Prestados${parteLabel}`,
              periodoLabel,
              servicosPrestadosTabelaSection(chunk, {
                titulo:
                  servicosChunks.length > 1
                    ? `Serviços Prestados (parte ${idx + 1})`
                    : 'Serviços Prestados',
              }),
              logoBase64,
              COMPANY_NAME,
            ),
          );
        });

        htmlPages.push(
          pageShell(
            'Serviços - Solicitações',
            periodoLabel,
            srvSolicitacoesContent,
            logoBase64,
            COMPANY_NAME,
          ),
        );
      }
    }

    if (
      isCompleto ||
      categoria === RelatorioCategoria.DESEMPENHO_OPERACIONAL ||
      categoria === RelatorioCategoria.GESTAO_SOLICITACOES
    ) {
      summaryItems.push('Gestão de Solicitações');
      const [{ total, porStatus }, todas] = await Promise.all([
        this.queries.getSolicitacoesPorStatus(inicio, fim),
        this.queries.getTodasSolicitacoes(inicio, fim),
      ]);

      const pieSolicStatus = renderPieChart(
        Object.keys(porStatus),
        Object.values(porStatus),
      );

      const solResumoContent = solicitacoesResumoSection(total, porStatus);
      const {
        firstChunk: solicitacoesPrimeiraPagina,
        otherChunks: solicitacoesDemaisPaginas,
      } = this.splitSolicitacoesRowsByPage(todas, pieSolicStatus);

      const solDetalhesContent =
        solicitacoesGraficoSection(pieSolicStatus) +
        todasSolicitacoesSection(solicitacoesPrimeiraPagina, {
          titulo: solicitacoesDemaisPaginas.length
            ? 'Todas as Solicitações do Período (parte 1)'
            : 'Todas as Solicitações do Período',
          startIndex: 0,
        });

      htmlPages.push(
        pageShell(
          'Solicitações - Resumo',
          periodoLabel,
          solResumoContent,
          logoBase64,
          COMPANY_NAME,
        ),
      );

      htmlPages.push(
        pageShell(
          'Solicitações - Gráfico e Tabela',
          periodoLabel,
          solDetalhesContent,
          logoBase64,
          COMPANY_NAME,
        ),
      );

      let startIndexSolicitacoes = solicitacoesPrimeiraPagina.length;
      solicitacoesDemaisPaginas.forEach((chunk, idx) => {
        const parte = idx + 2;
        htmlPages.push(
          pageShell(
            `Solicitações - Tabela (continuação ${parte})`,
            periodoLabel,
            todasSolicitacoesSection(chunk, {
              titulo: `Todas as Solicitações do Período (parte ${parte})`,
              startIndex: startIndexSolicitacoes,
            }),
            logoBase64,
            COMPANY_NAME,
          ),
        );

        startIndexSolicitacoes += chunk.length;
      });
    }

    if (
      isCompleto ||
      categoria === RelatorioCategoria.DESEMPENHO_OPERACIONAL ||
      categoria === RelatorioCategoria.GESTAO_DOCUMENTOS
    ) {
      summaryItems.push('Gestão de Documentos');
      const [{ total, porStatus }, pendentes, aprovados, rejeitados] =
        await Promise.all([
          this.queries.getDocumentosPorStatus(inicio, fim),
          this.queries.getDocumentosByStatus('pendente', inicio, fim),
          this.queries.getDocumentosByStatus('aprovado', inicio, fim),
          this.queries.getDocumentosByStatus('rejeitado', inicio, fim),
        ]);

      const pieDocStatus = renderPieChart(
        ['Pendente', 'Aprovado', 'Rejeitado'],
        [
          porStatus['pendente'] ?? 0,
          porStatus['aprovado'] ?? 0,
          porStatus['rejeitado'] ?? 0,
        ],
      );

      htmlPages.push(
        pageShell(
          'Documentos - Resumo',
          periodoLabel,
          documentosSection(total, porStatus, pieDocStatus),
          logoBase64,
          COMPANY_NAME,
        ),
      );

      const paginasPendentes = this.chunkRows(pendentes, 22);
      paginasPendentes.forEach((chunk, idx) => {
        const parteLabel =
          paginasPendentes.length > 1 ? ` (parte ${idx + 1})` : '';
        htmlPages.push(
          pageShell(
            `Documentos - Pendentes${parteLabel}`,
            periodoLabel,
            documentosListSection(
              chunk,
              paginasPendentes.length > 1
                ? `Documentos Pendentes (parte ${idx + 1})`
                : 'Documentos Pendentes',
            ),
            logoBase64,
            COMPANY_NAME,
          ),
        );
      });

      const paginasAprovados = this.chunkRows(aprovados, 22);
      paginasAprovados.forEach((chunk, idx) => {
        const parteLabel =
          paginasAprovados.length > 1 ? ` (parte ${idx + 1})` : '';
        htmlPages.push(
          pageShell(
            `Documentos - Aprovados${parteLabel}`,
            periodoLabel,
            documentosListSection(
              chunk,
              paginasAprovados.length > 1
                ? `Documentos Aprovados (parte ${idx + 1})`
                : 'Documentos Aprovados',
            ),
            logoBase64,
            COMPANY_NAME,
          ),
        );
      });

      const paginasRejeitados = this.chunkRows(rejeitados, 22);
      paginasRejeitados.forEach((chunk, idx) => {
        const parteLabel =
          paginasRejeitados.length > 1 ? ` (parte ${idx + 1})` : '';
        htmlPages.push(
          pageShell(
            `Documentos - Rejeitados${parteLabel}`,
            periodoLabel,
            documentosListSection(
              chunk,
              paginasRejeitados.length > 1
                ? `Documentos Rejeitados (parte ${idx + 1})`
                : 'Documentos Rejeitados',
            ),
            logoBase64,
            COMPANY_NAME,
          ),
        );
      });
    }

    if (
      isCompleto ||
      categoria === RelatorioCategoria.DESEMPENHO_OPERACIONAL ||
      categoria === RelatorioCategoria.GESTAO_VEICULOS
    ) {
      summaryItems.push('Gestão de Veículos');
      const [totalVeiculos, debVeiculos] = await Promise.all([
        this.queries.getTotalVeiculos(inicio, fim),
        this.queries.getVeiculosComDebitosPendentes(inicio, fim),
      ]);

      const pendentesVeiculos = debVeiculos.filter(
        (dv) => dv.debito && dv.debito.status === 'pendente',
      );
      const {
        firstChunk: veiculosPrimeiraPagina,
        otherChunks: veiculosDemaisPaginas,
      } = this.splitRowsWithFirstPageCapacity(pendentesVeiculos, 18, 24);

      htmlPages.push(
        pageShell(
          'Veículos',
          periodoLabel,
          veiculosTabelaSection(totalVeiculos, veiculosPrimeiraPagina, {
            showResumo: true,
            tableTitle: veiculosDemaisPaginas.length
              ? 'Veículos com Débitos Pendentes (parte 1)'
              : 'Veículos com Débitos Pendentes',
          }),
          logoBase64,
          COMPANY_NAME,
        ),
      );

      veiculosDemaisPaginas.forEach((chunk, idx) => {
        const parte = idx + 2;
        htmlPages.push(
          pageShell(
            `Veículos - Débitos Pendentes (continuação ${parte})`,
            periodoLabel,
            veiculosTabelaSection(totalVeiculos, chunk, {
              showResumo: false,
              tableTitle: `Veículos com Débitos Pendentes (parte ${parte})`,
            }),
            logoBase64,
            COMPANY_NAME,
          ),
        );
      });
    }

    if (
      isCompleto ||
      categoria === RelatorioCategoria.DESEMPENHO_OPERACIONAL ||
      categoria === RelatorioCategoria.BASE_CLIENTES
    ) {
      summaryItems.push('Base de Clientes');
      const [{ clientes, total, taxaConversao }, parcelasAtrasadas] =
        await Promise.all([
          this.queries.getClientesNoperiodo(inicio, fim),
          this.queries.getClientesComParcelasAtrasadas(),
        ]);

      const {
        firstChunk: clientesPrimeiraPagina,
        otherChunks: clientesDemaisPaginas,
      } = this.splitRowsWithFirstPageCapacity(clientes, 18, 24);

      htmlPages.push(
        pageShell(
          'Clientes',
          periodoLabel,
          clientesTabelaSection(
            clientesPrimeiraPagina,
            total,
            taxaConversao,
            [],
            {
              showResumo: true,
              showCadastrados: true,
              showAtrasadas: false,
              cadastradosTitle: clientesDemaisPaginas.length
                ? 'Cadastrados no Período (parte 1)'
                : 'Cadastrados no Período',
              novosNoPeriodo: clientes.length,
            },
          ),
          logoBase64,
          COMPANY_NAME,
        ),
      );

      clientesDemaisPaginas.forEach((chunk, idx) => {
        const parte = idx + 2;
        htmlPages.push(
          pageShell(
            `Clientes - Cadastrados (continuação ${parte})`,
            periodoLabel,
            clientesTabelaSection(chunk, total, taxaConversao, [], {
              showResumo: false,
              showCadastrados: true,
              showAtrasadas: false,
              cadastradosTitle: `Cadastrados no Período (parte ${parte})`,
              novosNoPeriodo: clientes.length,
            }),
            logoBase64,
            COMPANY_NAME,
          ),
        );
      });

      const parcelasAtrasadasPaginas = this.chunkRows(parcelasAtrasadas, 24);
      parcelasAtrasadasPaginas.forEach((chunk, idx) => {
        const parteLabel =
          parcelasAtrasadasPaginas.length > 1 ? ` (parte ${idx + 1})` : '';
        htmlPages.push(
          pageShell(
            `Clientes - Parcelas em Atraso${parteLabel}`,
            periodoLabel,
            clientesTabelaSection([], total, taxaConversao, chunk, {
              showResumo: false,
              showCadastrados: false,
              showAtrasadas: true,
              atrasadasTitle:
                parcelasAtrasadasPaginas.length > 1
                  ? `Clientes com Parcelas em Atraso (parte ${idx + 1})`
                  : 'Clientes com Parcelas em Atraso',
              novosNoPeriodo: clientes.length,
            }),
            logoBase64,
            COMPANY_NAME,
          ),
        );
      });
    }

    if (
      isCompleto ||
      categoria === RelatorioCategoria.DESEMPENHO_OPERACIONAL ||
      categoria === RelatorioCategoria.ANALISE_EFICIENCIA
    ) {
      summaryItems.push('Análise de Eficiência');
      const [{ tempoMedio, comparativo }, casosVencimento] = await Promise.all([
        this.queries.getTempoMedioConclusao(inicio, fim),
        this.queries.getCasosEmVencimento(inicio, fim),
      ]);

      const {
        firstChunk: comparativoPrimeiraPagina,
        otherChunks: comparativoDemaisPaginas,
      } = this.splitRowsWithFirstPageCapacity(comparativo, 18, 24);

      htmlPages.push(
        pageShell(
          'Tempo Médio de Conclusão',
          periodoLabel,
          tempoMedioTabelaSection(tempoMedio, comparativoPrimeiraPagina, [], {
            showResumo: true,
            showComparativo: true,
            showVencimento: false,
            comparativoTitle: comparativoDemaisPaginas.length
              ? 'Tempo Médio × Prazo Estimado (parte 1)'
              : 'Tempo Médio × Prazo Estimado',
          }),
          logoBase64,
          COMPANY_NAME,
        ),
      );

      comparativoDemaisPaginas.forEach((chunk, idx) => {
        const parte = idx + 2;
        htmlPages.push(
          pageShell(
            `Tempo Médio - Comparativo (continuação ${parte})`,
            periodoLabel,
            tempoMedioTabelaSection(tempoMedio, chunk, [], {
              showResumo: false,
              showComparativo: true,
              showVencimento: false,
              comparativoTitle: `Tempo Médio × Prazo Estimado (parte ${parte})`,
            }),
            logoBase64,
            COMPANY_NAME,
          ),
        );
      });

      const casosVencimentoPaginas = this.chunkRows(casosVencimento, 24);
      casosVencimentoPaginas.forEach((chunk, idx) => {
        const parteLabel =
          casosVencimentoPaginas.length > 1 ? ` (parte ${idx + 1})` : '';
        htmlPages.push(
          pageShell(
            `Tempo Médio - Casos em Vencimento${parteLabel}`,
            periodoLabel,
            tempoMedioTabelaSection(tempoMedio, [], chunk, {
              showResumo: false,
              showComparativo: false,
              showVencimento: true,
              vencimentoTitle:
                casosVencimentoPaginas.length > 1
                  ? `Casos em Vencimento (parte ${idx + 1})`
                  : 'Casos em Vencimento',
            }),
            logoBase64,
            COMPANY_NAME,
          ),
        );
      });
    }

    if (
      isCompleto ||
      categoria === RelatorioCategoria.DESEMPENHO_OPERACIONAL ||
      categoria === RelatorioCategoria.FUNIL_CONVERSAO
    ) {
      summaryItems.push('Funil de Conversão');
      const { totalConcluidas, porServico, naoConvertidas } =
        await this.queries.getFunilConversao(inicio, fim);

      const pieFunil = renderPieChart(
        porServico.map((s) => s.nome),
        porServico.map((s) => s.concluidas),
      );

      const {
        firstChunk: naoConvertidasPrimeiraPagina,
        otherChunks: naoConvertidasDemaisPaginas,
      } = this.splitRowsWithFirstPageCapacity(
        naoConvertidas,
        this.getRowsCapacityWithChartSection(pieFunil, 380, 54, 62, 22, 900),
        24,
      );

      htmlPages.push(
        pageShell(
          'Taxa de Conversão',
          periodoLabel,
          funilConversaoTabelaSection(
            totalConcluidas,
            porServico,
            naoConvertidasPrimeiraPagina,
            pieFunil,
            {
              showResumoGrafico: true,
              showTabela: true,
              tabelaTitle: naoConvertidasDemaisPaginas.length
                ? 'Solicitações Não Convertidas (parte 1)'
                : 'Solicitações Não Convertidas',
            },
          ),
          logoBase64,
          COMPANY_NAME,
        ),
      );

      naoConvertidasDemaisPaginas.forEach((chunk, idx) => {
        const parte = idx + 2;
        htmlPages.push(
          pageShell(
            `Taxa de Conversão - Não Convertidas (continuação ${parte})`,
            periodoLabel,
            funilConversaoTabelaSection(
              totalConcluidas,
              porServico,
              chunk,
              pieFunil,
              {
                showResumoGrafico: false,
                showTabela: true,
                tabelaTitle: `Solicitações Não Convertidas (parte ${parte})`,
              },
            ),
            logoBase64,
            COMPANY_NAME,
          ),
        );
      });
    }

    if (
      isCompleto ||
      categoria === RelatorioCategoria.DESEMPENHO_OPERACIONAL ||
      categoria === RelatorioCategoria.GARGALOS_OPERACIONAIS
    ) {
      summaryItems.push('Gargalos Operacionais');
      const gargalos = await this.queries.getGargalos(inicio, fim);

      const acumuloPie = renderPieChart(
        Object.keys(gargalos.acumuloStatus),
        Object.values(gargalos.acumuloStatus),
      );

      const paradasPaginas = this.chunkRows(gargalos.paradasComTempo, 22);
      paradasPaginas.forEach((chunk, idx) => {
        const parteLabel =
          paradasPaginas.length > 1 ? ` (parte ${idx + 1})` : '';
        htmlPages.push(
          pageShell(
            `Gargalos - Solicitações Paradas${parteLabel}`,
            periodoLabel,
            gargalosTabelaSection(
              {
                ...gargalos,
                paradasComTempo: chunk,
                tempoAcima: [],
                docsPendentes: [],
                clientesTravando: [],
                acumuloPieBase64: acumuloPie,
              },
              {
                showParadas: true,
                showTempoAcima: false,
                showAcumulo: false,
                showDocs: false,
                showClientes: false,
                paradasTitle:
                  paradasPaginas.length > 1
                    ? `Solicitações Paradas (parte ${idx + 1})`
                    : 'Solicitações Paradas',
              },
            ),
            logoBase64,
            COMPANY_NAME,
          ),
        );
      });

      const tempoAcimaPaginas = this.chunkRows(gargalos.tempoAcima, 24);
      tempoAcimaPaginas.forEach((chunk, idx) => {
        const parteLabel =
          tempoAcimaPaginas.length > 1 ? ` (parte ${idx + 1})` : '';
        htmlPages.push(
          pageShell(
            `Gargalos - Tempo Acima${parteLabel}`,
            periodoLabel,
            gargalosTabelaSection(
              {
                ...gargalos,
                paradasComTempo: [],
                tempoAcima: chunk,
                docsPendentes: [],
                clientesTravando: [],
                acumuloPieBase64: acumuloPie,
              },
              {
                showParadas: false,
                showTempoAcima: true,
                showAcumulo: false,
                showDocs: false,
                showClientes: false,
                tempoAcimaTitle:
                  tempoAcimaPaginas.length > 1
                    ? `Tempo Acima do Esperado por Serviço (parte ${idx + 1})`
                    : 'Tempo Acima do Esperado por Serviço',
              },
            ),
            logoBase64,
            COMPANY_NAME,
          ),
        );
      });

      htmlPages.push(
        pageShell(
          'Gargalos - Acúmulo por Status',
          periodoLabel,
          gargalosTabelaSection(
            {
              ...gargalos,
              paradasComTempo: [],
              tempoAcima: [],
              docsPendentes: [],
              clientesTravando: [],
              acumuloPieBase64: acumuloPie,
            },
            {
              showParadas: false,
              showTempoAcima: false,
              showAcumulo: true,
              showDocs: false,
              showClientes: false,
            },
          ),
          logoBase64,
          COMPANY_NAME,
        ),
      );

      const docsPendentesPaginas = this.chunkRows(gargalos.docsPendentes, 22);
      docsPendentesPaginas.forEach((chunk, idx) => {
        const parteLabel =
          docsPendentesPaginas.length > 1 ? ` (parte ${idx + 1})` : '';
        htmlPages.push(
          pageShell(
            `Gargalos - Documentos Pendentes${parteLabel}`,
            periodoLabel,
            gargalosTabelaSection(
              {
                ...gargalos,
                paradasComTempo: [],
                tempoAcima: [],
                docsPendentes: chunk,
                clientesTravando: [],
                acumuloPieBase64: acumuloPie,
              },
              {
                showParadas: false,
                showTempoAcima: false,
                showAcumulo: false,
                showDocs: true,
                showClientes: false,
                docsTitle:
                  docsPendentesPaginas.length > 1
                    ? `Documentos Pendentes (parte ${idx + 1})`
                    : 'Documentos Pendentes',
              },
            ),
            logoBase64,
            COMPANY_NAME,
          ),
        );
      });

      const clientesTravandoPaginas = this.chunkRows(
        gargalos.clientesTravando,
        22,
      );
      clientesTravandoPaginas.forEach((chunk, idx) => {
        const parteLabel =
          clientesTravandoPaginas.length > 1 ? ` (parte ${idx + 1})` : '';
        htmlPages.push(
          pageShell(
            `Gargalos - Clientes Travando${parteLabel}`,
            periodoLabel,
            gargalosTabelaSection(
              {
                ...gargalos,
                paradasComTempo: [],
                tempoAcima: [],
                docsPendentes: [],
                clientesTravando: chunk,
                acumuloPieBase64: acumuloPie,
              },
              {
                showParadas: false,
                showTempoAcima: false,
                showAcumulo: false,
                showDocs: false,
                showClientes: true,
                clientesTitle:
                  clientesTravandoPaginas.length > 1
                    ? `Clientes Travando o Fluxo (parte ${idx + 1})`
                    : 'Clientes Travando o Fluxo',
              },
            ),
            logoBase64,
            COMPANY_NAME,
          ),
        );
      });
    }

    // Insert summary as page 2 (index 1), then inject page numbers:
    // capa = no number; sumário = page 1; content pages = 2, 3, 4...
    htmlPages.splice(1, 0, summaryPage(summaryItems, logoBase64, COMPANY_NAME));

    // Inject page numbers into content pages (from index 2 onward)
    const numberedPages = htmlPages.map((html, idx) => {
      if (idx < 2) return html; // capa and sumário already handled
      const pageNum = idx; // sumário = 1, so first content page = 2
      return html.replace(
        /<span class="page-num"><\/span>/,
        `<span class="page-num">${pageNum}</span>`,
      );
    });

    const renderStartedAt = Date.now();
    const pdf = await this.renderHtmlsToPdf(numberedPages);
    const renderDuration = Date.now() - renderStartedAt;
    const totalDuration = Date.now() - generationStartedAt;

    this.logger.log(
      `Relatório gerado em ${totalDuration}ms (${numberedPages.length} páginas HTML, render em ${renderDuration}ms).`,
    );

    return pdf;
  }

  private async renderHtmlsToPdf(pages: string[]): Promise<Buffer> {
    let browser: Browser | null = null;

    try {
      const { PDFDocument } = await import('pdf-lib');
      const merged = await PDFDocument.create();

      browser = await puppeteer.launch({
        headless: true,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-gpu',
          '--disable-dev-shm-usage',
        ],
      });

      const page = await browser.newPage();
      await page.emulateMediaType('print');

      for (const html of pages) {
        await page.setContent(html, { waitUntil: 'load' });

        const isOverflowing = await page.evaluate(() => {
          const root = document.documentElement;
          const body = document.body;
          const contentHeight = Math.max(
            root?.scrollHeight ?? 0,
            root?.offsetHeight ?? 0,
            body?.scrollHeight ?? 0,
            body?.offsetHeight ?? 0,
          );

          // A4 em 96 DPI ~= 1123px de altura; pequena tolerância evita falso positivo.
          return contentHeight > 1130;
        });

        if (isOverflowing) {
          this.logger.warn(
            'Overflow detectado em uma página HTML de relatório. ' +
              'Mantendo apenas a primeira página para evitar gap em branco.',
          );
        }

        const pdfBuffer = await page.pdf({
          format: 'A4',
          printBackground: true,
          pageRanges: '1',
          margin: { top: '0', right: '0', bottom: '0', left: '0' },
        });

        const doc = await PDFDocument.load(pdfBuffer);

        const [firstPage] = await merged.copyPages(doc, [0]);
        merged.addPage(firstPage);
      }

      await page.close();

      await browser.close();

      const mergedBytes = await merged.save();
      return Buffer.from(mergedBytes);
    } catch (err) {
      this.logger.error('Erro ao renderizar PDF', err);
      throw err;
    } finally {
      if (browser) await browser.close().catch(() => {});
    }
  }

  private canRenderServicesTogetherOnSinglePage(params: {
    totalServicos: number;
    totalLegendaItens: number;
    pieChartDataUrl: string;
  }): boolean {
    const tableHeight = 74 + params.totalServicos * 23;

    // Fallback segue a mesma fórmula de altura dinâmica usada em renderPieChart.
    const svgFallbackHeight = Math.max(
      260,
      196 + params.totalLegendaItens * 20,
    );
    const imageFallbackHeight = (svgFallbackHeight * 400) / 360;
    const pieImageHeight = this.estimateSvgImageHeight(
      params.pieChartDataUrl,
      400,
      imageFallbackHeight,
    );

    // Label + margens do bloco + chart-wrap.
    const chartSectionHeight = 68 + pieImageHeight;
    const combinedHeight = tableHeight + chartSectionHeight;

    // Área útil aproximada para evitar quebrar no meio de header/footer fixos.
    const maxUsableHeight = 900;

    return combinedHeight <= maxUsableHeight;
  }

  private splitSolicitacoesRowsByPage(
    rows: Solicitacao[],
    pieChartDataUrl: string,
  ): { firstChunk: Solicitacao[]; otherChunks: Solicitacao[][] } {
    const firstPageCapacity = this.getSafeRowsCapacity(
      this.getSolicitacoesRowsCapacityWithChart(pieChartDataUrl),
    );
    const continuationCapacity = this.getSafeRowsCapacity(
      this.getSolicitacoesRowsCapacityTableOnly(),
    );

    const firstChunk = rows.slice(0, firstPageCapacity);
    const remaining = rows.slice(firstPageCapacity);
    const otherChunks: Solicitacao[][] = [];

    for (let i = 0; i < remaining.length; i += continuationCapacity) {
      otherChunks.push(remaining.slice(i, i + continuationCapacity));
    }

    return { firstChunk, otherChunks };
  }

  private chunkRows<T>(rows: T[], chunkSize: number): T[][] {
    if (!rows.length) {
      return [];
    }

    const safeChunkSize = this.getSafeRowsCapacity(chunkSize);
    const chunks: T[][] = [];

    for (let i = 0; i < rows.length; i += safeChunkSize) {
      chunks.push(rows.slice(i, i + safeChunkSize));
    }

    return chunks;
  }

  private splitRowsWithFirstPageCapacity<T>(
    rows: T[],
    firstPageCapacity: number,
    continuationCapacity: number,
  ): { firstChunk: T[]; otherChunks: T[][] } {
    const safeFirstPageCapacity = this.getSafeRowsCapacity(firstPageCapacity);
    const safeContinuationCapacity =
      this.getSafeRowsCapacity(continuationCapacity);

    const firstChunk = rows.slice(0, safeFirstPageCapacity);
    const remaining = rows.slice(safeFirstPageCapacity);
    const otherChunks = this.chunkRows(remaining, safeContinuationCapacity);

    return { firstChunk, otherChunks };
  }

  private getRowsCapacityWithChartSection(
    pieChartDataUrl: string,
    chartRenderWidth: number,
    chartSectionFixedHeight: number,
    tableFixedHeight: number,
    rowHeight: number,
    maxUsableHeight: number,
  ): number {
    const pieImageHeight = this.estimateSvgImageHeight(
      pieChartDataUrl,
      chartRenderWidth,
      260,
    );

    return Math.floor(
      (maxUsableHeight -
        (chartSectionFixedHeight + pieImageHeight) -
        tableFixedHeight) /
        rowHeight,
    );
  }

  private getSolicitacoesRowsCapacityWithChart(
    pieChartDataUrl: string,
  ): number {
    const pieImageHeight = this.estimateSvgImageHeight(
      pieChartDataUrl,
      380,
      260,
    );
    const chartSectionHeight = 54 + pieImageHeight;
    const tableFixedHeight = 62;
    const rowHeight = 22;
    const maxUsableHeight = 900;

    return Math.floor(
      (maxUsableHeight - chartSectionHeight - tableFixedHeight) / rowHeight,
    );
  }

  private getSolicitacoesRowsCapacityTableOnly(): number {
    const tableFixedHeight = 62;
    const rowHeight = 22;
    const maxUsableHeight = 920;

    return Math.floor((maxUsableHeight - tableFixedHeight) / rowHeight);
  }

  private getSafeRowsCapacity(rawCapacity: number): number {
    return Math.max(1, rawCapacity - this.rowsPerPageSafetyMargin);
  }

  private estimateSvgImageHeight(
    dataUrl: string,
    renderWidth: number,
    fallbackHeight: number,
  ): number {
    const dims = this.extractSvgDimensionsFromDataUrl(dataUrl);
    if (!dims || dims.width <= 0 || dims.height <= 0) {
      return fallbackHeight;
    }

    return (renderWidth * dims.height) / dims.width;
  }

  private extractSvgDimensionsFromDataUrl(
    dataUrl: string,
  ): { width: number; height: number } | null {
    if (!dataUrl.startsWith('data:image/svg+xml;base64,')) {
      return null;
    }

    const encoded = dataUrl.split(',')[1];
    if (!encoded) {
      return null;
    }

    try {
      const svg = Buffer.from(encoded, 'base64').toString('utf8');
      const widthMatch = svg.match(/\bwidth="([\d.]+)"/i);
      const heightMatch = svg.match(/\bheight="([\d.]+)"/i);
      if (!widthMatch || !heightMatch) {
        return null;
      }

      const width = Number(widthMatch[1]);
      const height = Number(heightMatch[1]);
      if (!Number.isFinite(width) || !Number.isFinite(height)) {
        return null;
      }

      return { width, height };
    } catch {
      return null;
    }
  }

  private categoriaLabel(cat: RelatorioCategoria): string {
    const map: Record<RelatorioCategoria, string> = {
      relatorio_completo: 'Relatório Completo',
      performance_financeira: 'Performance Financeira',
      desempenho_operacional: 'Desempenho Operacional',
      performance_servicos: 'Performance de Serviços',
      gestao_solicitacoes: 'Gestão de Solicitações',
      gestao_documentos: 'Gestão de Documentos',
      gestao_veiculos: 'Gestão de Veículos',
      base_clientes: 'Base de Clientes',
      analise_eficiencia: 'Análise de Eficiência',
      funil_conversao: 'Funil de Conversão',
      gargalos_operacionais: 'Gargalos Operacionais',
    };
    return map[cat] ?? cat;
  }
}
