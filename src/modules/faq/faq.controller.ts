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
import { FaqService } from './faq.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';

@Controller('faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Get()
  getFaqs() {
    return this.faqService.getFaqs();
  }

  @Get('admin')
  getAllFaqsAdmin() {
    return this.faqService.getAllFaqsAdmin();
  }

  @Get('categorias')
  getCategorias() {
    return this.faqService.getCategorias();
  }

  @Get(':id')
  getFaqById(@Param('id', ParseIntPipe) id: number) {
    return this.faqService.getFaqById(id);
  }

  @Post('admin')
  createFaq(@Body() dto: CreateFaqDto) {
    return this.faqService.createFaq(dto);
  }

  @Patch('admin/:id')
  updateFaq(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFaqDto,
  ) {
    return this.faqService.updateFaq(id, dto);
  }

  @Delete('admin/:id')
  async deleteFaq(@Param('id', ParseIntPipe) id: number) {
    await this.faqService.deleteFaq(id);

    return {
      message: 'FAQ deletada com sucesso',
    };
  }
}