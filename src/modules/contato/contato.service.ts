import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { EmailParams } from 'src/infra/email/dto/email-params';
import { CONTATO_DUVIDA_CLIENTE } from 'src/infra/email/templates/templates-names';
import { Empresa } from 'src/models/empresa.model';
import { EmailService } from '../../infra/email/email.service';
import { EmpresaDto } from './dto/empresa-response.dto';
import { EnviarEmailDto } from './dto/enviar-email-dto';

@Injectable()
export class ContatoService {
  private readonly logger = new Logger(ContatoService.name);

  private readonly ASSUNTO_FIXO = 'Contato Duvida Cliente';

  constructor(
    @InjectModel(Empresa) private empresaModel: typeof Empresa,
    private readonly emailService: EmailService,
  ) {}

  async buscarContato(cnpj: string): Promise<EmpresaDto> {
    const empresa = await this.empresaModel.findOne({ where: { cnpj } });

    if (!empresa) {
      throw new NotFoundException('Dados de contato não encontrados');
    }

    return this.toDto(empresa);
  }

  async buscarContatoById(id: number, cnpj: string): Promise<EmpresaDto> {
    const empresa = await this.empresaModel.findOne({
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

  async enviarMensagemContato(
    dadosDto: EnviarEmailDto,
  ): Promise<{ message: string }> {
    try {
      const emailParams = this.montarEmailParams(dadosDto);

      await this.emailService.enviarEmail(emailParams);

      this.logger.log(`Mensagem enviada: ${dadosDto.email}`);

      return { message: 'Mensagem de contato enviada com sucesso!' };

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

  private montarEmailParams(dadosDto: EnviarEmailDto): EmailParams {
    const destinatario =
      process.env.CONTACT_EMAIL || 'seuemail@exemplo.com';

    if (!process.env.CONTACT_EMAIL) {
      this.logger.warn(
        'CONTACT_EMAIL não definido, usando email fallback',
      );
    }

    return new EmailParams(
      destinatario,
      CONTATO_DUVIDA_CLIENTE,
      this.ASSUNTO_FIXO,
      {
        nome: dadosDto.nome,
        email: dadosDto.email,
        mensagem: dadosDto.mensagem,
        telefone: dadosDto.telefone || 'Não fornecido',
        dataEnvio: new Date().toLocaleString(),
        assunto: this.ASSUNTO_FIXO,
      },
      false,
    );
  }
}