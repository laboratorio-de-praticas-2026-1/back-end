import { Injectable, Inject, forwardRef, Logger, NotFoundException } from '@nestjs/common';
import { NotificacaoGateway } from './notificacao.gateway';

@Injectable()
export class NotificacaoService {
  private readonly logger = new Logger(NotificacaoService.name);

  constructor(
    @Inject(forwardRef(() => NotificacaoGateway))
    private readonly notificacaoGateway: NotificacaoGateway,
    // Se o PrismaService estiver dando erro de import, comente a linha abaixo
    // private readonly prisma: any, 
  ) {}

  // --- Função que o Controller está pedindo ---
  async buscarNotificacoesPorUsuario(usuarioId: number) {
    this.logger.log(`Buscando notificações para o usuário ${usuarioId}`);
    return []; // Retorna vazio já que não podemos usar a tabela no banco
  }

  // --- Função que o Controller está pedindo ---
  async marcarComoLida(id: number) {
    this.logger.log(`Marcando notificação ${id} como lida`);
    return { id, lida: true };
  }

  // --- Função que o Gateway está pedindo (CNH) ---
  async notificarVencimentoCNH(usuarioId: number, dias: number) {
    this.notificacaoGateway.enviarNotificacao('alerta_cnh', { usuarioId, dias });
  }

  // --- Função que o Gateway está pedindo (Licenciamento) ---
  async notificarLicenciamentoProximo(usuarioId: number, placa: string, dias: number) {
    this.notificacaoGateway.enviarNotificacao('alerta_licenciamento', { usuarioId, placa, dias });
  }

  // --- Função que o Gateway está pedindo (Débito) ---
  async notificarNovoDebito(usuarioId: number, placa: string, valor: number) {
    this.notificacaoGateway.enviarNotificacao('alerta_debito', { usuarioId, placa, valor });
  }
}