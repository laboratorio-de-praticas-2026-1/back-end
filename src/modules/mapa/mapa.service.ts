import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, WhereOptions } from 'sequelize';
import { Empresa } from 'src/models/empresa.model';

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

  async findAll(): Promise<Empresa[]> {
    return this.empresaModel.findAll({
      where: this.defaultFiltroMapa,
    });
  }

  async findByTipo(tipo: string): Promise<Empresa[]> {
    const tipoFormatado = this.validateTipo(tipo);

    return this.empresaModel.findAll({
      where: {
        ...this.defaultFiltroMapa,
        tipo: tipoFormatado,
      },
    });
  }

  async findByCidade(cidade: string): Promise<Empresa[]> {
    return this.empresaModel.findAll({
      where: {
        ...this.defaultFiltroMapa,
        cidade: {
          [Op.like]: `%${cidade}%`,
        },
      },
    });
  }

  async findComFiltro(tipo?: string, cidade?: string): Promise<Empresa[]> {
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

    return this.empresaModel.findAll({
      where: condicoesFiltro,
    });
  }
}
