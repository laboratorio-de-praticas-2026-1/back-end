export class EmailParams {
  to: string;
  template: string;
  assunto: string;
  withHeader?: boolean;
  dados: Record<string, object>;

  constructor(
    to: string,
    template: string,
    assunto: string,
    dados: Record<string, any>,
    withHeader?: boolean,
  ) {
    this.to = to;
    this.template = template;
    this.assunto = assunto;
    this.dados = dados;
    this.withHeader = withHeader ?? true;
  }
}
