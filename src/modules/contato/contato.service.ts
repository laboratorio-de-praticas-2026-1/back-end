import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { EmailEnviado } from 'src/models/email-enviado.model';
import { Empresa } from 'src/models/empresa.model';
import { EnviarEmailDto } from '../../commons/email/dto/enviar-email.dto';
import { EmailService } from '../../commons/email/email.service';
import { EmpresaDto } from './dto/empresa-response.dto';

@Injectable()
export class ContatoService {
  private readonly logger = new Logger(ContatoService.name);

  constructor(
    @InjectModel(Empresa) private empresaModel: typeof Empresa,
    @InjectModel(EmailEnviado) private emailEnviadoModel: typeof EmailEnviado,
    private readonly emailService: EmailService,
  ) {}

  async buscarContato(cnpj: string): Promise<EmpresaDto> {
    const empresa: Empresa | null = await this.empresaModel.findOne({
      where: { cnpj },
    });

    if (!empresa) {
      throw new NotFoundException('Dados de contato não encontrados');
    }

    return this.toDto(empresa);
  }

  async buscarContatoById(id: number, cnpj: string): Promise<EmpresaDto> {
    const empresa: Empresa | null = await this.empresaModel.findOne({
      where: { id, cnpj },
    });

    if (!empresa) {
      throw new NotFoundException('Dados de contato não encontrados');
    }

    return this.toDto(empresa);
  }

  async atualizarContato(
    id: number,
    cnpj: string,
    data: Partial<EmpresaDto>,
  ): Promise<void> {
    const { cnpj: _, ...safeData } = data;

    const [updated] = await this.empresaModel.update(safeData, {
      where: { id, cnpj },
    });

    if (updated === 0) {
      throw new NotFoundException(
        'Contato não encontrado ou não pertence à empresa',
      );
    }
  }

  private toDto(empresa: Empresa): EmpresaDto {
    return new EmpresaDto(
      empresa.id,
      empresa.nomeFantasia ?? '',
      empresa.cnpj ?? '',
      empresa.telefone ?? '',
      empresa.email ?? '',
      empresa.endereco ?? '',
      empresa.cidade ?? '',
      empresa.estado ?? '',
      empresa.site ?? '',
    );
  }

  async enviarEmail(dados: EnviarEmailDto): Promise<{ message: string }> {
    try {
      const dataEnvio = new Date();

      // Salva no banco
      await this.emailEnviadoModel.create({
        nomeUsuario: dados.nome,
        emailUsuario: dados.email,
        assunto: dados.assunto,
        textoDigitado: dados.mensagem,
        dataEnvio: dataEnvio,
      });

      // Envia e-mail usando EmailService
      await this.emailService.enviarEmail(dados); // passa apenas o DTO

      return { message: 'Mensagem enviada com sucesso!' };
    } catch (error: unknown) {
      let mensagemErro = 'Erro ao enviar mensagem';
      if (error instanceof Error) {
        mensagemErro = error.message;
        this.logger.error(`Erro ao processar envio: ${error.message}`);
      } else {
        this.logger.error('Erro desconhecido ao processar envio');
      }
      throw new HttpException(mensagemErro, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}