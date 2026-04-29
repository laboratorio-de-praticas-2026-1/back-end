import {
  Controller,
  Get,
  Delete,
  Param,
  ParseIntPipe,
  Post,
  Body,
  Patch,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiTags,
} from '@nestjs/swagger';
import { FaqService } from './faq.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';

@ApiTags('FAQ')
@Controller('faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @ApiOperation({
    summary: 'Listar FAQs públicas',
    description:
      'Retorna todas as FAQs com status ativo visíveis aos usuários.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de FAQs retornada com sucesso.',
  })
  @Get()
  getFaqs() {
    return this.faqService.getFaqs();
  }

  @ApiOperation({
    summary: 'Listar todas as FAQs (admin)',
    description:
      'Retorna todas as FAQs incluindo as inativas. Restrito a administradores.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista completa de FAQs retornada com sucesso.',
  })
  @Get('admin')
  getAllFaqsAdmin() {
    return this.faqService.getAllFaqsAdmin();
  }

  @ApiOperation({
    summary: 'Listar categorias de FAQ',
    description: 'Retorna todas as categorias disponíveis para FAQs.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de categorias retornada com sucesso.',
  })
  @Get('categorias')
  getCategorias() {
    return this.faqService.getCategorias();
  }

  @ApiOperation({
    summary: 'Obter FAQ por ID',
    description: 'Retorna uma FAQ específica baseada no seu ID.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID da FAQ',
  })
  @ApiResponse({
    status: 200,
    description: 'FAQ retornada com sucesso.',
  })
  @ApiResponse({
    status: 404,
    description: 'FAQ não encontrada.',
  })
  @Get(':id')
  getFaqById(@Param('id', ParseIntPipe) id: number) {
    return this.faqService.getFaqById(id);
  }

  @ApiOperation({
    summary: 'Criar nova FAQ',
    description:
      'Cria uma nova FAQ com pergunta, resposta e categoria. Restrito a administradores.',
  })
  @ApiBody({
    type: CreateFaqDto,
    description: 'Dados da FAQ a ser criada',
  })
  @ApiResponse({
    status: 201,
    description: 'FAQ criada com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos fornecidos.',
  })
  @Post('admin')
  createFaq(@Body() dto: CreateFaqDto) {
    return this.faqService.createFaq(dto);
  }

  @ApiOperation({
    summary: 'Atualizar FAQ',
    description: 'Atualiza uma FAQ existente. Restrito a administradores.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID da FAQ a ser atualizada',
  })
  @ApiBody({
    type: UpdateFaqDto,
    description: 'Dados a serem atualizados',
  })
  @ApiResponse({
    status: 200,
    description: 'FAQ atualizada com sucesso.',
  })
  @ApiResponse({
    status: 404,
    description: 'FAQ não encontrada.',
  })
  @Patch('admin/:id')
  updateFaq(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFaqDto) {
    return this.faqService.updateFaq(id, dto);
  }

  @ApiOperation({
    summary: 'Deletar FAQ',
    description: 'Remove uma FAQ do sistema. Restrito a administradores.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID da FAQ a ser deletada',
  })
  @ApiResponse({
    status: 200,
    description: 'FAQ deletada com sucesso.',
  })
  @ApiResponse({
    status: 404,
    description: 'FAQ não encontrada.',
  })
  @Delete('admin/:id')
  async deleteFaq(@Param('id', ParseIntPipe) id: number) {
    await this.faqService.deleteFaq(id);

    return {
      message: 'FAQ deletada com sucesso',
    };
  }
}
