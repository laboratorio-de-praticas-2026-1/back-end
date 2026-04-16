import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Empresa } from 'src/models/empresa.model';
import { EmpresaDto } from './dto/empresa-response.dto';

@Injectable()
export class ContatoService {
  constructor(@InjectModel(Empresa) private empresaModel: typeof Empresa) {}

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