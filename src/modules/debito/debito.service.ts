import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Debito, TipoDebito } from 'src/models/debito.model';
import { DebitoVeiculo } from 'src/models/debito-veiculo.model';
import { Veiculo } from 'src/models/veiculo.model';
import { DebitoItemDto, DebitoResponseDto } from './dto/debito-response.dto';

@Injectable()
export class DebitoService {
  private readonly logger = new Logger(DebitoService.name);

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
    }) as Veiculo | null;

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
      this.logger.warn(
        `Veículo ${placa} possui débitos mas nenhum é do tipo veículo`,
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
