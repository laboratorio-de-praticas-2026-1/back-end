import { Injectable, Logger } from '@nestjs/common';
import puppeteer, { Browser } from 'puppeteer';

import { ReportQueries } from './queries/reports.queries';
import { CreateReportDto } from './dto/create-report.dto';
import { RelatorioCategoria } from 'src/models/relatorio.model';

import {
  pageShell,
  fmtDate,
} from './templates/base.template';
import { coverPage, summaryPage } from './templates/cover.template';
import {
  financialSummarySection,
  debitosTableSection,
  parcelasVencer30Section,
  fluxoRecebimentoSection,
  detalheParcelas,
  arrecadacaoPorServico,
} from './templates/financeiro.template';
import {
  servicosPrestadosSection,
  solicitacoesPorServicoSection,
  solicitacoesResumoSection,
  todasSolicitacoesSection,
  documentosSection,
  documentosListSection,
  veiculosSection,
  clientesSection,
  tempoMedioSection,
  funilConversaoSection,
  gargalosSection,
} from './templates/operacional.template';
import {
  renderLineChart,
  renderPieChart,
} from './utils/chart-renderer';

const COMPANY_NAME = 'Despachante Bortone';

@Injectable()
export class PdfGeneratorService {
  private readonly logger = new Logger(PdfGeneratorService.name);

  constructor(private readonly queries: ReportQueries) {}

  async generate(dto: CreateReportDto): Promise<Buffer> {
    const inicio = dto.dataPeriodoInicio
      ? new Date(dto.dataPeriodoInicio)
      : (() => {
          const d = new Date();
          d.setDate(d.getDate() - 30);
          return d;
        })();

    const fim = dto.dataPeriodoFim ? new Date(dto.dataPeriodoFim) : new Date();
    inicio.setUTCHours(0, 0, 0, 0);
    fim.setUTCHours(23, 59, 59, 999);

    const periodoLabel = `Período: ${fmtDate(inicio)} — ${fmtDate(fim)}`;

    const categoria = dto.categoria;
    const isCompleto = categoria === RelatorioCategoria.RELATORIO_COMPLETO;

    // logoBase64 is no longer needed — logo is embedded via template-assets.ts
    const logoBase64 = '';

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
        logoBase64,
        new Date(),
        COMPANY_NAME,
      ),
    );

    const include = (cat: RelatorioCategoria) =>
      isCompleto || categoria === cat;

    if (
      isCompleto ||
      categoria === RelatorioCategoria.PERFORMANCE_FINANCEIRA
    ) {
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

      const lineChart = await renderLineChart(
        faturamentoDiluido.map((d) => d.semana),
        faturamentoDiluido.map((d) => d.valor),
        'Faturamento',
      );
      const pieMetodos = await renderPieChart(
        Object.keys(metodos),
        Object.values(metodos),
      );

      const finContent =
        financialSummarySection({
          ...summary,
          faturamentoComTaxa,
          faturamentoDiluido,
          metodosPagamento: metodos,
          lineChartBase64: lineChart,
          pieChartBase64: pieMetodos,
        }) +
        debitosTableSection(debitos) +
        parcelasVencer30Section(parcelas30) +
        fluxoRecebimentoSection(fluxo) +
        detalheParcelas(parcelas, vencidas) +
        arrecadacaoPorServico(ranking);

      htmlPages.push(
        pageShell('Indicadores Financeiros', periodoLabel, finContent, logoBase64, COMPANY_NAME),
      );
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

      const pieServicos = await renderPieChart(
        porServico.map((s) => s.nome),
        porServico.map((s) => s.total),
      );

      const srvContent =
        servicosPrestadosSection(servicos) +
        solicitacoesPorServicoSection(porServico, pieServicos);

      htmlPages.push(
        pageShell('Serviços', periodoLabel, srvContent, logoBase64, COMPANY_NAME),
      );
    }

    if (
      isCompleto ||
      categoria === RelatorioCategoria.DESEMPENHO_OPERACIONAL ||
      categoria === RelatorioCategoria.GESTAO_SOLICITACOES
    ) {
      summaryItems.push('Gestão de Solicitações');
      const { total, porStatus } =
        await this.queries.getSolicitacoesPorStatus(inicio, fim);
      const todas = await this.queries.getTodasSolicitacoes(inicio, fim);

      const pieSolicStatus = await renderPieChart(
        Object.keys(porStatus),
        Object.values(porStatus),
      );

      const solContent =
        solicitacoesResumoSection(total, porStatus, pieSolicStatus) +
        todasSolicitacoesSection(todas);

      htmlPages.push(
        pageShell('Solicitações', periodoLabel, solContent, logoBase64, COMPANY_NAME),
      );
    }

    if (
      isCompleto ||
      categoria === RelatorioCategoria.DESEMPENHO_OPERACIONAL ||
      categoria === RelatorioCategoria.GESTAO_DOCUMENTOS
    ) {
      summaryItems.push('Gestão de Documentos');
      const { total, porStatus } =
        await this.queries.getDocumentosPorStatus(inicio, fim);
      const pendentes = await this.queries.getDocumentosByStatus('pendente', inicio, fim);
      const aprovados = await this.queries.getDocumentosByStatus('aprovado', inicio, fim);
      const rejeitados = await this.queries.getDocumentosByStatus('rejeitado', inicio, fim);

      const pieDocStatus = await renderPieChart(
        ['Pendente', 'Aprovado', 'Rejeitado'],
        [porStatus['pendente'] ?? 0, porStatus['aprovado'] ?? 0, porStatus['rejeitado'] ?? 0],
      );

      const docContent =
        documentosSection(total, porStatus, pieDocStatus) +
        documentosListSection(pendentes, 'Documentos Pendentes') +
        documentosListSection(aprovados, 'Documentos Aprovados') +
        documentosListSection(rejeitados, 'Documentos Rejeitados');

      htmlPages.push(
        pageShell('Documentos', periodoLabel, docContent, logoBase64, COMPANY_NAME),
      );
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

      htmlPages.push(
        pageShell('Veículos', periodoLabel, veiculosSection(totalVeiculos, debVeiculos), logoBase64, COMPANY_NAME),
      );
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

      htmlPages.push(
        pageShell('Clientes', periodoLabel, clientesSection(clientes, total, taxaConversao, parcelasAtrasadas), logoBase64, COMPANY_NAME),
      );
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

      htmlPages.push(
        pageShell('Tempo Médio de Conclusão', periodoLabel, tempoMedioSection(tempoMedio, comparativo, casosVencimento), logoBase64, COMPANY_NAME),
      );
    }

    if (
      isCompleto ||
      categoria === RelatorioCategoria.DESEMPENHO_OPERACIONAL ||
      categoria === RelatorioCategoria.FUNIL_CONVERSAO
    ) {
      summaryItems.push('Funil de Conversão');
      const { totalConcluidas, porServico, naoConvertidas } =
        await this.queries.getFunilConversao(inicio, fim);

      const pieFunil = await renderPieChart(
        porServico.map((s) => s.nome),
        porServico.map((s) => s.concluidas),
      );

      htmlPages.push(
        pageShell('Taxa de Conversão', periodoLabel, funilConversaoSection(totalConcluidas, porServico, naoConvertidas, pieFunil), logoBase64, COMPANY_NAME),
      );
    }

    if (
      isCompleto ||
      categoria === RelatorioCategoria.DESEMPENHO_OPERACIONAL ||
      categoria === RelatorioCategoria.GARGALOS_OPERACIONAIS
    ) {
      summaryItems.push('Gargalos Operacionais');
      const gargalos = await this.queries.getGargalos(inicio, fim);

      const acumuloPie = await renderPieChart(
        Object.keys(gargalos.acumuloStatus),
        Object.values(gargalos.acumuloStatus),
      );

      htmlPages.push(
        pageShell('Gargalos Operacionais', periodoLabel, gargalosSection({ ...gargalos, acumuloPieBase64: acumuloPie }), logoBase64, COMPANY_NAME),
      );
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

    return this.renderHtmlsToPdf(numberedPages);
  }

  private async renderHtmlsToPdf(pages: string[]): Promise<Buffer> {
    let browser: Browser | null = null;

    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
      });

      const pdfBuffers: Buffer[] = [];

      for (const html of pages) {
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        await page.emulateMediaType('print');

        const pdfBuffer = await page.pdf({
          format: 'A4',
          printBackground: true,
          margin: { top: '0', right: '0', bottom: '0', left: '0' },
        });

        pdfBuffers.push(Buffer.from(pdfBuffer));
        await page.close();
      }

      await browser.close();

      const { PDFDocument } = await import('pdf-lib');
      const merged = await PDFDocument.create();

      for (const buf of pdfBuffers) {
        const doc = await PDFDocument.load(buf);
        const copiedPages = await merged.copyPages(doc, doc.getPageIndices());
        copiedPages.forEach((p) => merged.addPage(p));
      }

      const mergedBytes = await merged.save();
      return Buffer.from(mergedBytes);
    } catch (err) {
      this.logger.error('Erro ao renderizar PDF', err);
      throw err;
    } finally {
      if (browser) await browser.close().catch(() => {});
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
