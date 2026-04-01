import { Test, TestingModule } from '@nestjs/testing';
import { MapaController } from './mapa.controller';
import { MapaService } from './mapa.service';
import { getModelToken } from '@nestjs/sequelize';
import { Empresa } from 'src/models/empresa.model';

describe('MapaController', () => {
  let controller: MapaController;

  const mockEmpresaRepository = {
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MapaController],
      providers: [
        MapaService,
        {
          provide: getModelToken(Empresa),
          useValue: mockEmpresaRepository,
        },
      ],
    }).compile();

    controller = module.get<MapaController>(MapaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
