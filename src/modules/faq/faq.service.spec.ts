/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { FaqService } from './faq.service';
import { Faq } from 'src/models/faq.model';
import { NotFoundException } from '@nestjs/common';

const faqModelMock = {
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
        { provide: getModelToken(Faq), useValue: faqModelMock },
      ],
    }).compile();

    service = module.get<FaqService>(FaqService);

    // 🔧 Valores padrão dos mocks
    faqModelMock.findAll.mockResolvedValue([
      { id: 1, pergunta: 'P1', resposta: 'R1' },
    ]);

    faqModelMock.findByPk.mockResolvedValue(null);
    faqModelMock.create.mockResolvedValue({});
  });

  afterEach(() => jest.resetAllMocks());

  it('getFaqs deve retornar lista', async () => {
    const result = await service.getFaqs();

    expect(result).toEqual([
      { id: 1, pergunta: 'P1', resposta: 'R1' },
    ]);

    expect(faqModelMock.findAll).toHaveBeenCalled();
  });

  it('getFaqById deve retornar FAQ quando existir', async () => {
    const fakeFaq = { id: 1, pergunta: 'P1', resposta: 'R1' };

    faqModelMock.findByPk.mockResolvedValueOnce(fakeFaq);

    const result = await service.getFaqById(1);

    expect(result).toEqual(fakeFaq);
    expect(faqModelMock.findByPk).toHaveBeenCalledWith(1);
  });

  it('getFaqById deve lançar NotFoundException quando não existir', async () => {
    faqModelMock.findByPk.mockResolvedValueOnce(null);

    await expect(service.getFaqById(999))
      .rejects
      .toBeInstanceOf(NotFoundException);
  });

  it('createFaq deve criar e retornar FAQ', async () => {
    const fakeFaq = { id: 2, pergunta: 'P2', resposta: 'R2' };

    faqModelMock.create.mockResolvedValueOnce(fakeFaq);

    const result = await service.createFaq({
      pergunta: 'P2',
      resposta: 'R2',
    });

    expect(result).toEqual(fakeFaq);
    expect(faqModelMock.create).toHaveBeenCalledWith({
      pergunta: 'P2',
      resposta: 'R2',
    });
  });

  it('deleteFaq deve destruir existente', async () => {
    const fakeFaq = {
      id: 1,
      destroy: jest.fn().mockResolvedValue(undefined),
    };

    faqModelMock.findByPk.mockResolvedValueOnce(
      fakeFaq as unknown as Faq,
    );

    await service.deleteFaq(1);

    expect(faqModelMock.findByPk).toHaveBeenCalledWith(1);
    expect(fakeFaq.destroy).toHaveBeenCalled();
  });

  it('deleteFaq deve lançar NotFoundException se não achado', async () => {
    faqModelMock.findByPk.mockResolvedValueOnce(null);

    await expect(service.deleteFaq(999))
      .rejects
      .toBeInstanceOf(NotFoundException);
  });

  it('updateFaq deve atualizar e retornar FAQ atualizado', async () => {
    const updateDto = { pergunta: 'Pergunta atualizada' };

    const fakeFaq = {
      id: 1,
      pergunta: 'P1',
      resposta: 'R1',
      update: jest.fn().mockResolvedValue(undefined),
      reload: jest.fn().mockResolvedValue({
        id: 1,
        pergunta: 'Pergunta atualizada',
        resposta: 'R1',
      }),
    };

    faqModelMock.findByPk.mockResolvedValueOnce(
      fakeFaq as unknown as Faq,
    );

    const result = await service.updateFaq(1, updateDto);

    expect(faqModelMock.findByPk).toHaveBeenCalledWith(1);
    expect(fakeFaq.update).toHaveBeenCalledWith(updateDto);
    expect(fakeFaq.reload).toHaveBeenCalled();

    expect(result).toEqual({
      id: 1,
      pergunta: 'Pergunta atualizada',
      resposta: 'R1',
    });
  });

  it('updateFaq deve permitir atualizar múltiplos campos', async () => {
    const updateDto = {
      pergunta: 'Nova pergunta',
      resposta: 'Nova resposta',
      status: true,
    };

    const fakeFaq = {
      id: 1,
      update: jest.fn().mockResolvedValue(undefined),
      reload: jest.fn().mockResolvedValue({
        id: 1,
        ...updateDto,
      }),
    };

    faqModelMock.findByPk.mockResolvedValueOnce(
      fakeFaq as unknown as Faq,
    );

    const result = await service.updateFaq(1, updateDto);

    expect(fakeFaq.update).toHaveBeenCalledWith(updateDto);
    expect(result).toEqual({
      id: 1,
      ...updateDto,
    });
  });

  it('updateFaq deve lançar NotFoundException se FAQ não existir', async () => {
    faqModelMock.findByPk.mockResolvedValueOnce(null);

    await expect(
      service.updateFaq(999, { pergunta: 'Teste' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});