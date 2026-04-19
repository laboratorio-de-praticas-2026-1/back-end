import { fmtDate } from './base.template';
import { WAVE_TOP_B64, WAVE_BOT_B64, COAT_LEFT_B64, COAT_RIGHT_B64, LOGO_ESCURA_B64 } from './template-assets';

export function coverPage(
  nome: string,
  descricao: string | undefined,
  categoria: string,
  periodoInicio: Date,
  periodoFim: Date,
  logoBase64: string,
  dataGeracao: Date,
  companyName = 'Despachante Bortone',
): string {
  return /* html */ `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  html,body{margin:0;padding:0;}
  @page{size:A4 portrait;margin:0;}
  body{
    font-family:'Inter',Arial,sans-serif;
    width:794px;
    height:1123px;
    background:#fff;
    color:#0D2040;
    display:flex;
    flex-direction:column;
    align-items:center;
    position:relative;
    overflow:hidden;
  }

  /* Wave top — gruda nas bordas esquerda/direita */
  .wave-top{
    position:absolute;
    top:0; left:0; right:0;
    width:100%;
    z-index:1;
    line-height:0;
    font-size:0;
  }
  .wave-top img{
    display:block;
    width:100%;
    height:auto;
    vertical-align:bottom;
  }

  /* Wave bottom — gruda nas bordas esquerda/direita */
  .wave-bot{
    position:absolute;
    bottom:0; left:0; right:0;
    width:100%;
    z-index:1;
    line-height:0;
    font-size:0;
  }
  .wave-bot img{
    display:block;
    width:100%;
    height:auto;
    vertical-align:top;
  }

  /* Coat of arms watermarks */
  .coat-left{
    position:absolute;
    left:-50px; top:50%;
    transform:translateY(-50%);
    width:220px; opacity:0.08; z-index:0;
  }
  .coat-right{
    position:absolute;
    right:-50px; top:50%;
    transform:translateY(-50%);
    width:220px; opacity:0.08; z-index:0;
  }

  /* Center content */
  .cover-inner{
    position:relative; z-index:2;
    display:flex; flex-direction:column;
    align-items:center; justify-content:center;
    text-align:center; padding:0 80px;
    width:100%; margin-top:210px; flex:1;
  }
  .cover-inner .brand-logo{
    height:90px; object-fit:contain; margin-bottom:28px;
  }
  .cover-inner .report-title{
    font-size:26px; font-weight:800; color:#0D2040;
    line-height:1.25; margin-bottom:28px;
  }
  .periodo-block{ margin-bottom:16px; }
  .periodo-label{ font-size:13px; color:#555; font-weight:500; margin-bottom:6px; }
  .periodo-valor{ font-size:16px; font-weight:700; color:#0D2040; }
  .emissao{ font-size:12px; color:#888; margin-top:18px; }
</style>
</head>
<body>
  <div class="wave-top"><img src="${WAVE_TOP_B64}" alt="" /></div>
  <div class="wave-bot"><img src="${WAVE_BOT_B64}" alt="" /></div>
  <img class="coat-left" src="${COAT_LEFT_B64}" alt="" />
  <img class="coat-right" src="${COAT_RIGHT_B64}" alt="" />
  <div class="cover-inner">
    <img class="brand-logo" src="${LOGO_ESCURA_B64}" alt="BRTN despachante" />
    <div class="report-title">${nome}</div>
    <div class="periodo-block">
      <div class="periodo-label">Período Analisado</div>
      <div class="periodo-valor">${fmtDate(periodoInicio)} - ${fmtDate(periodoFim)}</div>
    </div>
    <div class="emissao">Data de Emissão: ${fmtDate(dataGeracao)}</div>
  </div>
</body>
</html>`;
}

export function summaryPage(
  sections: string[],
  logoBase64: string,
  companyName = 'Despachante Bortone',
): string {
  const items = sections
    .map((s, i) => `<li><span class="num">${i + 1}.</span> ${s}</li>`)
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
    width:794px; min-height:1123px;
    background:#fff; display:flex; flex-direction:column;
    color:#1A1A1A;
  }
  .page-header{
    display:flex; align-items:flex-start; justify-content:space-between;
    padding:28px 40px 0;
  }
  .page-header img{height:52px;object-fit:contain;}
  .page-header .hd-right{font-size:10px;color:#888;text-align:right;padding-top:6px;}
  .page-title-block{padding:20px 40px 6px;}
  .page-title-block h1{font-size:28px;font-weight:800;color:#0D2040;}
  .content{flex:1;padding:12px 40px 24px;}
  ol{list-style:none;}
  li{
    display:flex; align-items:baseline; gap:14px;
    padding:12px 0; border-bottom:1px solid #EEF1F5;
    font-size:13px; color:#2C3E50;
  }
  li .num{color:#0D2040;font-weight:800;font-size:16px;min-width:24px;}
  .page-footer{
    display:flex; justify-content:space-between; align-items:center;
    padding:10px 40px; border-top:1px solid #E8EEF4;
    font-size:10px; color:#999; margin-top:auto;
  }
  .page-num{
    background:#0D2040;color:#fff;border-radius:50%;
    width:20px;height:20px;display:inline-flex;
    align-items:center;justify-content:center;
    font-size:10px;font-weight:700;
  }
</style>
</head>
<body>
  <div class="page-header">
    <img src="${LOGO_ESCURA_B64}" alt="BRTN"/>
    <div class="hd-right">${companyName}</div>
  </div>
  <div class="page-title-block"><h1>Sumário</h1></div>
  <div class="content"><ol>${items}</ol></div>
  <div class="page-footer">
    <span>${companyName}</span>
    <span class="page-num">1</span>
  </div>
</body>
</html>`;
}
