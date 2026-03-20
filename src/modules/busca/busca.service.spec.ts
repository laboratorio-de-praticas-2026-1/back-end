import { Test, TestingModule } from '@nestjs/testing';
import { BuscaService } from './busca.service';
import { getModelToken } from '@nestjs/sequelize';
import { BadRequestException } from '@nestjs/common';
import { Blog } from 'src/models/blog.model';
import { Banner } from 'src/models/banner.model';
import { Op } from 'sequelize';
import { BuscaBlogIntervaloDto } from './dto/busca-blog-intervalo.dto';

describe('BuscaService', () => {
  let service: BuscaService;

  type WhereClause = Partial<Record<symbol, unknown>>;

  type FindAllOptions = { where?: unknown };

  const mockBlogModel: {
    findAll: jest.Mock<Promise<unknown>, [FindAllOptions]>;
  } = {
    findAll: jest.fn<Promise<unknown>, [FindAllOptions]>(),
  };

  const mockBannerModel: {
    findAll: jest.Mock<Promise<unknown>, [FindAllOptions]>;
  } = {
    findAll: jest.fn<Promise<unknown>, [FindAllOptions]>(),
  };

  beforeEach(async () => {
    mockBlogModel.findAll.mockReset();
    mockBannerModel.findAll.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BuscaService,
        {
          provide: getModelToken(Blog),
          useValue: mockBlogModel,
        },
        {
          provide: getModelToken(Banner),
          useValue: mockBannerModel,
        },
      ],
    }).compile();

    service = module.get<BuscaService>(BuscaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('deve buscar blogs entre datas (incluindo limites)', async () => {
    const retorno = [{ id: 1 }];
    mockBlogModel.findAll.mockResolvedValue(retorno);

    await expect(
      service.buscarBlogsPorIntervaloDeData({
        de: '01/01/2026',
        ate: '31/01/2026',
      }),
    ).resolves.toEqual(retorno);

    expect(mockBlogModel.findAll).toHaveBeenCalledTimes(1);
    const args = mockBlogModel.findAll.mock.calls[0][0];
    expect(args.where).toBeDefined();
    const whereClause = args.where as WhereClause;
    expect(whereClause[Op.and]).toHaveLength(2);
  });

  it('deve buscar blogs a partir de uma data (incluindo limite)', async () => {
    const retorno = [{ id: 1 }];
    mockBlogModel.findAll.mockResolvedValue(retorno);

    await expect(
      service.buscarBlogsPorIntervaloDeData({
        de: '01/01/2026',
      }),
    ).resolves.toEqual(retorno);

    expect(mockBlogModel.findAll).toHaveBeenCalledTimes(1);
    const args = mockBlogModel.findAll.mock.calls[0][0];
    expect(args.where).toBeDefined();
    const whereClause = args.where as WhereClause;
    expect(whereClause[Op.and]).toHaveLength(1);
  });

  it('deve buscar blogs até uma data (incluindo limite)', async () => {
    const retorno = [{ id: 1 }];
    mockBlogModel.findAll.mockResolvedValue(retorno);

    await expect(
      service.buscarBlogsPorIntervaloDeData({
        ate: '31/01/2026',
      }),
    ).resolves.toEqual(retorno);

    expect(mockBlogModel.findAll).toHaveBeenCalledTimes(1);
    const args = mockBlogModel.findAll.mock.calls[0][0];
    expect(args.where).toBeDefined();
    const whereClause = args.where as WhereClause;
    expect(whereClause[Op.and]).toHaveLength(1);
  });

  it('deve falhar quando nenhuma data é informada', async () => {
    await expect(
      service.buscarBlogsPorIntervaloDeData(
        {} as unknown as BuscaBlogIntervaloDto,
      ),
    ).rejects.toThrow(BadRequestException);

    await expect(
      service.buscarBlogsPorIntervaloDeData(
        {} as unknown as BuscaBlogIntervaloDto,
      ),
    ).rejects.toThrow('Informe ao menos uma data: "de" ou "ate"');
    expect(mockBlogModel.findAll).not.toHaveBeenCalled();
  });

  it('deve falhar com formato inválido', async () => {
    await expect(
      service.buscarBlogsPorIntervaloDeData({
        de: '2026-01-01',
        ate: '31/01/2026',
      }),
    ).rejects.toThrow(BadRequestException);

    await expect(
      service.buscarBlogsPorIntervaloDeData({
        de: '2026-01-01',
        ate: '31/01/2026',
      }),
    ).rejects.toThrow('Campo "de" deve estar no formato DD/MM/YYYY');
  });

  it('deve falhar com formato inválido quando só uma data é informada', async () => {
    await expect(
      service.buscarBlogsPorIntervaloDeData({
        ate: '2026-01-31',
      }),
    ).rejects.toThrow(BadRequestException);

    await expect(
      service.buscarBlogsPorIntervaloDeData({
        ate: '2026-01-31',
      }),
    ).rejects.toThrow('Campo "ate" deve estar no formato DD/MM/YYYY');
  });

  it('deve buscar banners ativos quando status=ativo', async () => {
    const retorno = [{ id: 1 }];
    mockBannerModel.findAll.mockResolvedValue(retorno);

    await expect(
      service.buscarBannerPorStatus({ status: 'ativo' }),
    ).resolves.toEqual(retorno);

    expect(mockBannerModel.findAll).toHaveBeenCalledTimes(1);
    expect(mockBannerModel.findAll).toHaveBeenCalledWith({
      where: {
        ativo: true,
      },
    });
  });

  it('deve buscar banners inativos quando status=inativo', async () => {
    const retorno = [{ id: 1 }];
    mockBannerModel.findAll.mockResolvedValue(retorno);

    await expect(
      service.buscarBannerPorStatus({ status: 'inativo' }),
    ).resolves.toEqual(retorno);

    expect(mockBannerModel.findAll).toHaveBeenCalledTimes(1);
    expect(mockBannerModel.findAll).toHaveBeenCalledWith({
      where: {
        ativo: false,
      },
    });
  });
});
