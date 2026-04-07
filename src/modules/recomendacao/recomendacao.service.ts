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
                    'servico.ativo'
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
        
            if(!atributos ||atributos.length == 0){
                this.logger.warn(`Nenhum serviço com perfil de recomendação encontrado para usuário ${usuarioId}`);
        
                throw new NotFoundException(`Nenhum serviço encontrado para o usuário com id ${usuarioId}`);
            }
            return atributos;

        } catch(error){
            this.logger.error(`Erro ao buscar serviços para o user com id ${usuarioId}`);
        
            throw new InternalServerErrorException('Erro ao buscar serviços para recomendação');
        }
    }
}