import { readFileSync } from 'fs';
import { join } from 'path';
import ejs, { TemplateFunction } from 'ejs';

export class ReportTemplateRendererService {
  private static templateCache = new Map<string, TemplateFunction>();

  private static getCompiled(templateFile: string): TemplateFunction {
    const templatePath = join(__dirname, 'templates', templateFile);

    if (this.templateCache.has(templatePath)) {
      return this.templateCache.get(templatePath)!;
    }

    const content = readFileSync(templatePath, 'utf8');

    const compiled = ejs.compile(content, {
      cache: true,
      filename: templatePath,
    });

    this.templateCache.set(templatePath, compiled);

    return compiled;
  }

  static render(
    templateFile: string,
    context: Record<string, unknown>,
  ): string {
    return this.getCompiled(templateFile)(context);
  }
}
