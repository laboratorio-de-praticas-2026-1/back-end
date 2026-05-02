import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Empresa } from 'src/models/empresa.model';
import { EmpresaDto } from './dto/empresa-response.dto';
import { EmailService } from 'src/infra/email/email.service';
import { EmailParams } from 'src/infra/email/dto/email-params';
import { ContatoEmailRequestDto } from './dto/contato-email.dto';

@Injectable()
export class ContatoService {
  constructor(
    @InjectModel(Empresa) private empresaModel: typeof Empresa,
    private readonly emailService: EmailService,
  ) {}

  async enviarEmail(data: ContatoEmailRequestDto): Promise<void> {
    const destino = process.env.CONTACT_EMAIL;

    if (!destino) {
      throw new BadRequestException('Contato da empresa nao configurado');
    }

    const emailParams: EmailParams = {
      to: destino,
      template: 'contato',
      dados: {
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        mensagem: data.mensagem,
      },
    };

    await this.emailService.enviarEmail(emailParams);
  }

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
}
