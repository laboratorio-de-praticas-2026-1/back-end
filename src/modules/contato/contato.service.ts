import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Empresa } from 'src/models/empresa.model';
import { ContatoMensagem } from 'src/models/contato-mensagem.model';
import { EmpresaDto } from './dto/empresa-response.dto';
import { EnviarEmailDto } from './dto/enviar-email.dto';
import { EmailService } from './email.service';

@Injectable()
export class ContatoService {
  private readonly logger = new Logger(ContatoService.name);

  constructor(
    @InjectModel(Empresa) private empresaModel: typeof Empresa,
    @InjectModel(ContatoMensagem) private contatoMensagemModel: typeof ContatoMensagem,
    private readonly emailService: EmailService,
  ) {}

  private formatarCnpj(cnpj: string | null): string {
    if (!cnpj) return '';
    const apenasNumeros = cnpj.replace(/\D/g, '');
    if (apenasNumeros.length === 14) {
      return apenasNumeros.replace(
        /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
        '$1.$2.$3/$4-$5',
      );
    }
    return cnpj;
  }

  async buscarContato(): Promise<EmpresaDto> {
    try {
      const empresa: Empresa | null = await this.empresaModel.findOne();

      if (!empresa) {
        throw new HttpException(
          'Dados de contato não encontrados',
          HttpStatus.NOT_FOUND,
        );
      }

      const cnpjFormatado = this.formatarCnpj(empresa.cnpj);

      return new EmpresaDto(
        empresa.id,
        empresa.nomeFantasia ?? '',
        cnpjFormatado,
        empresa.telefone ?? '',
        empresa.email ?? '',
        empresa.endereco ?? '',
        empresa.cidade ?? '',
        empresa.estado ?? '',
        empresa.site ?? '',
      );
    } catch (error) {
      if (
        error instanceof ConnectionError ||
        error instanceof ConnectionRefusedError ||
        error instanceof HostNotFoundError
      ) {
        throw new HttpException(
          'Banco de dados indisponível',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
      throw error;
    }
  }

  async buscarContatoById(id: number): Promise<EmpresaDto> {
    try {
      const empresa: Empresa | null = await this.empresaModel.findByPk(id);

      if (!empresa) {
        throw new NotFoundException('Dados de contato não encontrados');
      }

      const cnpjFormatado = this.formatarCnpj(empresa.cnpj);

      return new EmpresaDto(
        empresa.id,
        empresa.nomeFantasia ?? '',
        cnpjFormatado,
        empresa.telefone ?? '',
        empresa.email ?? '',
        empresa.endereco ?? '',
        empresa.cidade ?? '',
        empresa.estado ?? '',
        empresa.site ?? '',
      );
    } catch (error) {
      if (
        error instanceof ConnectionError ||
        error instanceof ConnectionRefusedError ||
        error instanceof HostNotFoundError
      ) {
        throw new HttpException(
          'Banco de dados indisponível',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
      throw error;
    }
  }

  async enviarEmail(dados: EnviarEmailDto): Promise<{ message: string }> {
    try {
      const dataEnvio = new Date();

      await this.contatoMensagemModel.create({
        nome: dados.nome,
        email: dados.email,
        telefone: dados.telefone || null,
        mensagem: dados.mensagem,
        dataEnvio: dataEnvio,
      });

      await this.emailService.enviarEmailContato({
        nome: dados.nome,
        email: dados.email,
        telefone: dados.telefone,
        mensagem: dados.mensagem,
        dataEnvio: dataEnvio,
      });

      return { message: 'Mensagem enviada com sucesso!' };
    } catch (error) {
      this.logger.error(`Erro ao processar envio: ${error.message}`);
      throw new HttpException(
        error.message || 'Erro ao enviar mensagem',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}