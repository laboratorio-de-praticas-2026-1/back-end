import { StatusSolicitacaoEnum } from 'src/commons/enums/status-solicitacao.enum';

export interface StatusEmailTextos {
  titulo: string;
  mensagem: string;
  assunto: string;
  cor: string;
}

const STATUS_EMAIL_MAP: Record<string, StatusEmailTextos> = {
  [StatusSolicitacaoEnum.AGUARDANDO_PAGAMENTO]: {
    titulo: 'Aguardando Pagamento',
    mensagem:
      'Sua solicitação foi atualizada e está aguardando o pagamento. Por favor, realize o pagamento para que possamos dar continuidade ao seu atendimento.',
    assunto: 'Sua solicitação está aguardando pagamento',
    cor: '#F59E0B',
  },
  [StatusSolicitacaoEnum.AGUARDANDO_DOCUMENTO]: {
    titulo: 'Aguardando Documento',
    mensagem:
      'Precisamos de documentação adicional para dar continuidade ao processo. Por favor, envie os documentos solicitados pela sua área do cliente.',
    assunto: 'Sua solicitação está aguardando documento',
    cor: '#F59E0B',
  },
  [StatusSolicitacaoEnum.CONCLUIDO]: {
    titulo: 'Concluído',
    mensagem:
      'Sua solicitação foi concluída com sucesso em nosso sistema. Nenhuma ação adicional é necessária. Agradecemos pela confiança em nossos serviços.',
    assunto: 'Sua solicitação foi concluída',
    cor: '#16A34A',
  },
  [StatusSolicitacaoEnum.CANCELADO]: {
    titulo: 'Cancelado',
    mensagem:
      'Sua solicitação foi cancelada. Caso tenha dúvidas sobre o cancelamento, entre em contato com nossa equipe.',
    assunto: 'Sua solicitação foi cancelada',
    cor: '#DC2626',
  },
};

const REABERTURA_TEXTOS: StatusEmailTextos = {
  titulo: 'Reaberta',
  mensagem:
    'Sua solicitação foi reaberta e está novamente em andamento. Acompanhe o progresso pela sua área do cliente.',
  assunto: 'Sua solicitação foi reaberta',
  cor: '#2563EB',
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
