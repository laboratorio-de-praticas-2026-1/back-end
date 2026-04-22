import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Servico } from 'src/models/servico.model';
import { CreateServicoDto } from './dto/servico-create.dto';
import { UpdateServicoDto } from './dto/servico-update.dto';

@Injectable()
export class ServicosService {
  constructor(
    @InjectModel(Servico)
    private servicoModel: typeof Servico,
  ) {}

  async findAll(): Promise<Servico[]> {
    return this.servicoModel.findAll();
  }

  async findOne(id: number): Promise<Servico> {
    const servico = await this.servicoModel.findByPk(id);

    if (!servico) {
      throw new NotFoundException(`Serviço com id ${id} não encontrado`);
    }
    return servico;
  }

  async updateServico(
    id: number,
    servicoDto: UpdateServicoDto,
  ): Promise<Servico> {
    const servico = await this.findOne(id);

    if (!servico) {
      throw new NotFoundException(`Serviço com id ${id} não encontrado`);
    }

    await servico.update({
      nome: servicoDto.nome ?? servico.nome,
      descricao: servicoDto.descricao ?? servico.descricao,
      valorBase: servicoDto.valor_base ?? servico.valorBase,
      prazoEstimadoDias:
        servicoDto.prazo_estimado_dias ?? servico.prazoEstimadoDias,
      ativo: servicoDto.ativo ?? servico.ativo,
      exigeVeiculo: servicoDto.exige_veiculo ?? servico.exigeVeiculo,
    });
    await servico.reload();
    return servico;
  }

  async deleteServico(id: number): Promise<void> {
    const servico = await this.findOne(id);

    if (!servico) {
      throw new NotFoundException(`Serviço com id ${id} não encontrado`);
    }

    await servico.destroy();
  }

  async createServico(servicoDto: CreateServicoDto): Promise<Servico> {
    if (
      !servicoDto.nome ||
      servicoDto.valor_base == null ||
      servicoDto.prazo_estimado_dias == null
    ) {
      throw new BadRequestException('Nome e Valor Base são obrigatórios');
    }
    return await this.servicoModel.create({
      nome: servicoDto.nome,
      descricao: servicoDto.descricao,
      valorBase: servicoDto.valor_base,
      prazoEstimadoDias: servicoDto.prazo_estimado_dias,
      ativo: servicoDto.ativo ?? true,
      exigeVeiculo: servicoDto.exige_veiculo ?? false,
    });
  }
}
