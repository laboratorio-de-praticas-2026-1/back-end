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
}
