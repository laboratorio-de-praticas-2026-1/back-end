/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { FaqController } from './faq.controller';
import { FaqService } from './faq.service';
import { NotFoundException } from '@nestjs/common';

describe('FaqController', () => {
  let controller: FaqController;

  const faqServiceMock = {
    getFaqs: jest.fn(),
    getFaqById: jest.fn(),
    deleteFaq: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FaqController],
      providers: [
        {
          provide: FaqService,
          useValue: faqServiceMock,
        },
      ],
    }).compile();

    controller = module.get<FaqController>(FaqController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // GET /faq
  it('deve retornar todas as FAQs', async () => {
    const mockFaqs = [
      { id: 1, pergunta: 'P1', resposta: 'R1' },
      { id: 2, pergunta: 'P2', resposta: 'R2' },
    ];

    faqServiceMock.getFaqs.mockResolvedValue(mockFaqs);

    const result = await controller.getFaqs();

    expect(result).toEqual(mockFaqs);
    expect(faqServiceMock.getFaqs).toHaveBeenCalled();
  });

  // GET /faq/admin
  it('deve retornar todas as FAQs (admin)', async () => {
    const mockFaqs = [
      { id: 1 },
      { id: 2 },
    ];

    faqServiceMock.getFaqs.mockResolvedValue(mockFaqs);

    const result = await controller.getAllFaqsAdmin();

    expect(result).toEqual(mockFaqs);
    expect(faqServiceMock.getFaqs).toHaveBeenCalled();
  });

  // GET /faq/:id
  it('deve retornar uma FAQ por ID', async () => {
    const faq = { id: 1, pergunta: 'P1', resposta: 'R1' };

    faqServiceMock.getFaqById.mockResolvedValue(faq);

    const result = await controller.getFaqById(1);

    expect(result).toEqual(faq);
    expect(faqServiceMock.getFaqById).toHaveBeenCalledWith(1);
  });

  // GET erro
  it('deve lançar erro se FAQ não existir', async () => {
    faqServiceMock.getFaqById.mockRejectedValue(
      new NotFoundException('FAQ não encontrada'),
    );

    await expect(controller.getFaqById(999)).rejects.toThrow(
      NotFoundException,
    );
  });

  // DELETE
  it('deve deletar uma FAQ', async () => {
    faqServiceMock.deleteFaq.mockResolvedValue(undefined);

    const result = await controller.deleteFaq(1);

    expect(result).toEqual({
      message: 'FAQ deletada com sucesso',
    });

    expect(faqServiceMock.deleteFaq).toHaveBeenCalledWith(1);
  });

  // DELETE erro
  it('deve lançar erro ao deletar FAQ inexistente', async () => {
    faqServiceMock.deleteFaq.mockRejectedValue(
      new NotFoundException(),
    );

    await expect(controller.deleteFaq(999)).rejects.toThrow(
      NotFoundException,
    );
  });
});