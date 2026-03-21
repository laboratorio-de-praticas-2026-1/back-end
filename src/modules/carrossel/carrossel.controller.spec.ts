import { Test, TestingModule } from '@nestjs/testing';
import { CarrosselController } from './carrossel.controller';
import { CarrosselService } from './carrossel.service';

describe('CarrosselController', () => {
    let controller: CarrosselController;
    const listarBannersMock = jest.fn();

    beforeEach(async () => {
        listarBannersMock.mockReset();

        const module: TestingModule = await Test.createTestingModule({
            controllers: [CarrosselController],
            providers: [
                {
                    provide: CarrosselService,
                    useValue: {
                        listarBanners: listarBannersMock,
                    },
                },
            ],
        }).compile();

        controller = module.get<CarrosselController>(CarrosselController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('deve delegar a busca de banners para o service', async () => {
        const retornoEsperado = { itens: [] };
        listarBannersMock.mockResolvedValue(retornoEsperado);

        const resultado = await controller.listarBanners('promo');

        expect(listarBannersMock).toHaveBeenCalledWith('promo');
        expect(resultado).toEqual(retornoEsperado);
    });
});
