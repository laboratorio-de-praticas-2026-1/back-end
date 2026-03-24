/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { FaqService } from './faq.service';
import { Faq } from 'src/models/faq.model';
import { NotFoundException } from '@nestjs/common';

const faqModelMock = {
  findAll: jest.fn().mockResolvedValue([{ id: 1, pergunta: 'P1', resposta: 'R1' }]),
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
  });

  afterEach(() => jest.clearAllMocks());

  it('getFaqs deve retornar lista', async () => {
    await expect(service.getFaqs()).resolves.toEqual([{ id: 1, pergunta: 'P1', resposta: 'R1' }]);
    expect(faqModelMock.findAll).toHaveBeenCalled();
  });

  it('getFaqById deve lançar NotFoundException quando não existir', async () => {
    faqModelMock.findByPk.mockResolvedValueOnce(null);
    await expect(service.getFaqById(999)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('createFaq deve chamar model.create', async () => {
    faqModelMock.create.mockResolvedValueOnce({ id: 2, pergunta: 'P2', resposta: 'R2' });
    await service.createFaq({ pergunta: 'P2', resposta: 'R2' })
    expect(faqModelMock.create).toHaveBeenCalledWith({ pergunta: 'P2', resposta: 'R2' });
  });

  it('deleteFaq deve destruir existente', async () => {
    const fakeFaq = { id: 1, destroy: jest.fn().mockResolvedValue(undefined) };
    faqModelMock.findByPk.mockResolvedValueOnce(fakeFaq as unknown as Faq);
    await service.deleteFaq(1);
    expect(faqModelMock.findByPk).toHaveBeenCalledWith(1);
    expect(fakeFaq.destroy).toHaveBeenCalled();
  });

  it('deleteFaq deve lançar NotFoundException se não achado', async () => {
    faqModelMock.findByPk.mockResolvedValueOnce(null);
    await expect(service.deleteFaq(999)).rejects.toBeInstanceOf(NotFoundException);
  });
});