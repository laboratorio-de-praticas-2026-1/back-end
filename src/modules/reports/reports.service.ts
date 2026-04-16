import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { plainToInstance } from 'class-transformer';
import { CryptoUtil } from 'src/commons/utils/crypto';
import { CloudinaryService } from 'src/infra/cloudinary/cloudinary.service';
import { Relatorio } from 'src/models/relatorio.model';
import { CreateReportDto } from './dto/create-report.dto';
import { ResponseReportDto } from './dto/response-report.dto';

@Injectable()
export class ReportsService {
  private readonly logger: Logger = new Logger(ReportsService.name);

  constructor(
    @InjectModel(Relatorio)
    private readonly relatorioModel: typeof Relatorio,
    private readonly cloudinaryService: CloudinaryService,
    private readonly cryptoUtil: CryptoUtil,
  ) {}

  async generateReport(
    createReportDto: CreateReportDto,
  ): Promise<ResponseReportDto> {
    const currentDate = new Date();
    //TODO-AVALIAR-SE-MANTEM-TRINTA-DIAS-COMO-PADRAO-QUANDO-NAO-FOR-PASSADO-INTERVALO-DE-DATAS-PELO-USUÁRIO
    const diasEmMs = 30 * 24 * 60 * 60 * 1000; //30 dias em milissegundos
    const dataInicio = createReportDto.dataInicio
      ? new Date(createReportDto.dataInicio)
      : new Date(currentDate.getTime() - diasEmMs);
    dataInicio.setUTCHours(0, 0, 0, 0);

    const dataPeriodoFim = createReportDto.dataPeriodoFim
      ? new Date(createReportDto.dataPeriodoFim)
      : currentDate;
    dataPeriodoFim.setUTCHours(23, 59, 59, 999);

    try {
      //TODO-Implementar a lógica de geração de relatório, incluindo a criação do PDF

      //TODO-DESCOMENTAR-ESSE-USO-E-PASSAR-PDF-GERADO-COMO-PARAMETRO DA FUNCAO uploadDocument
      /*
        const pdfUrl = await this.cloudinaryService.uploadDocument(arquivo PDF gerado, o tipo esperado aqui é Express.Multer.File)
        const publicId = pdfUrl.public_id as string;
        const resourceType = pdfUrl.resource_type as 'raw' | 'image';
        */

      const relatorioCriado = await this.relatorioModel.create({
        nome: createReportDto.nome,
        descricao: createReportDto.descricao ? createReportDto.descricao : null,
        categoria: createReportDto.categoria,
        //TODO-Tirar as aspas simples para usar valores de variáveis
        urlDocumentoHash: this.cryptoUtil.encrypt(
          '`${resourceType}|${publicId}`',
        ),
        dataGeracao: currentDate,
      });

      return plainToInstance(ResponseReportDto, {
        ...relatorioCriado.get(),
        urlDocumentoHash: this.cloudinaryService.generateTemporaryUrl(
          this.cryptoUtil.decrypt(relatorioCriado.urlDocumentoHash),
        ),
      });
    } catch (error) {
      this.logger.error('Erro ao gerar relatório', error);
      throw new InternalServerErrorException(
        'Erro ao gerar relatório. Tente novamente.',
      );
    }
  }
}
