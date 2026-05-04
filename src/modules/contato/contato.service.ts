import {
  Injectable,
  NotFoundException,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Empresa } from 'src/models/empresa.model';
import { EmpresaDto } from './dto/empresa-response.dto';
import { EnviarEmailDto } from './dto/enviar-email-dto';
import { EmailService } from 'src/infra/email/email.service';
import { EmailParams } from 'src/infra/email/dto/email-params';
import { EmailEnviado } from 'src/models/email-enviado.model';

const CONTATO_DUVIDA_CLIENTE = 'contato';

@Injectable()
export class ContatoService {
  private readonly logger = new Logger(ContatoService.name);
  private readonly ASSUNTO_FIXO = 'Contato Dúvida do Cliente';

  constructor(
    @InjectModel(Empresa) private empresaModel: typeof Empresa,
    @InjectModel(EmailEnviado)
    private emailEnviadoModel: typeof EmailEnviado,
    private readonly emailService: EmailService,
  ) {}

  async buscarContatoById(id: number): Promise<EmpresaDto> {
    const empresa: Empresa | null = await this.empresaModel.findOne({
      where: { id },
    });

    if (!empresa) {
      throw new NotFoundException('Dados de contato não encontrados');
    }

    return this.toDto(empresa);
  }

  async atualizarContato(
    id: number,
    data: Partial<EmpresaDto>,
  ): Promise<{ message: string }> {
    const empresa = await this.empresaModel.findOne({
      where: { id },
    });

    if (!empresa) {
      throw new NotFoundException('Contato não encontrado');
    }

    const safeData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined),
    );

    await this.empresaModel.update(safeData, {
      where: { id },
    });

    return {
      message: 'Contato atualizado com sucesso',
    };
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
      empresa.tipo ?? '',
      empresa.latitude ?? '',
      empresa.longitude ?? '',
    );
  }

  async enviarMensagemContato(
    dadosDto: EnviarEmailDto,
  ): Promise<{ message: string }> {
    try {
      const emailParams = this.montarEmailParams(dadosDto);

      await this.emailService.enviarEmail(emailParams);

      await this.emailEnviadoModel.create({
        nomeUsuario: dadosDto.nome,
        emailUsuario: dadosDto.email,
        textoDigitado: dadosDto.mensagem,
        assunto: this.ASSUNTO_FIXO,
        dataEnvio: new Date(),
      });

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
    const destinatario = process.env.CONTACT_EMAIL || 'seuexemplo@email.com';

    if (!process.env.CONTACT_EMAIL) {
      this.logger.warn('CONTACT_EMAIL não definido, usando email fallback');
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
