/* eslint-disable prettier/prettier */
import { Controller, Get, Delete, Param, ParseIntPipe, Post, Body, Patch } from '@nestjs/common';
import { FaqService } from './faq.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';

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
    return this.faqService.getAllFaqsAdmin();
  }

  // GET /faq/:id
  @Get(':id')
  async getFaqById(@Param('id', ParseIntPipe) id: number) {
    return this.faqService.getFaqById(id);
  }

  // POST /faq/admin
  @Post('admin')
  async createFaq(@Body() dto: CreateFaqDto) {
    return this.faqService.createFaq(dto);
  }

  // PATCH /faq/admin/:id
  @Patch('admin/:id')
  async updateFaq(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFaqDto,
  ) {
    return this.faqService.updateFaq(id, dto);
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