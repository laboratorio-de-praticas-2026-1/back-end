import { Injectable } from '@nestjs/common';
import { NotificacaoGateway } from './notificacao.gateway';

@Injectable()
export class NotificacaoService {
  constructor(private readonly notificacaoGateway: NotificacaoGateway) {}

  public notificarVencimentoCNH(usuarioId: number, diasRestantes: number): void {
    const mensagem = `Sua CNH vence em ${diasRestantes} dias!`;
    this.notificacaoGateway.enviarNotificacao('alerta_cnh', { usuarioId, mensagem, diasRestantes });
    console.log(`[Notificação] CNH do usuário ${usuarioId} disparada.`);
  }

  public notificarLicenciamentoProximo(usuarioId: number, placa: string, diasRestantes: number): void {
    const mensagem = `O licenciamento do veículo ${placa} vence em ${diasRestantes} dias.`;
    this.notificacaoGateway.enviarNotificacao('alerta_licenciamento', { usuarioId, placa, mensagem, diasRestantes });
    console.log(`[Notificação] Licenciamento do veículo ${placa} disparada.`);
  }

  public notificarNovoDebito(usuarioId: number, placa: string, valor: number): void {
    const mensagem = `Novo débito de R$ ${valor} registrado para o veículo ${placa}.`;
    this.notificacaoGateway.enviarNotificacao('alerta_debito', { usuarioId, placa, mensagem, valor });
    console.log(`[Notificação] Novo débito do veículo ${placa} disparada.`);
  }
}