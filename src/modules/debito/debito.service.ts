import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Debito, TipoDebito } from '../../models/debito.model';
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

    const debitosVeiculo = (veiculo.debitoVeiculos ?? []).filter(
      (dv: DebitoVeiculo) => dv.debito?.tipo === TipoDebito.VEICULO,
    );

    if (
      (veiculo.debitoVeiculos ?? []).length > 0 &&
      debitosVeiculo.length === 0
    ) {
      throw new BadRequestException(
        'Nenhum débito do tipo veículo encontrado para esta placa',
      );
    }

    const debitos = debitosVeiculo.map((dv: DebitoVeiculo) => ({
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
