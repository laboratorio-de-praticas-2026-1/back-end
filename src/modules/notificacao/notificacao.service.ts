import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';

type Notification = {
  titulo: string;
  mensagem: string;
  valor: number;
  data: Date;
};

@Injectable()
export class NotificacaoService {
  constructor(private readonly sequelize: Sequelize) {}

  async enviarConfirmacaoSolicitacao(data: any): Promise<void> {
    console.log('Notificação enviada', data);
  }

  async getUserNotifications(userId: number): Promise<Notification[]> {
    const [results]: any = await this.sequelize.query(
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
      },
    );

    return results.map((debito: any) => ({
      titulo: 'Débito pendente',
      mensagem: `Você possui um débito pendente para o veículo ${debito.placa}. ${debito.descricao}`,
      valor: Number(debito.valor),
      data: debito.created_at,
    }));
  }
}