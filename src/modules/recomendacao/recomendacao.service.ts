import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

@Injectable()
export class RecomendacaoService{
    constructor(
        @InjectEntityManager()
        private entityManager: EntityManager,
    ){}
    
    async buscarAtributosPerfil(usuarioId: number){
        const buscarAtributosPerfil = await this.executarBuscaAtributosPerfil(usuarioId);
        return buscarAtributosPerfil;
    }

    private async executarBuscaAtributosPerfil(usuarioId: number){
        const query =`
            SELECT 
                servico.nome,
                servico.descricao,
                servico.valor_base,
                servico.ativo
            FROM SOLICITACAO solicitacao
            INNER JOIN SERVICO servico ON solicitacao.servicoId = servico.id
            WHERE solicitacao.usuarioId = ?
            AND servico.perfil_recomendacao = true
        `;
    
        const resultado = await this.entityManager.query(query, [usuarioId]);
        return resultado;
    }
}
