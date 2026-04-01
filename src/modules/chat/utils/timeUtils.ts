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

  if (hora >= 8 && hora < 18) return { ok: true };

  return {
    ok: false,
    message: 'Atendimento disponível das 08h às 18h',
  };
}
