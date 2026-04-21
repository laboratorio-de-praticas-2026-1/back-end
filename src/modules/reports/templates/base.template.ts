import { Formatters } from 'src/commons/utils/formatters';
import { LOGO_ESCURA_B64 } from './template-assets';

export { LOGO_ESCURA_B64 };

const formatters = new Formatters();

export function pageShell(
  title: string,
  subtitle: string,
  content: string,
  logoBase64: string,
  companyName = 'Despachante Bortone',
  pageNumber?: number,
): string {
  const pageNum =
    pageNumber !== undefined
      ? `<span class="page-num">${pageNumber}</span>`
      : '';

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
    width:794px;
    background:#fff;
    position:relative;
  }

  /* ── Header ── */
  .page-header{
    position:fixed;
    top:0;
    left:0;
    right:0;
    z-index:10;
    display:flex;
    align-items:flex-start;
    justify-content:space-between;
    height:78px;
    padding:20px 40px 0;
    background:#fff;
  }
  .page-header .logo{height:52px;object-fit:contain;}
  .page-header .hd-right{font-size:10px;color:#888;text-align:right;padding-top:6px;}

  /* ── Title block ── */
  .page-title-block{
    margin-top:78px;
    padding:18px 40px 6px;
  }
  .page-title-block h1{
    font-size:28px;font-weight:800;color:#0D2040;line-height:1.2;
  }
  .page-title-block h2{
    font-size:13px;color:#666;margin-top:5px;font-weight:400;
  }

  /* ── Content ── */
  .content{
    padding:8px 40px 58px;
  }

  /* ── Footer ── */
  .page-footer{
    position:fixed;
    left:0;
    right:0;
    bottom:0;
    z-index:10;
    display:flex;
    justify-content:space-between;
    align-items:center;
    padding:8px 40px;
    border-top:1px solid #E8EEF4;
    font-size:10px;
    color:#999;
    background:#fff;
  }
  .page-num{
    background:#0D2040;color:#fff;
    border-radius:50%;width:20px;height:20px;
    display:inline-flex;align-items:center;justify-content:center;
    font-size:10px;font-weight:700;
  }

  /* ── Section labels ── */
  .section-label{
    font-size:14px;font-weight:700;color:#0D2040;
    margin:20px 0 10px;
  }

  /* ── KPI cards ── */
  .kpi-row{display:flex;gap:12px;flex-wrap:wrap;margin:8px 0 18px;}
  .kpi-card{
    flex:1;min-width:140px;
    background:#0D2040;
    border:1px solid #21406A;
    border-radius:8px;
    box-shadow:0 2px 6px rgba(13,32,64,.16);
    padding:14px 18px;
    color:#fff;
    display:flex;
    flex-direction:column;
    min-height:84px;
  }
  .kpi-card .kpi-label{font-size:10px;color:#EEF7FF;font-weight:700;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px;line-height:1.2;min-height:24px;text-shadow:0 1px 1px rgba(0,0,0,.22);}
  .kpi-card .kpi-value{font-size:18px;font-weight:700;color:#F7FBFF;line-height:1;margin-top:auto;text-shadow:0 1px 1px rgba(0,0,0,.18);}

  /* ── Tables ── */
  table{
    width:100%;
    table-layout:fixed;
    border-collapse:collapse;
    font-size:11px;
    margin-top:4px;
    page-break-inside:auto;
    break-inside:auto;
  }
  thead{display:table-header-group;}
  tfoot{display:table-footer-group;}
  thead tr{background:#0D2040;color:#fff;}
  thead th{
    padding:8px 10px;
    text-align:left;
    font-weight:600;
    letter-spacing:.3px;
    white-space:nowrap;
    overflow:hidden;
    text-overflow:ellipsis;
  }
  tbody tr:nth-child(even){background:#F4F7FB;}
  tbody td{
    padding:7px 10px;
    border-bottom:1px solid #E8EEF4;
    vertical-align:top;
    color:#333;
    white-space:nowrap;
    overflow:hidden;
    text-overflow:ellipsis;
    line-height:1.2;
  }

  tr{
    page-break-inside:avoid;
    break-inside:avoid;
  }

  /* ── Badges ── */
  .badge{display:inline-block;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:600;}
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
  .ok-icon{color:#1A5E2E;font-weight:700;}
  .nok-icon{color:#C0392B;font-weight:700;}

  /* ── Charts ── */
  .chart-wrap{display:flex;align-items:flex-start;gap:12px;margin:8px 0 16px;}
  .chart-wrap img{max-width:100%;height:auto;}

  .page-break{page-break-after:always;}
</style>
</head>
<body>
  <div class="page-header">
    <img class="logo" src="${LOGO_ESCURA_B64}" alt="BRTN"/>
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
    <span>${companyName}</span>
    ${pageNum}
  </div>
</body>
</html>`;
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

export function fmtBRL(value: number): string {
  return formatters.fmtBRL(value);
}

export function fmtDate(date: Date | string | null | undefined): string {
  return formatters.fmtDate(date);
}
