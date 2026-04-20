import { readFileSync } from 'fs';
import { join } from 'path';
import ejs, { TemplateFunction } from 'ejs';

export class ReciboTemplateRendererService {
  private static getCompiled(templateFile: string): TemplateFunction {
    const templatePath = join(__dirname, 'templates', templateFile);
    const content = readFileSync(templatePath, 'utf8');

    return ejs.compile(content, {
      cache: true,
      filename: templatePath,
    });
  }

  static render(
    templateFile: string,
    context: Record<string, unknown>,
  ): string {
    return this.getCompiled(templateFile)(context);
  }
}
