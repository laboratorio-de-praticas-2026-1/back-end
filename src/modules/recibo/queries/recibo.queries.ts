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
        @InjectModel(Solicitacao) private readonly solicitacaoModel: typeof Solicitacao
    ) {}
    
    async function getValoresRecibo(id: number) {
        return this.solicitacaoModel.findOne({
            where: {id : id},
            attributes: ['createdAt' as 'data_inicio'],
            include: [
                {
                    model: Usuario,
                    attributes: ['nome', 'email','cpf_cnpj','celular']
                },{
                    model: Veiculo,
                    attributes: ['marca','modelo','placa','renavam','ano_fabricacao','ano_modelo']
                },{
                    model: Servico,
                    attributes: ['nome' as 'servico']
                },{
                    model: DebitoSolicitacao,
                    include: [
                        {
                            model: Debito,
                            include: [
                                {
                                    model: Pagamento,
                                    attributes: ['valor_total','qtd_parcelas','tipo_pagamento','metodo_pagamento','taxa','createdAt' as 'data_pagamento']
                                }
                            ]
                        }
                    ]
                }
            ]
        })
    }
}
