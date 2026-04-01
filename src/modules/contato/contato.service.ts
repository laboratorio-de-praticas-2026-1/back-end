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

  async buscarContato(): Promise<EmpresaDto> {
    const empresa: Empresa | null = await this.empresaModel.findOne();

    if (!empresa) {
      throw new HttpException(
        'Dados de contato não encontrados',
        HttpStatus.NOT_FOUND,
      );
    }

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

  async buscarContatoById(id: number): Promise<EmpresaDto> {
    const empresa: Empresa | null = await this.empresaModel.findByPk(id);

    if (!empresa) {
      throw new NotFoundException('Dados de contato não encontrados');
    }

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