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
    listarEmpresasByTermo: jest.fn(),
    listarFaqByBusca: jest.fn(),
    listarSolicitacoesByBusca: jest.fn(),
  };

  beforeEach(async () => {
    buscaServiceMock.listarBlogByTermo.mockReset();
    buscaServiceMock.listarBannersByTermo.mockReset();
    buscaServiceMock.listarPublicidadeByTermo.mockReset();
    buscaServiceMock.listarUsuariosByTermo.mockReset();
    buscaServiceMock.listarEmpresasByTermo.mockReset();
    buscaServiceMock.listarFaqByBusca.mockReset();
    buscaServiceMock.listarSolicitacoesByBusca.mockReset();

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

  it('deve delegar a listagem de empresas para o BuscaService', async () => {
    buscaServiceMock.listarEmpresasByTermo.mockResolvedValue({ itens: [] });

    await controller.listarEmpresas('curitiba');

    expect(buscaServiceMock.listarEmpresasByTermo).toHaveBeenCalledWith(
      'curitiba',
    );
  });

  it('deve delegar a busca de faq com termo e filtros para o BuscaService', async () => {
    buscaServiceMock.listarFaqByBusca.mockResolvedValue({ itens: [] });
    const dto = { termo: 'renovacao', status: 'ativo', categoria: 'CNH' };

    await controller.listarFaq(dto as any);

    expect(buscaServiceMock.listarFaqByBusca).toHaveBeenCalledWith(dto);
  });

  it('deve delegar a busca de solicitacoes com filtros para o BuscaService', async () => {
    buscaServiceMock.listarSolicitacoesByBusca.mockResolvedValue({ itens: [] });
    const dto = { termo: 'joao', de: '2026-01-01', ate: '2026-01-31' };

    await controller.listarSolicitacoes(dto as any);

    expect(buscaServiceMock.listarSolicitacoesByBusca).toHaveBeenCalledWith(dto);
  });
});
