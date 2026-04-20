import { Injectable, Logger } from '@nestjs/common';
import puppeteer from 'puppeteer';
import { ReciboTemplateRendererService } from './recibo-template-renderer.service';

export interface ReciboTemplateData {
  logoGrupoBortone: string;
  logoBrtn: string;
  tipoDocumento: string;
  nomeCliente: string;
  cpfCliente: string;
  emailCliente: string;
  celularCliente: string;
  placa: string;
  renavam: string;
  marca: string;
  modelo: string;
  anoFabricacao: string;
  anoModelo: string;
  nomeServico: string;
  dataInicio: string;
  dataPagamento: string;
  tipoPagamento: string;
  numeroParcelas: string;
  valorJuros: string;
  valorPago: string;
  dataAtual: string;
  horaAtual: string;
}

@Injectable()
export class ReciboPdfGeneratorService {
  private readonly logger = new Logger(ReciboPdfGeneratorService.name);

  async generate(data: ReciboTemplateData): Promise<Buffer> {
    const html = ReciboTemplateRendererService.render('recibo.ejs', data);
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    });

    try {
      const page = await browser.newPage();
      await page.emulateMediaType('print');
      await page.setContent(html, { waitUntil: 'load' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
      });

      await page.close();
      return Buffer.from(pdfBuffer);
    } catch (error) {
      this.logger.error('Erro ao gerar PDF do recibo', error);
      throw error;
    } finally {
      await browser.close().catch(() => {});
    }
  }
}
