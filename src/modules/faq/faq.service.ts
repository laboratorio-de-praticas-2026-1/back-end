/* eslint-disable prettier/prettier */
import {
  Inject,
  Injectable,
  NotFoundException,
  Optional,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Faq } from 'src/models/faq.model';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';

type CategoriaRepository = {
  findByPk: (id: number) => Promise<unknown | null>;
  findAll: () => Promise<unknown[]>;
};

@Injectable()
export class FaqService {
  constructor(
    @InjectModel(Faq)
    private faqModel: typeof Faq,

    @Optional()
    @Inject('CategoriaRepository')
    private categoriaModel?: CategoriaRepository,
  ) {}

  async getFaqs(): Promise<Faq[]> {
    return this.faqModel.findAll({
      where: { status: true },
    });
  }

  async getAllFaqsAdmin(): Promise<Faq[]> {
    return this.faqModel.findAll();
  }

  async getCategorias(): Promise<unknown[]> {
    this.ensureCategoriaModel();
    return this.categoriaModel.findAll();
  }

  async getFaqById(id: number): Promise<Faq> {
    const faq = await this.faqModel.findByPk(id);

    if (!faq) {
      throw new NotFoundException(`FAQ com ID ${id} não encontrada.`);
    }

    return faq;
  }

  private ensureCategoriaModel(): asserts this is this & {
    categoriaModel: CategoriaRepository;
  } {
    if (!this.categoriaModel) {
      throw new InternalServerErrorException(
        'Repositório de categorias não configurado.',
      );
    }
  }

  private async validarCategoria(categoriaId: number): Promise<void> {
    this.ensureCategoriaModel();

    const categoria = await this.categoriaModel.findByPk(categoriaId);

    if (!categoria) {
      throw new NotFoundException(
        `Categoria com ID ${categoriaId} não encontrada.`,
      );
    }
  }

  async createFaq(dto: CreateFaqDto): Promise<Faq> {
    await this.validarCategoria(dto.categoriaId);

    return this.faqModel.create({
      ...dto,
      status: dto.status ?? true,
    });
  }

  async updateFaq(id: number, dto: UpdateFaqDto): Promise<Faq> {
    const faq = await this.getFaqById(id);

    if (dto.categoriaId !== undefined) {
      await this.validarCategoria(dto.categoriaId);
    }

    await faq.update(dto);

    return faq;
  }

  async deleteFaq(id: number): Promise<void> {
    const faq = await this.getFaqById(id);
    await faq.destroy();
  }
}