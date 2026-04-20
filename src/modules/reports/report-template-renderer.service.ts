import { readFileSync } from 'fs';
import { join } from 'path';
import ejs, { TemplateFunction } from 'ejs';

export class ReportTemplateRendererService {
  private static getCompiled(templateFile: string): TemplateFunction {
    const templatePath = join(__dirname, 'templates', templateFile);
    const content = readFileSync(templatePath, 'utf8');
    const compiled = ejs.compile(content, {
      cache: true,
      filename: templatePath,
    });

    return compiled;
  }

  static render(
    templateFile: string,
    context: Record<string, unknown>,
  ): string {
    return this.getCompiled(templateFile)(context);
  }
}
