/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { FaqService } from './faq.service';
import { getModelToken } from '@nestjs/sequelize';
import { Faq } from 'src/models/faq.model';
import { NotFoundException } from '@nestjs/common';

const mockFaqModel = {
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
};

const mockCategoriaModel = {
  findAll: jest.fn(),
  findByPk: jest.fn(),
};

describe('FaqService', () => {
  let service: FaqService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FaqService,
        {
          provide: getModelToken(Faq),
          useValue: mockFaqModel,
        },
        {
          provide: 'CategoriaRepository',
          useValue: mockCategoriaModel,
        },
      ],
    }).compile();

    service = module.get<FaqService>(FaqService);
  });

  afterEach(() => jest.clearAllMocks());

  it('getFaqs deve retornar apenas FAQs ativas', async () => {
    await service.getFaqs();

    expect(mockFaqModel.findAll).toHaveBeenCalledWith({
      where: { status: true },
    });
  });

  it('getAllFaqsAdmin deve retornar todas as FAQs', async () => {
    await service.getAllFaqsAdmin();

    expect(mockFaqModel.findAll).toHaveBeenCalled();
  });

  it('getCategorias deve retornar lista de categorias', async () => {
    const categorias = [
      { id: 1, nome: 'Geral' },
      { id: 2, nome: 'Financeiro' },
    ];

    mockCategoriaModel.findAll.mockResolvedValueOnce(categorias);

    const result = await service.getCategorias();

    expect(result).toEqual(categorias);
    expect(mockCategoriaModel.findAll).toHaveBeenCalled();
  });

  it('getFaqById deve retornar FAQ', async () => {
    const fakeFaq = { id: 1 };
    mockFaqModel.findByPk.mockResolvedValueOnce(fakeFaq);

    const result = await service.getFaqById(1);

    expect(result).toEqual(fakeFaq);
  });

  it('getFaqById deve lançar erro se não existir', async () => {
    mockFaqModel.findByPk.mockResolvedValueOnce(null);

    await expect(service.getFaqById(1)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('createFaq deve criar com status true por padrão', async () => {
    const dto = {
      pergunta: 'P?',
      resposta: 'R',
      categoriaId: 1,
    };

    mockCategoriaModel.findByPk.mockResolvedValueOnce({ id: 1, nome: 'Geral' });

    await service.createFaq(dto);

    expect(mockCategoriaModel.findByPk).toHaveBeenCalledWith(1);
    expect(mockFaqModel.create).toHaveBeenCalledWith({
      ...dto,
      status: true,
    });
  });

  it('createFaq deve lançar erro quando categoria não existir', async () => {
    const dto = {
      pergunta: 'P?',
      resposta: 'R',
      categoriaId: 999,
    };

    mockCategoriaModel.findByPk.mockResolvedValueOnce(null);

    await expect(service.createFaq(dto)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updateFaq deve atualizar dados com categoriaId', async () => {
    const fakeFaq = {
      update: jest.fn(),
    };

    mockFaqModel.findByPk.mockResolvedValueOnce(fakeFaq);
    mockCategoriaModel.findByPk.mockResolvedValueOnce({ id: 2, nome: 'Financeiro' });

    await service.updateFaq(1, { categoriaId: 2 });

    expect(mockCategoriaModel.findByPk).toHaveBeenCalledWith(2);
    expect(fakeFaq.update).toHaveBeenCalledWith({ categoriaId: 2 });
  });

  it('updateFaq deve lançar erro quando categoriaId não existir', async () => {
    const fakeFaq = {
      update: jest.fn(),
    };

    mockFaqModel.findByPk.mockResolvedValueOnce(fakeFaq);
    mockCategoriaModel.findByPk.mockResolvedValueOnce(null);

    await expect(
      service.updateFaq(1, { categoriaId: 999 }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('deleteFaq deve remover FAQ', async () => {
    const fakeFaq = {
      destroy: jest.fn(),
    };

    mockFaqModel.findByPk.mockResolvedValueOnce(fakeFaq);

    await service.deleteFaq(1);

    expect(fakeFaq.destroy).toHaveBeenCalled();
  });
});