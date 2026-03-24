/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Faq } from 'src/models/faq.model';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';

@Injectable()
export class FaqService {
  constructor(
    @InjectModel(Faq)
    private faqModel: typeof Faq,
  ) {}

  async getFaqs(): Promise<Faq[]> {
    return this.faqModel.findAll();
  }

  async getFaqById(id: number): Promise<Faq> {
    const faq = await this.faqModel.findByPk(id);

    if (!faq) {
      throw new NotFoundException('FAQ não encontrada');
    }

    return faq;
  }

  async createFaq(dto: CreateFaqDto): Promise<Faq> {
    return this.faqModel.create({
      pergunta: dto.pergunta,
      resposta: dto.resposta,
    });
  }

  async updateFaq(id: number, dto: UpdateFaqDto): Promise<Faq> {
    const faq = await this.getFaqById(id);

    await faq.update(dto);

    return await faq.reload(); // garante dados atualizados
  }

  async deleteFaq(id: number): Promise<void> {
    const faq = await this.getFaqById(id);

    await faq.destroy();
  }
}