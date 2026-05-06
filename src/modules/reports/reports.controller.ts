import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { Relatorio } from 'src/models/relatorio.model';
import { JwtAuthGuard } from '../usuario/guards/jwt-auth.guard';
import { RolesGuard } from '../usuario/guards/roles.guard';
import { Roles } from '../usuario/decorators/roles.decorator';
import { RelatorioCategoriaResponseDto } from './dto/categoria-response.dto';
import { CreateReportDto } from './dto/create-report.dto';
import { ResponseReportDto } from './dto/response-report.dto';
import { PdfGeneratorService } from './pdf-generator.service';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly pdfGeneratorService: PdfGeneratorService,
  ) {}

  @Get('categorias')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('administrador')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Retorna as categorias de relatórios disponíveis',
    description:
      'Fornece uma lista de categorias de relatórios, cada uma com um nome amigável e um valor identificador.',
  })
  @ApiOkResponse({
    description: 'Lista de categorias de relatórios retornada com sucesso',
    type: [RelatorioCategoriaResponseDto],
  })
  getCategorias(): RelatorioCategoriaResponseDto[] {
    return this.reportsService.getCategorias();
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('administrador')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar relatórios',
    description:
      'Retorna todos os relatórios cadastrados com URL temporária gerada a partir do hash.',
  })
  @ApiOkResponse({
    description: 'Lista de relatórios retornada com sucesso',
    type: [ResponseReportDto],
  })
  listarRelatorios(): Promise<ResponseReportDto[]> {
    return this.reportsService.listarRelatorios();
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('administrador')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir relatório por id' })
  @ApiNoContentResponse({ description: 'Relatório excluído com sucesso' })
  deleteById(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.reportsService.deleteById(id);
  }

  @Post('generate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('administrador')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Gerar Relatório PDF e salvar no Cloudinary',
    description:
      'Gera o PDF completo, sobe no Cloudinary e retorna URL temporária + registro salvo.',
  })
  @ApiCreatedResponse({
    description:
      'Relatório gerado e salvo. Retorna dados do registro + URL temporária.',
    type: Relatorio,
  })
  generateReport(@Body() createReportDto: CreateReportDto) {
    return this.reportsService.generateReport(createReportDto);
  }

  //endpoint alternativo antes de ir para o Cloudinary. Visualizar antes de confirmar o salvamento.
  @Post('preview')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('administrador')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Pré-visualizar Relatório PDF (streaming direto)',
    description:
      'Gera o PDF e retorna diretamente o arquivo como application/pdf. Não salva no banco.',
  })
  @ApiProduces('application/pdf')
  @ApiOkResponse({ description: 'PDF retornado diretamente como stream.' })
  async previewReport(
    @Body() createReportDto: CreateReportDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const pdfBuffer = await this.pdfGeneratorService.generate(createReportDto);

    const filename = encodeURIComponent(
      createReportDto.nome.replace(/\s+/g, '_') + '.pdf',
    );

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    return new StreamableFile(pdfBuffer, {
      type: 'application/pdf',
      length: pdfBuffer.length,
    });
  }
}
