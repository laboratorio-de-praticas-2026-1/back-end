import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiProduces, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { ReciboService } from './recibo.service';

@ApiTags('Recibo')
@Controller('recibo')
export class ReciboController {
  constructor(private readonly reciboService: ReciboService) {}

  @Get(':id/pdf')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Gerar recibo em PDF',
    description:
      'Busca os dados da solicitacao, monta o HTML do recibo e retorna o PDF em streaming.',
  })
  @ApiProduces('application/pdf')
  @ApiOkResponse({ description: 'Recibo PDF gerado com sucesso.' })
  async gerarPdf(
    @Param('id', ParseIntPipe) id: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    const pdfBuffer = await this.reciboService.gerarReciboPdf(id);
    const filename = `recibo-solicitacao-${id}.pdf`;

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    return new StreamableFile(pdfBuffer, {
      type: 'application/pdf',
      length: pdfBuffer.length,
    });
  }
}
