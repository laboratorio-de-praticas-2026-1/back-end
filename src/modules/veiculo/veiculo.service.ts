import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Veiculo } from 'src/models/veiculo.model';
import { VeiculoCreateDto } from './dto/veiculo-create.dto';
import { VeiculoUpdateDto } from './dto/veiculo-update.dto';

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

  async criarVeiculo(veiculoDto: VeiculoCreateDto): Promise<Veiculo> {
    this.logger.log(`Criando veículo com placa: ${veiculoDto.placa}`);
    return await this.veiculoModel.create({
      usuarioId: veiculoDto.usuarioId,
      placa: veiculoDto.placa,
      renavam: veiculoDto.renavam,
      marca: veiculoDto.marca,
      modelo: veiculoDto.modelo,
      anoFabricacao: veiculoDto.anoFabricacao,
      anoModelo: veiculoDto.anoModelo,
    });
  }

  async atualizarVeiculo(id: number, veiculoDto: VeiculoUpdateDto): Promise<Veiculo> {
    this.logger.log(`Atualizando veículo com ID: ${id}`);
    const veiculo = await this.veiculoModel.findByPk(id);

    if (!veiculo) {
      throw new NotFoundException('Veículo não encontrado');
    }

    await veiculo.update({
      usuarioId: veiculoDto.usuarioId,
      placa: veiculoDto.placa,
      renavam: veiculoDto.renavam,
      marca: veiculoDto.marca,
      modelo: veiculoDto.modelo,
      anoFabricacao: veiculoDto.anoFabricacao,
      anoModelo: veiculoDto.anoModelo,
    });

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
