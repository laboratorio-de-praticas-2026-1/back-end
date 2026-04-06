import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Empresa } from 'src/models/empresa.model';
import { EmpresaDto } from './dto/empresa-response.dto';

@Injectable()
export class ContatoService {
  constructor(@InjectModel(Empresa) private empresaModel: typeof Empresa) {}

  // Buscar contato pelo CNPJ exato
  async buscarContato(cnpj: string): Promise<EmpresaDto> {
    const empresa: Empresa | null = await this.empresaModel.findOne({
      where: { cnpj },
    });

    if (!empresa) {
      throw new HttpException(
        'Dados de contato não encontrados',
        HttpStatus.NOT_FOUND,
      );
    }

    return this.toDto(empresa);
  }

  // Buscar contato pelo ID e CNPJ exato
  async buscarContatoById(id: number, cnpj: string): Promise<EmpresaDto> {
    const empresa: Empresa | null = await this.empresaModel.findOne({
      where: { id, cnpj },
    });

    if (!empresa) {
      throw new NotFoundException('Dados de contato não encontrados');
    }

    return this.toDto(empresa);
  }

  // Atualizar contato pelo ID e CNPJ exato
  async atualizarContato(
    id: number,
    cnpj: string,
    data: Partial<EmpresaDto>,
  ): Promise<void> {
    const [updated] = await this.empresaModel.update(data, {
      where: { id, cnpj },
    });

    if (updated === 0) {
      throw new NotFoundException(
        'Contato não encontrado ou não pertence à empresa',
      );
    }
  }

  // Converte o model em DTO
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
