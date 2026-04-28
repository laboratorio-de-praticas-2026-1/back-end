/// <reference types="jest" />
/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { FaqService } from './faq.service';
import { Faq, CategoriaFaqEnum } from 'src/models/faq.model';
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

    mockFaqModel.findAll.mockResolvedValue([
      {
        id: 1,
        pergunta: 'P1',
        resposta: 'R1',
        categoria: CategoriaFaqEnum.DOCUMENTACAO,
        status: true,
      },
    ]);

    mockFaqModel.findByPk.mockResolvedValue(null);
    mockFaqModel.create.mockResolvedValue({});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('getFaqs deve retornar lista', async () => {
    const result = await service.getFaqs();

    expect(result).toEqual([
      {
        id: 1,
        pergunta: 'P1',
        resposta: 'R1',
        categoria: CategoriaFaqEnum.DOCUMENTACAO,
        status: true,
      },
    ]);

    expect(mockFaqModel.findAll).toHaveBeenCalledWith({
      where: { status: true },
    });
  });

  it('getCategorias deve retornar enum de categorias', () => {
    const result = service.getCategorias();

    expect(result).toEqual([
      'documentacao',
      'regularizacao',
      'manutencao',
      'outros',
      'frequentes',
    ]);
  });

  it('getFaqById deve retornar FAQ', async () => {
    const fakeFaq: Partial<Faq> = { id: 1 };

    mockFaqModel.findByPk.mockResolvedValueOnce(fakeFaq as Faq);

    const result = await service.getFaqById(1);

    expect(result).toEqual(fakeFaq);
    expect(mockFaqModel.findByPk).toHaveBeenCalledWith(1);
  });

  it('getFaqById deve lançar NotFoundException quando não existir', async () => {
    mockFaqModel.findByPk.mockResolvedValueOnce(null);

    await expect(service.getFaqById(999)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('createFaq deve criar com status true por padrão', async () => {
    const dto = {
      pergunta: 'P?',
      resposta: 'R',
      categoria: CategoriaFaqEnum.DOCUMENTACAO,
    };

    await service.createFaq(dto);

    expect(mockFaqModel.create).toHaveBeenCalledWith({
      ...dto,
      status: true,
    });
  });

  it('updateFaq deve atualizar dados', async () => {
    const fakeFaq: Partial<Faq> = {
      id: 1,
      update: jest.fn().mockResolvedValue(undefined),
    };

    mockFaqModel.findByPk.mockResolvedValueOnce(fakeFaq as Faq);

    await service.updateFaq(1, {
      categoria: CategoriaFaqEnum.MANUTENCAO,
    });

    expect(fakeFaq.update).toHaveBeenCalledWith({
      categoria: CategoriaFaqEnum.MANUTENCAO,
    });
  });

  it('deleteFaq deve remover FAQ', async () => {
    const fakeFaq: Partial<Faq> = {
      destroy: jest.fn(),
    };

    mockFaqModel.findByPk.mockResolvedValueOnce(fakeFaq as Faq);

    await service.deleteFaq(1);

    expect(mockFaqModel.findByPk).toHaveBeenCalledWith(1);
    expect(fakeFaq.destroy).toHaveBeenCalled();
  });

  it('deleteFaq deve lançar NotFoundException se não achado', async () => {
    mockFaqModel.findByPk.mockResolvedValueOnce(null);

    await expect(service.deleteFaq(999)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updateFaq deve atualizar e retornar FAQ atualizado', async () => {
    const updateDto = { pergunta: 'Pergunta atualizada' };

    const fakeFaq: Partial<Faq> = {
      id: 1,
      pergunta: 'P1',
      resposta: 'R1',
      update: jest.fn().mockResolvedValue(undefined),
    };

    mockFaqModel.findByPk.mockResolvedValueOnce(fakeFaq as Faq);

    const result = await service.updateFaq(1, updateDto);

    expect(mockFaqModel.findByPk).toHaveBeenCalledWith(1);
    expect(fakeFaq.update).toHaveBeenCalledWith(updateDto);
    expect(result).toBe(fakeFaq);
  });

  it('updateFaq deve permitir atualizar múltiplos campos', async () => {
    const updateDto = {
      pergunta: 'Nova pergunta',
      resposta: 'Nova resposta',
      status: true,
    };

    const fakeFaq: Partial<Faq> = {
      id: 1,
      update: jest.fn().mockResolvedValue(undefined),
    };

    mockFaqModel.findByPk.mockResolvedValueOnce(fakeFaq as Faq);

    const result = await service.updateFaq(1, updateDto);

    expect(fakeFaq.update).toHaveBeenCalledWith(updateDto);
    expect(result).toBe(fakeFaq);
  });

  it('updateFaq deve lançar NotFoundException se FAQ não existir', async () => {
    mockFaqModel.findByPk.mockResolvedValueOnce(null);

    await expect(
      service.updateFaq(999, { pergunta: 'Teste' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});