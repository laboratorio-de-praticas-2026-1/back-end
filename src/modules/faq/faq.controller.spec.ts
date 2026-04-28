/// <reference types="jest" />
/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { FaqController } from './faq.controller';
import { FaqService } from './faq.service';
import { NotFoundException } from '@nestjs/common';
import { CategoriaFaqEnum } from 'src/models/faq.model';

describe('FaqController', () => {
  let controller: FaqController;

  const faqServiceMock = {
    getFaqs: jest.fn(),
    getFaqById: jest.fn(),
    getAllFaqsAdmin: jest.fn(),
    getCategorias: jest.fn(),
    createFaq: jest.fn(),
    updateFaq: jest.fn(),
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
      {
        id: 1,
        pergunta: 'P1',
        resposta: 'R1',
        categoria: CategoriaFaqEnum.DOCUMENTACAO,
        status: true,
      },
      {
        id: 2,
        pergunta: 'P2',
        resposta: 'R2',
        categoria: CategoriaFaqEnum.MANUTENCAO,
        status: true,
      },
    ];

    faqServiceMock.getFaqs.mockResolvedValue(mockFaqs);

    const result = await controller.getFaqs();

    expect(result).toEqual(mockFaqs);
    expect(faqServiceMock.getFaqs).toHaveBeenCalled();
  });

  // GET /faq/admin
  it('deve retornar todas as FAQs (admin)', async () => {
    const mockFaqs = [
      {
        id: 1,
        categoria: CategoriaFaqEnum.DOCUMENTACAO,
      },
      {
        id: 2,
        categoria: CategoriaFaqEnum.MANUTENCAO,
      },
    ];

    faqServiceMock.getAllFaqsAdmin.mockResolvedValue(mockFaqs);

    const result = await controller.getAllFaqsAdmin();

    expect(result).toEqual(mockFaqs);
    expect(faqServiceMock.getAllFaqsAdmin).toHaveBeenCalled();
  });

  // GET /faq/categorias
  it('deve retornar categorias', async () => {
    const categorias = [
      'documentacao',
      'regularizacao',
      'manutencao',
      'outros',
      'frequentes',
    ];

    faqServiceMock.getCategorias.mockReturnValue(categorias);

    const result = await controller.getCategorias();

    expect(result).toEqual(categorias);
    expect(faqServiceMock.getCategorias).toHaveBeenCalled();
  });

  // GET /faq/:id
  it('deve retornar uma FAQ por ID', async () => {
    const faq = {
      id: 1,
      pergunta: 'P1',
      resposta: 'R1',
      categoria: CategoriaFaqEnum.DOCUMENTACAO,
    };

    faqServiceMock.getFaqById.mockResolvedValue(faq);

    const result = await controller.getFaqById(1);

    expect(result).toEqual(faq);
    expect(faqServiceMock.getFaqById).toHaveBeenCalledWith(1);
  });

  it('deve lançar erro se FAQ não existir', async () => {
    faqServiceMock.getFaqById.mockRejectedValue(
      new NotFoundException('FAQ não encontrada'),
    );

    await expect(controller.getFaqById(999)).rejects.toThrow(
      NotFoundException,
    );
  });

  // POST /faq/admin
  it('deve criar uma FAQ', async () => {
    const dto = {
      pergunta: 'P1',
      resposta: 'R1',
      categoria: CategoriaFaqEnum.DOCUMENTACAO,
    };

    const createdFaq = { id: 1, ...dto };

    faqServiceMock.createFaq.mockResolvedValue(createdFaq);

    const result = await controller.createFaq(dto);

    expect(result).toEqual(createdFaq);
    expect(faqServiceMock.createFaq).toHaveBeenCalledWith(dto);
  });

  it('deve lançar erro ao criar uma FAQ', async () => {
    const dto = {
      pergunta: 'Teste',
      resposta: 'Resposta',
      categoria: CategoriaFaqEnum.DOCUMENTACAO,
    };

    faqServiceMock.createFaq.mockRejectedValue(new NotFoundException());

    await expect(controller.createFaq(dto)).rejects.toThrow(
      NotFoundException,
    );
  });

  // PATCH /faq/admin/:id
  it('deve atualizar uma FAQ', async () => {
    const dto = { resposta: 'Resposta atualizada' };

    const updatedFaq = {
      id: 1,
      pergunta: 'P1',
      resposta: 'Resposta atualizada',
      categoria: CategoriaFaqEnum.DOCUMENTACAO,
    };

    faqServiceMock.updateFaq.mockResolvedValue(updatedFaq);

    const result = await controller.updateFaq(1, dto);

    expect(result).toEqual(updatedFaq);
    expect(faqServiceMock.updateFaq).toHaveBeenCalledWith(1, dto);
  });

  it('deve lançar erro ao atualizar uma FAQ inexistente', async () => {
    const dto = { resposta: 'Nova resposta' };

    faqServiceMock.updateFaq.mockRejectedValue(new NotFoundException());

    await expect(
      controller.updateFaq(999, dto),
    ).rejects.toThrow(NotFoundException);
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

  it('deve lançar erro ao deletar FAQ inexistente', async () => {
    faqServiceMock.deleteFaq.mockRejectedValue(new NotFoundException());

    await expect(controller.deleteFaq(999)).rejects.toThrow(
      NotFoundException,
    );
  });
});