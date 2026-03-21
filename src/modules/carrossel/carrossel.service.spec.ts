import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { CarrosselService } from './carrossel.service';
import { Banner } from 'src/models/banner.model';

describe('CarrosselService', () => {
    let service: CarrosselService;
    const findAllMock = jest.fn();

    beforeEach(async () => {
        findAllMock.mockReset();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CarrosselService,
                {
                    provide: getModelToken(Banner),
                    useValue: {
                        findAll: findAllMock,
                    },
                },
            ],
        }).compile();

        service = module.get<CarrosselService>(CarrosselService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('deve retornar mensagem quando nao encontrar itens sem filtro', async () => {
        findAllMock.mockResolvedValue([]);

        const resultado = await service.listarBanners();

        expect(findAllMock).toHaveBeenCalledWith({ order: [['id', 'DESC']] });
        expect(resultado).toEqual({
            itens: [],
            mensagem: 'Nenhum item foi encontrado.',
        });
    });
});
