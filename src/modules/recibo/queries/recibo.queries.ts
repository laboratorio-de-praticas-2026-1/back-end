import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Solicitacao } from 'src/models/solicitacao.model';
import { Veiculo } from 'src/models/veiculo.model';
import { Usuario } from 'src/models/usuario.model';
import { Servico } from 'src/models/servico.model';
import { Debito } from 'src/models/debito.model';
import { DebitoSolicitacao } from 'src/models/debito-solicitacao.model';
import { Pagamento } from 'src/models/pagamento.model';

@Injectable()
export class ReciboQueries {
  constructor(
    @InjectModel(Solicitacao)
    private readonly solicitacaoModel: typeof Solicitacao,
  ) {}

  async getValoresRecibo(id: number) {
    return this.solicitacaoModel.findOne({
      where: { id },
      attributes: ['id', 'dataSolicitacao'],
      include: [
        {
          model: Usuario,
          attributes: ['nome', 'email', 'cpfCnpj', 'celular'],
        },
        {
          model: Veiculo,
          attributes: [
            'marca',
            'modelo',
            'placa',
            'renavam',
            'anoFabricacao',
            'anoModelo',
          ],
        },
        {
          model: Servico,
          attributes: ['nome'],
        },
        {
          model: DebitoSolicitacao,
          attributes: ['id'],
          include: [
            {
              model: Debito,
              attributes: ['id', 'tipo', 'status', 'valor'],
              include: [
                {
                  model: Pagamento,
                  attributes: [
                    'valorTotal',
                    'qtdParcelas',
                    'tipoPagamento',
                    'metodoPagamento',
                    'taxa',
                    'createdAt',
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
  }
}
