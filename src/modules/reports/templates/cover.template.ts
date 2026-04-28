import { Formatters } from 'src/commons/utils/formatters';
import { ReportTemplateRendererService } from '../report-template-renderer.service';
import {
  WAVE_TOP_B64,
  WAVE_BOT_B64,
  COAT_LEFT_B64,
  COAT_RIGHT_B64,
  LOGO_ESCURA_B64,
} from './template-assets';

const formatters = new Formatters();

export function coverPage(
  nome: string,
  descricao: string | undefined,
  categoria: string,
  periodoInicio: Date,
  periodoFim: Date,
  dataGeracao: Date,
  companyName = 'Despachante Bortone',
): string {
  return ReportTemplateRendererService.render('cover.ejs', {
    nome,
    descricao,
    categoria,
    periodoInicio,
    periodoFim,
    dataGeracao,
    companyName,
    fmtDate: (date: Date | string | null | undefined) =>
      formatters.fmtDate(date),
    WAVE_TOP_B64,
    WAVE_BOT_B64,
    COAT_LEFT_B64,
    COAT_RIGHT_B64,
    LOGO_ESCURA_B64,
  });
}

export function summaryPage(
  sections: string[],
  logoBase64: string,
  companyName = 'Despachante Bortone',
): string {
  return ReportTemplateRendererService.render('summary.ejs', {
    sections,
    logoBase64,
    companyName,
    LOGO_ESCURA_B64,
  });
}
