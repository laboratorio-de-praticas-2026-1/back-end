// Função auxiliar para verificar horário comercial
export function dentroHorario(): boolean {
  const hora = new Date().getHours();
  return hora >= 8 && hora < 18;
}
