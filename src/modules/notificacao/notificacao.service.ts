import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { QueryTypes } from 'sequelize';

type Notification = {
  titulo: string;
  mensagem: string;
  valor: number;
  data: Date;
};

interface DebitoResult {
  id: number;
  descricao: string;
  valor: number;
  created_at: Date;
  placa: string;
}

@Injectable()
export class NotificacaoService {
  constructor(private readonly sequelize: Sequelize) {}

  // Removeu 'async' e trocou 'any' por Record<string, unknown>
  enviarConfirmacaoSolicitacao(data: Record<string, unknown>): void {
    console.log('Notificação enviada', data);
  }

  async getUserNotifications(userId: number): Promise<Notification[]> {
    const results: DebitoResult[] = await this.sequelize.query(
      `
      SELECT 
        d.id,
        d.descricao,
        d.valor,
        d.created_at,
        v.placa
      FROM debito d
      JOIN debito_veiculo dv ON dv.id_debito = d.id
      JOIN veiculo v ON v.id = dv.id_veiculo
      WHERE v.usuario_id = :userId
      AND d.status = 'pendente'
      ORDER BY d.created_at DESC
      `,
      {
        replacements: { userId },
        type: QueryTypes.SELECT, // ESSENCIAL para tipagem correta
      },
    );

    return (results || []).map((debito) => ({
      titulo: 'Débito pendente',
      mensagem: `Você possui um débito pendente para o veículo ${debito.placa}. ${debito.descricao}`,
      valor: Number(debito.valor),
      data: debito.created_at,
    }));
  }
}
