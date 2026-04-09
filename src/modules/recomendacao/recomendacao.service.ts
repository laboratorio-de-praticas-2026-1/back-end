import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Servico } from 'src/models/servico.model';
import { Solicitacao } from 'src/models/solicitacao.model';

@Injectable()
export class RecomendacaoService {
    private readonly logger = new Logger(RecomendacaoService.name);

    constructor(
      @InjectModel(Servico)
      private servicoModel: typeof Servico,
      @InjectModel(Solicitacao)
      private solicitacaoModel: typeof Solicitacao
    ) {}
    async buscarAtributosPerfil(usuarioId: number): Promise<any[]> {
        try{
            this.logger.log(`Buscando serviços do user com id ${usuarioId}`);
        
            const atributos = await this.solicitacaoModel.findAll({
                attributes: [
                    'servico.nome',
                    'servico.descricao',
                    'servico.valor_base',
                    ['servico.ativo', 'ativo'],
                ],
        
                where: {
                    usuarioId: usuarioId,
                },
        
                include: [{
                    model: this.servicoModel,
                    attributes: []
                }],
                raw: true,
                nest: true
                // limit: 5 -> possível implementacao posterior
            });

            let isEmpty = false;
            
            if (!atributos) {
                isEmpty = true;
            } else if (atributos.length === 0) {
                isEmpty = true;
            } else if (atributos.length === 1) {
                const primeiroElemento = atributos[0];
                if (!primeiroElemento || Object.keys(primeiroElemento).length === 0) {
                    isEmpty = true;
                }
            }
            
            if (isEmpty) {
                this.logger.warn(`Nenhum serviço com perfil de recomendação encontrado para usuário ${usuarioId}`);
                throw new NotFoundException(`Nenhum serviço encontrado para o usuário com id ${usuarioId}`);
            }
            
            const resultadosValidos = atributos.filter(attr => attr && Object.keys(attr).length > 0);
            
            if (resultadosValidos.length === 0) {
                this.logger.warn(`Nenhum serviço válido encontrado para usuário ${usuarioId}`);
                throw new NotFoundException(`Nenhum serviço encontrado para o usuário com id ${usuarioId}`);
            }
            
            return resultadosValidos;

        } catch(error){
            if (error instanceof NotFoundException) {
                throw error;
            }
            
            this.logger.error(`Erro ao buscar serviços para o user com id ${usuarioId}`);
        
            throw new InternalServerErrorException('Erro ao buscar serviços para recomendação');
        }
    }
}