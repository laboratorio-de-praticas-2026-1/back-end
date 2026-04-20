import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Formatters } from 'src/commons/utils/formatters';
import { COAT_RIGHT_B64, LOGO_ESCURA_B64 } from '../reports/templates/template-assets';
import { ReciboQueries } from './queries/recibo.queries';
import {
  ReciboPdfGeneratorService,
  ReciboTemplateData,
} from './recibo-pdf-generator.service';

@Injectable()
export class ReciboService {
  constructor(
    private readonly reciboQueries: ReciboQueries,
    private readonly reciboPdfGeneratorService: ReciboPdfGeneratorService,
    private readonly formatters: Formatters,
  ) {}

  async gerarReciboPdf(id: number): Promise<Buffer> {
    const solicitacao = await this.reciboQueries.getValoresRecibo(id);

    if (!solicitacao) {
      throw new NotFoundException('Solicitacao nao encontrada.');
    }

    const pagamento =
      solicitacao.debitoSolicitacao?.debito?.pagamento ?? null;

    if (!pagamento) {
      throw new BadRequestException(
        'A solicitacao informada nao possui pagamento registrado.',
      );
    }

    const agora = new Date();
    const templateData: ReciboTemplateData = {
      logoGrupoBortone: COAT_RIGHT_B64,
      logoBrtn: LOGO_ESCURA_B64,
      tipoDocumento: this.getTipoDocumento(solicitacao.debitoSolicitacao?.debito?.tipo),
      nomeCliente: solicitacao.usuario?.nome ?? '-',
      cpfCliente: solicitacao.usuario?.cpfCnpj ?? '-',
      emailCliente: solicitacao.usuario?.email ?? '-',
      celularCliente: solicitacao.usuario?.celular ?? '-',
      placa: solicitacao.veiculo?.placa ?? '-',
      renavam: solicitacao.veiculo?.renavam ?? '-',
      marca: solicitacao.veiculo?.marca ?? '-',
      modelo: solicitacao.veiculo?.modelo ?? '-',
      anoFabricacao: this.toText(solicitacao.veiculo?.anoFabricacao),
      anoModelo: this.toText(solicitacao.veiculo?.anoModelo),
      nomeServico: solicitacao.servico?.nome ?? '-',
      dataInicio: this.formatters.fmtDate(solicitacao.dataSolicitacao),
      dataPagamento: this.formatters.fmtDate(pagamento.createdAt),
      tipoPagamento: this.getTipoPagamentoLabel(
        pagamento.tipoPagamento,
        pagamento.metodoPagamento,
      ),
      numeroParcelas: this.toText(pagamento.qtdParcelas ?? 1),
      valorJuros: this.formatters.fmtBRL(this.toNumber(pagamento.taxa)),
      valorPago: this.formatters.fmtBRL(this.toNumber(pagamento.valorTotal)),
      dataAtual: this.formatters.fmtDate(agora),
      horaAtual: agora.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    return this.reciboPdfGeneratorService.generate(templateData);
  }

  private getTipoDocumento(tipo: string | undefined): string {
    if (tipo === 'veiculo') {
      return 'Recibo de veiculo';
    }

    if (tipo === 'servico') {
      return 'Recibo de servico';
    }

    return 'Recibo de pagamento';
  }

  private getTipoPagamentoLabel(
    tipoPagamento: 'avista' | 'parcelado',
    metodoPagamento: string,
  ): string {
    const tipo = tipoPagamento === 'parcelado' ? 'Parcelado' : 'A vista';
    return metodoPagamento ? `${tipo} - ${metodoPagamento}` : tipo;
  }

  private toNumber(value: number | string | null | undefined): number {
    if (typeof value === 'number') {
      return value;
    }

    if (!value) {
      return 0;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private toText(value: string | number | null | undefined): string {
    return value === null || value === undefined || value === ''
      ? '-'
      : String(value);
  }
}
