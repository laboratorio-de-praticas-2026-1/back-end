export function pageShell(
  title: string,
  subtitle: string,
  content: string,
  logoBase64: string,
  companyName = 'dados da empresa',
): string {
  return /* html */ `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  @page{size:A4 portrait;margin:0;}
  body{
    font-family:'Inter',Arial,sans-serif;
    color:#1A1A1A;
    width:794px;          /* A4 @ 96dpi */
    min-height:1123px;
    background:#fff;
    display:flex;
    flex-direction:column;
  }

  .page-header{
    background:#1B2B4B;
    color:#fff;
    display:flex;
    align-items:center;
    justify-content:space-between;
    padding:18px 32px 12px;
    flex-shrink:0;
  }
  .page-header .logo{height:46px;object-fit:contain;}
  .page-header .hd-right{text-align:right;font-size:11px;opacity:.75;}
  .page-title-block{
    text-align:center;
    padding:32px 32px 12px;
  }
  .page-title-block h1{font-size:28px;font-weight:700;color:#1B2B4B;}
  .page-title-block h2{font-size:15px;color:#555;margin-top:4px;font-weight:400;}

  .content{
    flex:1;
    padding:12px 40px 24px;
  }

  .page-footer{
    background:#1B2B4B;
    color:#fff;
    display:flex;
    justify-content:space-between;
    padding:10px 32px;
    font-size:11px;
    flex-shrink:0;
  }

  .section-label{
    font-size:13px;font-weight:700;color:#1B2B4B;
    border-left:4px solid #2D7D46;
    padding-left:10px;
    margin:22px 0 10px;
  }

  .kpi-row{display:flex;gap:16px;flex-wrap:wrap;margin:8px 0 18px;}
  .kpi-card{
    flex:1;min-width:150px;
    background:#F7F9FC;
    border:1px solid #E0E7EF;
    border-radius:10px;
    padding:14px 18px;
  }
  .kpi-card .kpi-label{font-size:11px;color:#666;margin-bottom:4px;}
  .kpi-card .kpi-value{font-size:20px;font-weight:700;color:#1B2B4B;}

  table{
    width:100%;
    border-collapse:collapse;
    font-size:11px;
    margin-top:4px;
  }
  thead tr{background:#1B2B4B;color:#fff;}
  thead th{
    padding:8px 10px;
    text-align:left;
    font-weight:600;
    letter-spacing:.3px;
  }
  tbody tr:nth-child(even){background:#F4F6FA;}
  tbody td{padding:7px 10px;border-bottom:1px solid #E8EDF3;vertical-align:top;}
  .badge{
    display:inline-block;
    padding:2px 8px;
    border-radius:20px;
    font-size:10px;
    font-weight:600;
  }
  .badge-pago{background:#D4EDDA;color:#1A5E2E;}
  .badge-pendente{background:#FFF3CD;color:#856404;}
  .badge-atrasado{background:#F8D7DA;color:#842029;}
  .badge-aprovado{background:#D4EDDA;color:#1A5E2E;}
  .badge-rejeitado{background:#F8D7DA;color:#842029;}
  .badge-concluido{background:#D4EDDA;color:#1A5E2E;}
  .badge-cancelado{background:#E2E3E5;color:#41464b;}
  .badge-recebido{background:#CCE5FF;color:#004085;}
  .badge-em_andamento{background:#D1ECF1;color:#0C5460;}
  .badge-aguardando_pagamento{background:#FFF3CD;color:#856404;}
  .badge-aguardando_documento{background:#FDE2A3;color:#7D4900;}
  .badge-ativo{background:#CCE5FF;color:#004085;}
  .ok-icon{color:#2D7D46;font-weight:700;}
  .nok-icon{color:#C0392B;font-weight:700;}

  .chart-wrap{
    display:flex;
    align-items:flex-start;
    gap:12px;
    margin:8px 0 16px;
  }
  .chart-wrap img{max-width:100%;height:auto;}

  .page-break{page-break-after:always;}
</style>
</head>
<body>
  <div class="page-header">
    <img class="logo" src="${logoBase64}" alt="BRTN"/>
    <div class="hd-right">${companyName}</div>
  </div>

  <div class="page-title-block">
    <h1>${title}</h1>
    <h2>${subtitle}</h2>
  </div>

  <div class="content">
    ${content}
  </div>

  <div class="page-footer">
    <span>Roda pe</span>
    <span>${companyName}</span>
  </div>
</body>
</html>`;
}

export function fmtBRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function fmtDate(date: Date | string | null | undefined): string {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('pt-BR');
}

export function badge(status: string): string {
  const cls = `badge badge-${status.replace(/ /g, '_').toLowerCase()}`;
  const labels: Record<string, string> = {
    pago: 'Pago',
    pendente: 'Pendente',
    atrasado: 'Atrasado',
    aprovado: 'Aprovado',
    rejeitado: 'Rejeitado',
    concluido: 'Concluído',
    cancelado: 'Cancelado',
    recebido: 'Recebido',
    em_andamento: 'Em andamento',
    aguardando_pagamento: 'Ag. Pagamento',
    aguardando_documento: 'Ag. Documento',
    ativo: 'Ativo',
  };
  return `<span class="${cls}">${labels[status] ?? status}</span>`;
}
