import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { BuscaService } from './busca.service';
import { BadRequestException } from '@nestjs/common';
import { Blog } from 'src/models/blog.model';
import { Banner } from 'src/models/banner.model';
import { BuscaBlogIntervaloDto } from './dto/busca-blog-intervalo.dto';
import { CarrosselService } from '../carrossel/carrossel.service';

describe('BuscaService', () => {
  let service: BuscaService;
  const findAllMock = jest.fn();
  const carrosselServiceMock = {
    listarBanners: jest.fn(),
  };

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
    findAllMock.mockReset();
    carrosselServiceMock.listarBanners.mockReset();

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
        {
          provide: CarrosselService,
          useValue: carrosselServiceMock,
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
        de: '2026-01-01',
        ate: '2026-01-31',
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
        de: '2026-01-01',
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
        ate: '2026-01-31',
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
        de: '01/01/2026',
        ate: '2026-01-31',
      }),
    ).rejects.toThrow(BadRequestException);

    await expect(
      service.buscarBlogsPorIntervaloDeData({
        de: '01/01/2026',
        ate: '2026-01-31',
      }),
    ).rejects.toThrow('Campo "de" deve estar no formato YYYY-MM-DD');
  });

  it('deve falhar com formato inválido quando só uma data é informada', async () => {
    await expect(
      service.buscarBlogsPorIntervaloDeData({
        ate: '31/01/2026',
      }),
    ).rejects.toThrow(BadRequestException);

    await expect(
      service.buscarBlogsPorIntervaloDeData({
        ate: '31/01/2026',
      }),
    ).rejects.toThrow('Campo "ate" deve estar no formato YYYY-MM-DD');
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
  it('deve delegar a listagem de carrossel para o CarrosselService', async () => {
    carrosselServiceMock.listarBanners.mockResolvedValue({
      itens: [],
      mensagem: 'Nenhum item foi encontrado.',
    });

    await service.listarCarrossel('teste');

    expect(carrosselServiceMock.listarBanners).toHaveBeenCalledWith('teste');
  });

  it('deve listar blog sem filtro ordenando por id decrescente', async () => {
    findAllMock.mockResolvedValue([]);

    await service.listarBlog();

    expect(findAllMock).toHaveBeenCalledWith({ order: [['id', 'DESC']] });
  });

  it('deve montar filtro por titulo e conteudo quando termo textual for informado', async () => {
    findAllMock.mockResolvedValue([]);

    await service.listarBlog('  civic  ');

    expect(findAllMock).toHaveBeenCalledWith({
      where: {
        [Op.or]: [
          { titulo: { [Op.like]: '%civic%' } },
          { conteudo: { [Op.like]: '%civic%' } },
        ],
      },
      order: [['id', 'DESC']],
    });
  });

  it('deve incluir filtro por id quando termo numerico for informado', async () => {
    findAllMock.mockResolvedValue([]);

    await service.listarBlog('42');

    expect(findAllMock).toHaveBeenCalledWith({
      where: {
        [Op.or]: [
          { titulo: { [Op.like]: '%42%' } },
          { conteudo: { [Op.like]: '%42%' } },
          { id: 42 },
        ],
      },
      order: [['id', 'DESC']],
    });
  });
});
