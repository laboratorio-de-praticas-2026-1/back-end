import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Solicitacao } from '../../models/solicitacao.model';
import { UpdateSolicitacaoStatusDto, SolicitacaoStatus } from './dto/update-solicitacao-status.dto';

@Injectable()
export class ServicosService {
  constructor(
    @InjectModel(Solicitacao)
    private solicitacaoModel: typeof Solicitacao,
  ) {}

  async findSolicitacaoById(id: number): Promise<Solicitacao> {
    const solicitacao = await this.solicitacaoModel.findByPk(id);
    
    if (!solicitacao) {
      throw new NotFoundException(`Solicitação com ID ${id} não encontrada`);
    }
    
    return solicitacao;
  }

  async updateSolicitacaoStatus(
    id: number,
    updateSolicitacaoStatusDto: UpdateSolicitacaoStatusDto,
  ): Promise<{ message: string }> {
    const solicitacao = await this.findSolicitacaoById(id);

    const updateData: Partial<Solicitacao> = {
      status: updateSolicitacaoStatusDto.status,
    };

    const observacao = updateSolicitacaoStatusDto.observacao_admin || updateSolicitacaoStatusDto.observacaoAdmin;
    if (observacao) {
      updateData.observacaoAdmin = observacao;
    }

    if (updateSolicitacaoStatusDto.status === SolicitacaoStatus.CONCLUIDO) {
      updateData.dataConclusao = new Date();
    }

    await solicitacao.update(updateData);

    return {
      message: 'Status da solicitação atualizado com sucesso.',
    };
  }
}
