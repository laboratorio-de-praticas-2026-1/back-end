import { StatusSolicitacaoEnum } from 'src/commons/enums/status-solicitacao.enum';

export interface StatusEmailTextos {
  titulo: string;
  mensagem: string;
  assunto: string;
}

const STATUS_EMAIL_MAP: Record<string, StatusEmailTextos> = {
  [StatusSolicitacaoEnum.AGUARDANDO_PAGAMENTO]: {
    titulo: 'Aguardando Pagamento',
    mensagem:
      'foi atualizada para o status <b>Aguardando Pagamento</b>. Por favor, realize o pagamento para que possamos dar continuidade ao seu atendimento.',
    assunto: 'Sua solicitação está aguardando pagamento',
  },
  [StatusSolicitacaoEnum.AGUARDANDO_DOCUMENTO]: {
    titulo: 'Aguardando Documento',
    mensagem:
      'foi atualizada para o status <b>Aguardando Documento</b>. Solicitamos que envie a documentação necessária para dar continuidade ao processo.',
    assunto: 'Sua solicitação está aguardando documento',
  },
  [StatusSolicitacaoEnum.CONCLUIDO]: {
    titulo: 'Concluída',
    mensagem:
      'foi <b>concluída com sucesso</b>! Agradecemos pela confiança em nossos serviços.',
    assunto: 'Sua solicitação foi concluída',
  },
  [StatusSolicitacaoEnum.CANCELADO]: {
    titulo: 'Cancelada',
    mensagem: 'foi <b>cancelada</b>.',
    assunto: 'Sua solicitação foi cancelada',
  },
};

const REABERTURA_TEXTOS: StatusEmailTextos = {
  titulo: 'Reaberta',
  mensagem:
    'foi <b>reaberta</b> e está novamente em andamento. Acompanhe o andamento da sua solicitação.',
  assunto: 'Sua solicitação foi reaberta',
};

export function obterTextosEmailPorStatus(
  novoStatus: StatusSolicitacaoEnum,
  isReabertura: boolean,
): StatusEmailTextos | null {
  if (isReabertura) {
    return REABERTURA_TEXTOS;
  }

  return STATUS_EMAIL_MAP[novoStatus] ?? null;
}
