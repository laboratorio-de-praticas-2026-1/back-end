import { Test, TestingModule } from '@nestjs/testing';
import { BuscaController } from './busca.controller';
import { BuscaService } from './busca.service';

describe('BuscaController', () => {
  let controller: BuscaController;
  const buscaServiceMock = {
    listarBlogByTermo: jest.fn(),
    listarBannersByTermo: jest.fn(),
    listarPublicidadeByTermo: jest.fn(),
    listarUsuariosByTermo: jest.fn(),
  };

  beforeEach(async () => {
    buscaServiceMock.listarBlogByTermo.mockReset();
    buscaServiceMock.listarBannersByTermo.mockReset();
    buscaServiceMock.listarPublicidadeByTermo.mockReset();
    buscaServiceMock.listarUsuariosByTermo.mockReset();

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
    buscaServiceMock.listarBlogByTermo.mockResolvedValue({ itens: [] });

    await controller.listarBlog('motor');

    expect(buscaServiceMock.listarBlogByTermo).toHaveBeenCalledWith('motor');
  });

  it('deve delegar a listagem de carrossel para o BuscaService', async () => {
    buscaServiceMock.listarBannersByTermo.mockResolvedValue({ itens: [] });

    await controller.listarCarrossel('promo');

    expect(buscaServiceMock.listarBannersByTermo).toHaveBeenCalledWith('promo');
  });

  it('deve delegar a listagem de usuarios para o BuscaService', async () => {
    buscaServiceMock.listarUsuariosByTermo.mockResolvedValue({ itens: [] });

    await controller.listarUsuarios('joao');

    expect(buscaServiceMock.listarUsuariosByTermo).toHaveBeenCalledWith('joao');
  });

  it('deve delegar a listagem de publicidade para o BuscaService', async () => {
    buscaServiceMock.listarPublicidadeByTermo.mockResolvedValue({ itens: [] });

    await controller.listarPublicidade('promo');

    expect(buscaServiceMock.listarPublicidadeByTermo).toHaveBeenCalledWith(
      'promo',
    );
  });
});
