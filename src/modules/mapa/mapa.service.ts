import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, WhereOptions } from 'sequelize';
import { Empresa } from 'src/models/empresa.model';
import { EmpresaResponseDto } from './dto/empresa-response.dto';

const tipos_empresas = ['clinica', 'vistoria', 'detran'];

@Injectable()
export class MapaService {
  constructor(
    @InjectModel(Empresa)
    private empresaModel: typeof Empresa,
  ) {}

  private get defaultFiltroMapa() {
    return {
      latitude: { [Op.notIn]: [null, ''] },
      longitude: { [Op.notIn]: [null, ''] },
    };
  }

  private validateTipo(tipo: string): string {
    const tipoFormatado = tipo.toLowerCase();

    if (!tipos_empresas.includes(tipoFormatado)) {
      throw new BadRequestException(
        `O tipo '${tipo}' não é válido para o mapa`,
      );
    }

    return tipoFormatado;
  }

  private mapToDto(empresas: Empresa[]): EmpresaResponseDto[] {
    return empresas.map(
      (e) =>
        new EmpresaResponseDto(
          e.id,
          e.nomeFantasia ?? '',
          e.tipo ?? '',
          e.cidade ?? '',
          e.estado ?? '',
          e.endereco ?? '',
          e.latitude ?? '',
          e.longitude ?? '',
        ),
    );
  }

  async findAll(): Promise<EmpresaResponseDto[]> {
    const empresas = await this.empresaModel.findAll({
      where: this.defaultFiltroMapa,
    });

    return this.mapToDto(empresas);
  }

  async findByTipo(tipo: string): Promise<EmpresaResponseDto[]> {
    const tipoFormatado = this.validateTipo(tipo);

    const empresas = await this.empresaModel.findAll({
      where: {
        ...this.defaultFiltroMapa,
        tipo: tipoFormatado,
      },
    });

    return this.mapToDto(empresas);
  }

  async findByCidade(cidade: string): Promise<EmpresaResponseDto[]> {
    const empresas = await this.empresaModel.findAll({
      where: {
        ...this.defaultFiltroMapa,
        cidade: {
          [Op.like]: `%${cidade}%`,
        },
      },
    });

    return this.mapToDto(empresas);
  }

  async findComFiltro(
    tipo?: string,
    cidade?: string,
  ): Promise<EmpresaResponseDto[]> {
    const condicoesFiltro: WhereOptions<Empresa> = {
      ...this.defaultFiltroMapa,
    };

    if (tipo) {
      condicoesFiltro.tipo = this.validateTipo(tipo);
    }

    if (cidade) {
      condicoesFiltro.cidade = {
        [Op.like]: `%${cidade}%`,
      };
    }

    const empresas = await this.empresaModel.findAll({
      where: condicoesFiltro,
    });

    return this.mapToDto(empresas);
  }
}
