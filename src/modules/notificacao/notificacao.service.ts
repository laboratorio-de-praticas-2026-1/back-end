import { Injectable, Logger } from '@nestjs/common';
import { ProtocoloSolicitacaoDto } from '../solicitacao/dto/create-solicitacao-response.dto';

type ConfirmacaoSolicitacaoPayload = {
  email: string;
  nomeUsuario: string;
  solicitacaoId: number;
  protocolo: ProtocoloSolicitacaoDto;
};

@Injectable()
export class NotificacaoService {
  private readonly logger = new Logger(NotificacaoService.name);

  async enviarConfirmacaoSolicitacao(
    payload: ConfirmacaoSolicitacaoPayload,
  ): Promise<void> {
    const assunto = `Confirmacao da solicitacao #${payload.solicitacaoId}`;
    const conteudo = [
      `Ola, ${payload.nomeUsuario}!`,
      `Sua solicitacao foi registrada com sucesso.`,
      `Servico: ${payload.protocolo.servico.nome}`,
      `Valor base: ${payload.protocolo.servico.valor_base ?? 'Nao informado'}`,
      `Data da solicitacao: ${payload.protocolo.solicitacao.data_solicitacao}`,
      `Prazo estimado: ${payload.protocolo.solicitacao.prazo_estimado}`,
    ].join(' ');

    this.logger.log(
      `Email de confirmacao da solicitacao ${payload.solicitacaoId} preparado para ${payload.email}. Assunto: ${assunto}. Conteudo: ${conteudo}`,
    );
    return Promise.resolve();
  }
}
