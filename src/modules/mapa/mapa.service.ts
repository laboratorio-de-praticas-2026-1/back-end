import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, WhereOptions } from 'sequelize';
import { Empresa } from 'src/models/empresa.model';

@Injectable()
export class MapaService {
  constructor(
    @InjectModel(Empresa)
    private readonly empresaModel: typeof Empresa,
  ) {}

  private readonly tiposValidos = ['clinica', 'vistoria', 'detran'];

  private validarTipo(tipo?: string): void {
    if (tipo && !this.tiposValidos.includes(tipo)) {
      throw new BadRequestException('Tipo inválido');
    }
  }

  private coordenadasValidas = {
    [Op.notIn]: [null, ''],
  };

  async findAll(): Promise<Empresa[]> {
    return this.empresaModel.findAll({
      where: {
        latitude: this.coordenadasValidas,
        longitude: this.coordenadasValidas,
      },
    });
  }

  async findByTipo(tipo: string): Promise<Empresa[]> {
    this.validarTipo(tipo);

    return this.empresaModel.findAll({
      where: {
        latitude: this.coordenadasValidas,
        longitude: this.coordenadasValidas,
        tipo,
      },
    });
  }

  async findByCidade(cidade: string): Promise<Empresa[]> {
    return this.empresaModel.findAll({
      where: {
        latitude: this.coordenadasValidas,
        longitude: this.coordenadasValidas,
        cidade: {
          [Op.like]: `%${cidade}%`,
        },
      },
    });
  }

  async findComFiltro(tipo?: string, cidade?: string): Promise<Empresa[]> {
    this.validarTipo(tipo);

    const where: WhereOptions<Empresa> = {
      latitude: this.coordenadasValidas,
      longitude: this.coordenadasValidas,
    };

    if (tipo) {
      Object.assign(where, { tipo });
    }

    if (cidade) {
      Object.assign(where, {
        cidade: {
          [Op.like]: `%${cidade}%`,
        },
      });
    }

    return this.empresaModel.findAll({ where });
  }
}
