import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Empresa } from 'src/models/empresa.model';
import { EmpresaDto } from './dto/empresa-response.dto';

@Injectable()
export class ContatoService {
  constructor(@InjectModel(Empresa) private empresaModel: typeof Empresa) {}

  async buscarContato(cnpj: string): Promise<EmpresaDto> {
    const empresa: Empresa | null = await this.empresaModel.findOne({
      where: { cnpj },
    });

    if (!empresa) {
      throw new NotFoundException('Dados de contato não encontrados');
    }

    return this.toDto(empresa);
  }

  async buscarContatoById(
    id: number,
    cnpj: string,
  ): Promise<EmpresaDto> {
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
}