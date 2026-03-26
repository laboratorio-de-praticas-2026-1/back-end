/* eslint-disable prettier/prettier */
import { Controller, Get, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { FaqService } from './faq.service';

@Controller('faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  // GET /faq
  @Get()
  async getFaqs() {
    return this.faqService.getFaqs();
  }

  // GET /faq/admin
  @Get('admin')
  async getAllFaqsAdmin() {
    return this.faqService.getFaqs();
  }

  // GET /faq/:id
  @Get(':id')
  async getFaqById(@Param('id', ParseIntPipe) id: number) {
    return this.faqService.getFaqById(id);
  }

  // DELETE /faq/admin/:id
  @Delete('admin/:id')
  async deleteFaq(@Param('id', ParseIntPipe) id: number) {
    await this.faqService.deleteFaq(id);

    return {
      message: 'FAQ deletada com sucesso',
    };
  }
}