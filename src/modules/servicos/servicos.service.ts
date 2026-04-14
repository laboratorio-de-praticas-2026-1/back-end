import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Servico } from 'src/models/servico.model';
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

  async updateServico(id: number, dados: Partial<Servico>): Promise<Servico> {
    const servico = await this.findOne(id);
    await servico.update(dados);
    return servico.reload();
  }

  async deleteServico(id: number): Promise<void> {
    const servico = await this.findOne(id);
    await servico.destroy();
  }

    async createServico(dados: Partial<Servico>): Promise<Servico> {
    if (!dados.nome) {
      throw new BadRequestException('Nome é obrigatório');
    }
    return await this.servicoModel.create(dados as any);
  }
}

