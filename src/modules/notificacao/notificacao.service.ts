import { Injectable } from '@nestjs/common';

type Notification = {
  titulo: string;
  mensagem: string;
  valor: number;
  data: Date;
};

@Injectable()
export class NotificacaoService {

  async enviarConfirmacaoSolicitacao(data: any): Promise<void> {
    console.log('Notificação enviada', data);
  }

  async getUserNotifications(userId: number): Promise<Notification[]> {
    const veiculos = [
      { id: 1, usuarioId: 1, placa: 'ABC-1234' },
      { id: 2, usuarioId: 2, placa: 'XYZ-9999' },
    ];

    const debitos = [
      {
        id: 1,
        veiculoId: 1,
        status: 'aguardando_pagamento',
        valor: 200,
        data: new Date(),
      },
    ];

    // Buscar veículos do usuário
    const veiculosDoUsuario = veiculos.filter(v => v.usuarioId === userId);
    if (veiculosDoUsuario.length === 0) return [];

    const veiculoIds = veiculosDoUsuario.map(v => v.id);

    // Buscar débitos pendentes
    const debitosPendentes = debitos.filter(
      d =>
        veiculoIds.includes(d.veiculoId) &&
        d.status === 'aguardando_pagamento',
    );

    if (debitosPendentes.length === 0) return [];

    // Gerar notificações
    return debitosPendentes.map(d => {
      const veiculo = veiculos.find(v => v.id === d.veiculoId);

      return {
        titulo: 'Débito pendente',
        mensagem: `Débito para o veículo ${veiculo?.placa}`,
        valor: d.valor,
        data: d.data,
      };
    });
  }
}