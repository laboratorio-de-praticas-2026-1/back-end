import { Injectable, BadRequestException } from '@nestjs/common';

interface Servico {
  id: number;
  nome: string;
  descricao: string;
  valor_base: number;
  prazo_estimado_dias: number;
  ativo: boolean;
}

@Injectable()
export class ServicosService {
  private servicos: Servico[] = [];
  private idAtual = 1;

  async criarServico(
    nome: string,
    descricao: string,
    valor_base: number,
    prazo_estimado_dias: number,
    ativo: boolean,
  ): Promise<Servico> {
    // validação
    if (!nome || !descricao) {
      throw new BadRequestException(
        'Nome e descrição são obrigatórios',
      );
    }

    if (valor_base === undefined || prazo_estimado_dias === undefined) {
      throw new BadRequestException(
        'Valor base e prazo estimado são obrigatórios',
      );
    }

    const novoServico: Servico = {
      id: this.idAtual++,
      nome,
      descricao,
      valor_base,
      prazo_estimado_dias,
      ativo,
    };

    this.servicos.push(novoServico);

    return novoServico;
  }
}