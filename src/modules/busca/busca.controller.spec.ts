import { Test, TestingModule } from '@nestjs/testing';
import { BuscaController } from './busca.controller';
import { BuscaService } from './busca.service';

describe('BuscaController', () => {
  let controller: BuscaController;
  const buscaServiceMock = {
    listarBlog: jest.fn(),
    listarCarrossel: jest.fn(),
  };

  beforeEach(async () => {
    buscaServiceMock.listarBlog.mockReset();
    buscaServiceMock.listarCarrossel.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BuscaController],
      providers: [
        {
          provide: BuscaService,
          useValue: buscaServiceMock,
        },
      ],
    }).compile();

    controller = module.get<BuscaController>(BuscaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('deve delegar a listagem de blog para o BuscaService', async () => {
    buscaServiceMock.listarBlog.mockResolvedValue({ itens: [] });

    await controller.listarBlog('motor');

    expect(buscaServiceMock.listarBlog).toHaveBeenCalledWith('motor');
  });

  it('deve delegar a listagem de carrossel para o BuscaService', async () => {
    buscaServiceMock.listarCarrossel.mockResolvedValue({ itens: [] });

    await controller.listarCarrossel('promo');

    expect(buscaServiceMock.listarCarrossel).toHaveBeenCalledWith('promo');
  });
});
