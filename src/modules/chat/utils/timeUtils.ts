// Função auxiliar para verificar horário comercial
export function dentroHorario(): true | string {
  const hora = new Date().getHours();

  if (hora >= 8 && hora < 18) return true;

  return 'Atendimento disponível das 08h às 18h';
}