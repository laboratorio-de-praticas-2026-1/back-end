import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Debito } from '../../models/debito.model';
import { DebitoVeiculo } from '../../models/debito-veiculo.model';
import { Veiculo } from '../../models/veiculo.model';
import { DebitoItemDto, DebitoResponseDto } from './dto/debito-response.dto';

@Injectable()
export class DebitoService {
  constructor(
    @InjectModel(Veiculo)
    private readonly veiculoModel: typeof Veiculo,
  ) {}

  async buscarDebitosPorPlaca(placa: string): Promise<DebitoResponseDto> {
    const veiculo = await this.veiculoModel.findOne({
      where: { placa },
      include: [
        {
          model: DebitoVeiculo,
          include: [Debito],
        },
      ],
    });

    if (!veiculo) {
      throw new NotFoundException(`Veículo com placa ${placa} não encontrado`);
    }

    const debitos = (veiculo.debitoVeiculos ?? []).map((dv: DebitoVeiculo) => ({
      id: dv.debito.id,
      descricao: dv.debito.descricao,
      valor: Number(dv.debito.valor),
      status: dv.debito.status,
    }));

    const total = debitos.reduce(
      (acc: number, d: DebitoItemDto) => acc + d.valor,
      0,
    );

    return { placa, debitos, total };
  }
}
