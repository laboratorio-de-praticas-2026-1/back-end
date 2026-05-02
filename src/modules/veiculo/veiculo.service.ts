import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Veiculo } from 'src/models/veiculo.model';

@Injectable()
export class VeiculoService {
  private readonly logger = new Logger(VeiculoService.name);

  constructor(
    @InjectModel(Veiculo)
    private veiculoModel: typeof Veiculo,
  ) {}

  async getAll(): Promise<Veiculo[]> {
    this.logger.log('Buscando todos os veículos...');
    return this.veiculoModel.findAll();
  }

  async getById(id: number): Promise<Veiculo> {
    this.logger.log(`Buscando veículo por ID: ${id}`);
    const veiculo = await this.veiculoModel.findByPk(id);

    if (!veiculo) {
      throw new NotFoundException('Veículo não encontrado');
    }

    return veiculo;
  }

  async deleteById(id: number): Promise<void> {
    this.logger.log(`Removendo veículo com ID: ${id}`);

    const veiculo = await this.veiculoModel.findByPk(id);

    if (!veiculo) {
      throw new NotFoundException('Veículo não encontrado');
    }

    await veiculo.destroy();
  }
}
