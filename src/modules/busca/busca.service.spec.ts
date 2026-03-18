import { Test, TestingModule } from '@nestjs/testing';
import { BuscaService } from './busca.service';
import { getModelToken } from '@nestjs/sequelize';
import { Blog } from 'src/models/blog.model';

describe('BuscaService', () => {
  let service: BuscaService;

  const mockBlogModel = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BuscaService,
        {
          provide: getModelToken(Blog),
          useValue: mockBlogModel,
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
  });

  it('deve falhar com formato inválido', async () => {
    await expect(
      service.buscarBlogsPorIntervaloDeData({
        de: '2026-01-01',
        ate: '31/01/2026',
      }),
    ).rejects.toBeDefined();
  });
});
