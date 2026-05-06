export class EmailParams {
  to: string;
  template: string;
  assunto: string;
  withHeader?: boolean;
  dados: Record<string, unknown>;

  constructor(
    to: string,
    template: string,
    assunto: string,
    dados: Record<string, unknown>,
    withHeader?: boolean,
  ) {
    this.to = to;
    this.template = template;
    this.assunto = assunto;
    this.dados = dados;
    this.withHeader = withHeader ?? true;
  }
}
