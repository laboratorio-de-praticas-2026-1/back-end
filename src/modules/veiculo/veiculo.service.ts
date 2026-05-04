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

  async atualizarVeiculo(
    id: number,
    veiculoDto: VeiculoUpdateDto,
  ): Promise<Veiculo> {
    this.logger.log(`Atualizando veículo com ID: ${id}`);
    const veiculo = await this.veiculoModel.findByPk(id);

    if (!veiculo) {
      throw new NotFoundException('Veículo não encontrado');
    }

    const updateData: Partial<Veiculo> = {};

    if (veiculoDto.usuarioId !== undefined) {
      updateData.usuarioId = veiculoDto.usuarioId;
    }

    if (veiculoDto.placa !== undefined) {
      updateData.placa = veiculoDto.placa;
    }

    if (veiculoDto.renavam !== undefined) {
      updateData.renavam = veiculoDto.renavam;
    }

    if (veiculoDto.marca !== undefined) {
      updateData.marca = veiculoDto.marca;
    }

    if (veiculoDto.modelo !== undefined) {
      updateData.modelo = veiculoDto.modelo;
    }

    if (veiculoDto.anoFabricacao !== undefined) {
      updateData.anoFabricacao = veiculoDto.anoFabricacao;
    }

    if (veiculoDto.anoModelo !== undefined) {
      updateData.anoModelo = veiculoDto.anoModelo;
    }

    await veiculo.update(updateData);
    await veiculo.reload();

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
