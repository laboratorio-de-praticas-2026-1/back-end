import { fmtDate } from './base.template';

export function coverPage(
  nome: string,
  descricao: string | undefined,
  categoria: string,
  periodoInicio: Date,
  periodoFim: Date,
  logoBase64: string,
  dataGeracao: Date,
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
    width:794px;
    height:1123px;
    background:#1B2B4B;
    color:#fff;
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    position:relative;
    overflow:hidden;
  }
  .bg-circle{
    position:absolute;
    border-radius:50%;
    background:rgba(255,255,255,.04);
  }
  .bg-circle.c1{width:500px;height:500px;bottom:-140px;right:-120px;}
  .bg-circle.c2{width:300px;height:300px;top:-80px;left:-80px;}
  .cover-inner{
    text-align:center;
    z-index:1;
    padding:60px;
  }
  .cover-inner img{height:72px;margin-bottom:32px;}
  .cover-inner .report-tipo{
    font-size:13px;letter-spacing:2px;text-transform:uppercase;
    color:#8AAFCF;margin-bottom:12px;
  }
  .cover-inner h1{
    font-size:34px;font-weight:800;line-height:1.2;
    margin-bottom:16px;
  }
  .cover-inner .descricao{
    font-size:14px;color:#AEC6D9;
    max-width:500px;margin:0 auto 32px;line-height:1.6;
  }
  .cover-inner .periodo-box{
    background:rgba(255,255,255,.1);
    border:1px solid rgba(255,255,255,.18);
    border-radius:12px;
    padding:16px 32px;
    display:inline-block;
    margin-bottom:20px;
  }
  .cover-inner .periodo-box .label{
    font-size:11px;color:#8AAFCF;letter-spacing:1px;text-transform:uppercase;
    margin-bottom:4px;
  }
  .cover-inner .periodo-box .valor{
    font-size:15px;font-weight:600;
  }
  .cover-footer{
    position:absolute;
    bottom:24px;
    left:0;right:0;
    display:flex;
    justify-content:space-between;
    padding:0 36px;
    font-size:11px;
    color:#8AAFCF;
    z-index:1;
  }
  .green-bar{
    width:60px;height:4px;background:#2D7D46;
    border-radius:4px;margin:0 auto 28px;
  }
</style>
</head>
<body>
  <div class="bg-circle c1"></div>
  <div class="bg-circle c2"></div>

  <div class="cover-inner">
    <img src="${logoBase64}" alt="BRTN" />
    <div class="report-tipo">${categoria}</div>
    <div class="green-bar"></div>
    <h1>${nome}</h1>
    ${descricao ? `<p class="descricao">${descricao}</p>` : ''}
    <div class="periodo-box">
      <div class="label">Período Analisado</div>
      <div class="valor">${fmtDate(periodoInicio)} — ${fmtDate(periodoFim)}</div>
    </div>
  </div>

  <div class="cover-footer">
    <span>${companyName}</span>
    <span>Data de Emissão: ${fmtDate(dataGeracao)}</span>
  </div>
</body>
</html>`;
}

export function summaryPage(
  sections: string[],
  logoBase64: string,
  companyName = 'dados da empresa',
): string {
  const items = sections
    .map((s, i) => `<li><span>${i + 1}.</span> ${s}</li>`)
    .join('');

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
    width:794px;min-height:1123px;
    background:#fff;display:flex;flex-direction:column;
  }
  .page-header{
    background:#1B2B4B;color:#fff;display:flex;
    align-items:center;justify-content:space-between;
    padding:18px 32px 12px;
  }
  .page-header img{height:46px;object-fit:contain;}
  .page-header .hd-right{font-size:11px;opacity:.75;}
  .page-title-block{text-align:center;padding:32px 32px 20px;}
  .page-title-block h1{font-size:28px;font-weight:700;color:#1B2B4B;}
  .content{flex:1;padding:20px 60px;}
  ol{list-style:none;counter-reset:none;}
  li{
    display:flex;align-items:baseline;gap:12px;
    padding:10px 0;border-bottom:1px solid #EEF1F5;
    font-size:13px;color:#2C3E50;
  }
  li span{color:#2D7D46;font-weight:700;font-size:15px;min-width:24px;}
  .page-footer{
    background:#1B2B4B;color:#fff;display:flex;
    justify-content:space-between;padding:10px 32px;font-size:11px;
  }
</style>
</head>
<body>
  <div class="page-header">
    <img src="${logoBase64}" alt="BRTN"/>
    <div class="hd-right">${companyName}</div>
  </div>
  <div class="page-title-block">
    <h1>Sumário</h1>
  </div>
  <div class="content">
    <ol>${items}</ol>
  </div>
  <div class="page-footer">
    <span>Roda pe</span>
    <span>${companyName}</span>
  </div>
</body>
</html>`;
}
