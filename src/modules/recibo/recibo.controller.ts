import {
  Body,
  Controller,
  Post,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../usuario/guards/jwt-auth.guard';
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Body() createReciboDto: CreateReciboDto) {
    return this.reciboService.create(createReciboDto);
  }

  @ApiOperation({
    summary: 'Visualizar e baixar recibo (Uso interno)',
    description:
      'Visualiza e baixa o recibo gerado para a solicitação especificada.',
  })
  @Post('preview/download')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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
