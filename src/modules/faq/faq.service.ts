/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Faq } from 'src/models/faq.model';

@Injectable()
export class FaqService {
  constructor(
    @InjectModel(Faq)
    private faqModel: typeof Faq,
  ) {}

  //Listar FAQs públicas (exibição no site para visitantes)
  async getFaqs(): Promise<Faq[]> {
    return this.faqModel.findAll();
  }

  //Listar todas as FAQs no painel CMS (uso administrativo)
  async getAllFaqsAdmin(): Promise<Faq[]> {
    return this.faqModel.findAll();
  }

  //Buscar uma FAQ específica pelo ID
  async getFaqById(id: number): Promise<Faq> {
    const faq = await this.faqModel.findByPk(id);
    if (!faq) {
      throw new NotFoundException('FAQ não encontrada');
    }
    return faq;
  }

  //Criar uma nova FAQ
  async createFaq(pergunta: string, resposta: string): Promise<Faq> {
    return this.faqModel.create({ pergunta, resposta });
  }

  //Remover uma FAQ pelo ID
  async deleteFaq(id: number): Promise<void> {
    const faq = await this.faqModel.findByPk(id);
    if (!faq) {
      throw new NotFoundException('FAQ não encontrada');
    }
    await faq.destroy();
  }
}