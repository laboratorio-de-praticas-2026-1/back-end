import { Injectable, Logger } from '@nestjs/common';

type ConfirmacaoSolicitacaoPayload = {
  email: string;
  nomeUsuario: string;
  solicitacaoId: number;
  servicoNome: string;
};

@Injectable()
export class NotificacaoService {
  private readonly logger = new Logger(NotificacaoService.name);

  async enviarConfirmacaoSolicitacao(
    payload: ConfirmacaoSolicitacaoPayload,
  ): Promise<void> {
    this.logger.log(
      `Confirmacao da solicitacao ${payload.solicitacaoId} registrada para ${payload.email} (${payload.nomeUsuario}) no servico ${payload.servicoNome}.`,
    );
  }
}
