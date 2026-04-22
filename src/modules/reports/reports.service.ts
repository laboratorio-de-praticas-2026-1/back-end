import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Readable } from 'stream';
import { InjectModel } from '@nestjs/sequelize';
import { plainToInstance } from 'class-transformer';
import { CryptoUtil } from 'src/commons/utils/crypto';
import { CloudinaryService } from 'src/infra/cloudinary/cloudinary.service';
import { Relatorio, RelatorioCategoria } from 'src/models/relatorio.model';
import { RelatorioCategoriaResponseDto } from './dto/categoria-response.dto';
import { CreateReportDto } from './dto/create-report.dto';
import { ResponseReportDto } from './dto/response-report.dto';
import { PdfGeneratorService } from './pdf-generator.service';

function getCategoriaLabel(categoria: RelatorioCategoria): string {
  const labels: Record<RelatorioCategoria, string> = {
    [RelatorioCategoria.RELATORIO_COMPLETO]: 'Relatório Completo',
    [RelatorioCategoria.PERFORMANCE_FINANCEIRA]: 'Performance Financeira',
    [RelatorioCategoria.DESEMPENHO_OPERACIONAL]: 'Desempenho Operacional',
    [RelatorioCategoria.PERFORMANCE_SERVICOS]: 'Performance de Serviços',
    [RelatorioCategoria.GESTAO_SOLICITACOES]: 'Gestão de Solicitações',
    [RelatorioCategoria.GESTAO_DOCUMENTOS]: 'Gestão de Documentos',
    [RelatorioCategoria.GESTAO_VEICULOS]: 'Gestão de Veículos',
    [RelatorioCategoria.BASE_CLIENTES]: 'Base de Clientes',
    [RelatorioCategoria.ANALISE_EFICIENCIA]: 'Análise de Eficiência',
    [RelatorioCategoria.FUNIL_CONVERSAO]: 'Funil de Conversão',
    [RelatorioCategoria.GARGALOS_OPERACIONAIS]: 'Gargalos Operacionais',
  };
  const label = labels[categoria];
  if (!label)
    throw new InternalServerErrorException(
      'Categoria de relatório desconhecida',
    );
  return label;
}

@Injectable()
export class ReportsService {
  private readonly logger: Logger = new Logger(ReportsService.name);

  constructor(
    @InjectModel(Relatorio)
    private readonly relatorioModel: typeof Relatorio,
    private readonly cloudinaryService: CloudinaryService,
    private readonly cryptoUtil: CryptoUtil,
    private readonly pdfGeneratorService: PdfGeneratorService,
  ) {}

  getCategorias(): RelatorioCategoriaResponseDto[] {
    return Object.values(RelatorioCategoria).map(
      (categoria) =>
        new RelatorioCategoriaResponseDto(
          getCategoriaLabel(categoria),
          categoria,
        ),
    );
  }

  async listarRelatorios(): Promise<ResponseReportDto[]> {
    try {
      const relatorios = await this.relatorioModel.findAll({
        order: [['dataGeracao', 'DESC']],
      });

      return relatorios.map((relatorio) => {
        const decryptedInfo = this.cryptoUtil.decrypt(
          relatorio.urlDocumentoHash,
        );
        this.logger.log(
          `Informações do documento descriptografadas: ${decryptedInfo}`,
        );
        const urlDocumento =
          this.cloudinaryService.generateTemporaryUrl(decryptedInfo);
        console.log(`URL temporária gerada: ${urlDocumento}`);

        return plainToInstance(ResponseReportDto, {
          ...relatorio.get(),
          urlDocumento,
        });
      });
    } catch (error) {
      this.logger.error(
        'Erro ao listar relatórios',
        error instanceof Error ? (error.stack ?? error.message) : String(error),
      );

      throw new InternalServerErrorException(
        error instanceof Error ? (error.stack ?? error.message) : String(error),
      );
    }
  }

  async deleteById(id: number): Promise<void> {
    const relatorio = await this.relatorioModel.findByPk(id);

    if (!relatorio) {
      throw new NotFoundException('Relatório não encontrado');
    }

    await relatorio.destroy();
  }

  async generateReport(
    createReportDto: CreateReportDto,
  ): Promise<ResponseReportDto> {
    const currentDate = new Date();
    const diasEmMs = 30 * 24 * 60 * 60 * 1000;

    const dataPeriodoInicio = createReportDto.dataPeriodoInicio
      ? new Date(createReportDto.dataPeriodoInicio)
      : new Date(currentDate.getTime() - diasEmMs);
    dataPeriodoInicio.setUTCHours(0, 0, 0, 0);

    const dataPeriodoFim = createReportDto.dataPeriodoFim
      ? new Date(createReportDto.dataPeriodoFim)
      : currentDate;
    dataPeriodoFim.setUTCHours(23, 59, 59, 999);
    createReportDto.dataPeriodoInicio = dataPeriodoInicio;
    createReportDto.dataPeriodoFim = dataPeriodoFim;

    try {
      const pdfBuffer =
        await this.pdfGeneratorService.generate(createReportDto);

      const multerFile: Express.Multer.File = {
        fieldname: 'report',
        originalname: `${createReportDto.nome.replace(/\s+/g, '_')}.pdf`,
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

      const encryptedUrl = this.cryptoUtil.encrypt(
        `${resourceType}|${publicId}`,
      );

      const relatorioCriado = await this.relatorioModel.create({
        nome: createReportDto.nome,
        descricao: createReportDto.descricao ?? null,
        categoria: createReportDto.categoria,
        urlDocumentoHash: encryptedUrl,
        dataGeracao: currentDate,
        periodoInicio: dataPeriodoInicio,
        periodoFim: dataPeriodoFim,
      });

      const decryptedInfo = this.cryptoUtil.decrypt(
        relatorioCriado.urlDocumentoHash,
      );
      const urlDocumento =
        this.cloudinaryService.generateTemporaryUrl(decryptedInfo);

      return plainToInstance(ResponseReportDto, {
        ...relatorioCriado.get(),
        urlDocumento,
      });
    } catch (error) {
      this.logger.error(
        'Erro ao gerar relatório',
        error instanceof Error ? (error.stack ?? error.message) : String(error),
      );
      throw new InternalServerErrorException(
        error instanceof Error ? (error.stack ?? error.message) : String(error),
      );
    }
  }
}
