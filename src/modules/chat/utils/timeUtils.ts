// Função auxiliar para verificar horário comercial
export function dentroHorario(): { ok: boolean; message?: string } {
  const now = new Date();

  const hora = parseInt(
    now.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      hour12: false,
    }),
  );

  // Horário comercial (08h às 18h)
  if (hora >= 8 && hora < 18) {
    return { ok: true };
  }

  // Define saudação baseada no horário
  let saudacao = '';

  if (hora >= 5 && hora < 12) {
    saudacao = 'Bom dia';
  } else if (hora >= 12 && hora < 18) {
    saudacao = 'Boa tarde';
  } else {
    saudacao = 'Boa noite';
  }

  return {
    ok: false,
    message: `${saudacao}, no momento não temos atendente disponível. Nosso horário é das 08h às 18h.`,
  };
}
