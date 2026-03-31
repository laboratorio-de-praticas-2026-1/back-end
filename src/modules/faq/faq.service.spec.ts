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
      categoria: 'geral',
    };

    await service.createFaq(dto);

    expect(mockFaqModel.create).toHaveBeenCalledWith({
      ...dto,
      status: true,
    });
  });

  it('updateFaq deve atualizar dados', async () => {
    const fakeFaq = {
      update: jest.fn(),
    };

    mockFaqModel.findByPk.mockResolvedValueOnce(fakeFaq);

    await service.updateFaq(1, { categoria: 'nova' });

    expect(fakeFaq.update).toHaveBeenCalledWith({ categoria: 'nova' });
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