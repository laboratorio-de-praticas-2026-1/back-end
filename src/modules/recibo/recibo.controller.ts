import { Body, Controller, Post, Res, StreamableFile } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { CreateReciboDto } from './dto/create-recibo.dto';
import { ReciboService } from './recibo.service';

@ApiTags('recibo')
@Controller('recibo')
export class ReciboController {
  constructor(private readonly reciboService: ReciboService) {}

  @ApiOperation({
    summary: 'Gerar recibo para uma solicitação',
    description: 'Gera um recibo em PDF para a solicitação especificada.',
  })
  @Post('generate')
  create(@Body() createReciboDto: CreateReciboDto) {
    return this.reciboService.create(createReciboDto);
  }

  @ApiOperation({
    summary: 'Visualizar e baixar recibo (Uso interno)',
    description:
      'Visualiza e baixa o recibo gerado para a solicitação especificada.',
  })
  @Post('preview/download')
  async previewDownload(
    @Body() createReciboDto: CreateReciboDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const pdfBuffer = await this.reciboService.previewDownload(createReciboDto);
    const filename = `recibo-solicitacao.pdf`;

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    return new StreamableFile(pdfBuffer, {
      type: 'application/pdf',
      length: pdfBuffer.length,
    });
  }
}
