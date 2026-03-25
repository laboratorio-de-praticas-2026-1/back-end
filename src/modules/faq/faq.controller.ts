import {
  Controller,
  Get,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { FaqService } from './faq.service';

@Controller('faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  // 🔹 GET /faq → apenas FAQs ativas
  @Get()
  async getPublicFaqs() {
    const faqs = await this.faqService.getFaqs();

    return faqs.filter((faq) => faq.status === true);
  }

  // 🔹 GET /faq/:id
  @Get(':id')
  async getFaqById(@Param('id', ParseIntPipe) id: number) {
    return this.faqService.getFaqById(id);
  }

  // 🔹 GET /faq/admin → todas FAQs
  @Get('admin')
  async getAllFaqsAdmin() {
    return this.faqService.getFaqs();
  }

  // 🔹 DELETE /faq/admin/:id
  @Delete('admin/:id')
  async deleteFaq(@Param('id', ParseIntPipe) id: number) {
    await this.faqService.deleteFaq(id);

    return { message: 'FAQ deletada com sucesso' };
  }
}