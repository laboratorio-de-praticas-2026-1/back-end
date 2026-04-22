import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as ejs from 'ejs';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import puppeteer, { Browser } from 'puppeteer';
import { Readable } from 'stream';
import { CryptoUtil } from 'src/commons/utils/crypto';
import { CloudinaryService } from 'src/infra/cloudinary/cloudinary.service';
import { DebitoServico } from 'src/models/debito-servico.model';
import { DebitoVeiculo } from 'src/models/debito-veiculo.model';
import { Debito } from 'src/models/debito.model';
import { Pagamento } from 'src/models/pagamento.model';
import { Servico } from 'src/models/servico.model';
import { Solicitacao } from 'src/models/solicitacao.model';
import { Usuario } from 'src/models/usuario.model';
import { Veiculo } from 'src/models/veiculo.model';

import { CreateReciboDto } from './dto/create-recibo.dto';
import { ResponseReciboDto } from './dto/responde-recibo.dt';

type ReciboTemplateContext = {
  logoGrupoSrc: string;
  logoBrtnSrc: string;
  tipoDocumento: string;
  nomeCliente: string;
  cpfCliente: string;
  emailCliente: string;
  celularCliente: string;
  placa: string;
  renavam: string;
  marca: string;
  modelo: string;
  anoFab: string;
  anoMod: string;
  nomeServico: string;
  dataInicio: string;
  dataPagamento: string;
  tipoPagamento: string;
  numeroParcelas: string;
  valorTaxas: string;
  valorPago: string;
  dataAtual: string;
  horaAtual: string;
  temDebito: boolean;
};

type CompiledReciboTemplate = (context: ReciboTemplateContext) => string;

@Injectable()
export class ReciboService {
  private readonly logger: Logger = new Logger(ReciboService.name);

  constructor(
    @InjectModel(Servico)
    private readonly servicoModel: typeof Servico,
    @InjectModel(Solicitacao)
    private readonly solicitacaoModel: typeof Solicitacao,
    @InjectModel(Veiculo)
    private readonly veiculoModel: typeof Veiculo,
    @InjectModel(Usuario)
    private readonly usuarioModel: typeof Usuario,
    @InjectModel(Pagamento)
    private readonly pagamentoModel: typeof Pagamento,
    @InjectModel(Debito)
    private readonly debitoModel: typeof Debito,
    @InjectModel(DebitoVeiculo)
    private readonly debitoVeiculoModel: typeof DebitoVeiculo,
    @InjectModel(DebitoServico)
    private readonly debitoServicoModel: typeof DebitoServico,
    private readonly cloudinaryService: CloudinaryService,
    private readonly cryptoUtil: CryptoUtil,
  ) {}

  async create(createReciboDto: CreateReciboDto): Promise<ResponseReciboDto> {
    const html = await this.buildReciboHtml(createReciboDto);
    const pdfBuffer = await this.renderHtmlToPdf(html);

    const multerFile = {
      fieldname: 'recibo',
      originalname: `recibo_solicitacao_${createReciboDto.idSolicitacao}.pdf`,
      encoding: '7bit',
      mimetype: 'application/pdf',
      buffer: pdfBuffer,
      size: pdfBuffer.length,
      stream: Readable.from([]),
      destination: '',
      filename: '',
      path: '',
    };

    const uploadResult =
      await this.cloudinaryService.uploadDocument(multerFile);
    const publicId = uploadResult.public_id as string;
    const resourceType = uploadResult.resource_type as 'raw' | 'image';

    const encryptedUrl = this.cryptoUtil.encrypt(`${resourceType}|${publicId}`);
    const urlDownload = this.cloudinaryService.generateTemporaryUrl(
      this.cryptoUtil.decrypt(encryptedUrl),
    );

    return { urlDownload };
  }

  async previewDownload(createReciboDto: CreateReciboDto): Promise<Buffer> {
    const html = await this.buildReciboHtml(createReciboDto);
    return this.renderHtmlToPdf(html);
  }

  private async buildReciboHtml(
    createReciboDto: CreateReciboDto,
  ): Promise<string> {
    this.logger.debug(
      `Criando recibo para solicitação ID: ${createReciboDto.idSolicitacao}`,
    );

    const data = await this.getDataFromSolicitacaoId(
      createReciboDto.idSolicitacao,
    );
    const temDebito = !!data.debito;

    return this.renderReciboTemplate({
      logoGrupoSrc: this.getReciboAssetSrc('logo-grupo-bortone.svg'),
      logoBrtnSrc: this.getReciboAssetSrc('Logo escura.svg'),
      tipoDocumento: 'Recibo de Pagamento',
      nomeCliente: data.usuario?.nome ?? '',
      cpfCliente: data.usuario?.cpfCnpj ?? '',
      emailCliente: data.usuario?.email ?? '',
      celularCliente: data.usuario?.celular ?? '',
      placa: data.veiculo?.placa ?? '',
      renavam: data.veiculo?.renavam ?? '',
      marca: data.veiculo?.marca ?? '',
      modelo: data.veiculo?.modelo ?? '',
      anoFab: String(data.veiculo?.anoFabricacao ?? ''),
      anoMod: String(data.veiculo?.anoModelo ?? ''),
      nomeServico: data.servico?.nome ?? '',
      dataInicio: data.debito?.createdAt
        ? new Date(data.debito.createdAt).toLocaleDateString('pt-BR')
        : '',
      dataPagamento: data.dataConclusao
        ? new Date(data.dataConclusao).toLocaleDateString('pt-BR')
        : '',
      tipoPagamento:
        data.debito?.pagamento?.tipoPagamento === 'avista'
          ? 'À Vista'
          : data.debito?.pagamento?.tipoPagamento === 'parcelado'
            ? 'Parcelado'
            : 'Método Não Informado',
      numeroParcelas: data.debito?.pagamento?.qtdParcelas
        ? String(data.debito.pagamento.qtdParcelas)
        : '',
      valorTaxas: data.debito?.pagamento?.taxa
        ? data.debito.pagamento.taxa
        : '',
      valorPago: data.debito?.valor ? data.debito.valor : '',
      dataAtual: new Date().toLocaleDateString('pt-BR'),
      horaAtual: new Date().toLocaleTimeString('pt-BR'),
      temDebito,
    });
  }

  private async renderHtmlToPdf(html: string): Promise<Buffer> {
    let browser: Browser | null = null;

    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
      });

      const page = await browser.newPage();
      await page.emulateMediaType('print');
      await page.setContent(html, { waitUntil: 'load' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
      });

      await page.close();
      await browser.close();

      return Buffer.from(pdfBuffer);
    } catch (error) {
      this.logger.error(
        'Erro ao renderizar PDF do recibo',
        error instanceof Error ? (error.stack ?? error.message) : String(error),
      );
      throw new InternalServerErrorException(
        'Erro ao gerar PDF do recibo. Tente novamente.',
      );
    } finally {
      if (browser) {
        await browser.close().catch(() => {});
      }
    }
  }

  private getReciboAssetSrc(fileName: string): string {
    const assetPath = this.resolveExistingPath([
      join(__dirname, 'assets', fileName),
      join(process.cwd(), 'src', 'modules', 'recibo', 'assets', fileName),
    ]);

    // Convert SVG to base64 data URL for Puppeteer compatibility
    const fileContent = readFileSync(assetPath, 'utf-8');
    const base64Content = Buffer.from(fileContent).toString('base64');
    return `data:image/svg+xml;base64,${base64Content}`;
  }

  private getReciboTemplatePath(): string {
    return this.resolveExistingPath([
      join(__dirname, 'template', 'recibo.ejs'),
      join(process.cwd(), 'src', 'modules', 'recibo', 'template', 'recibo.ejs'),
    ]);
  }

  private resolveExistingPath(paths: string[]): string {
    for (const path of paths) {
      if (existsSync(path)) {
        return path;
      }
    }

    throw new InternalServerErrorException(
      `Arquivo não encontrado. Caminhos verificados: ${paths.join(' | ')}`,
    );
  }

  private getReciboTemplateContent(): string {
    const templatePath = this.getReciboTemplatePath();

    return readFileSync(templatePath, 'utf8');
  }

  private renderReciboTemplate(context: ReciboTemplateContext): string {
    const templatePath = this.getReciboTemplatePath();
    const templateContent = this.getReciboTemplateContent();
    const compiled = ejs.compile(templateContent, {
      cache: true,
      filename: templatePath,
    });

    return compiled(context);
  }

  private async getDataFromSolicitacaoId(idSolicitacao: number): Promise<{
    usuario?: Usuario;
    veiculo?: Veiculo;
    servico?: Servico;
    debito?: Debito;
    dataConclusao?: Date;
  }> {
    const data = await this.solicitacaoModel.findByPk(idSolicitacao, {
      include: [
        { model: Usuario },
        { model: Veiculo },
        { model: Servico },
        {
          model: Debito,
          include: [Pagamento, DebitoServico, DebitoVeiculo],
        },
      ],
    });

    if (!data) {
      this.logger.warn(
        `Solicitação com ID ${idSolicitacao} não encontrada para geração do recibo`,
      );
      throw new InternalServerErrorException(
        'Erro ao gerar recibo. Solicitação não encontrada.',
      );
    }

    return {
      usuario: data.usuario,
      veiculo: data.veiculo ?? undefined,
      servico: data.servico,
      debito:
        data.debitos && data.debitos.length > 0 ? data.debitos[0] : undefined,
      dataConclusao: data.dataConclusao ?? undefined,
    };
  }
}
