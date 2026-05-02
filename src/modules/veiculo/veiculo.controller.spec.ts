import { Test, TestingModule } from '@nestjs/testing';
import { VeiculoController } from './veiculo.controller';
import { VeiculoService } from './veiculo.service';
import { Veiculo } from 'src/models/veiculo.model';

describe('VeiculoController', () => {
  let controller: VeiculoController;

  const mockVeiculoService = {
    getAll: jest.fn(),
    getById: jest.fn(),
    deleteById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VeiculoController],
      providers: [
        {
          provide: VeiculoService,
          useValue: mockVeiculoService,
        },
      ],
    }).compile();

    controller = module.get<VeiculoController>(VeiculoController);
  });

  it('deve ser definido', () => {
    expect(controller).toBeDefined();
  });

  it('deve buscar todos os veículos com sucesso', async () => {
    const mockVeiculos: Veiculo[] = [
      {
        id: 1,
        usuarioId: 1,
        placa: 'ABC-1234',
        renavam: '12345678901',
        marca: 'Toyota',
        modelo: 'Corolla',
        anoFabricacao: 2020,
        anoModelo: 2021,
      } as Veiculo,
      {
        id: 2,
        usuarioId: 2,
        placa: 'DEF-5678',
        renavam: null,
        marca: 'Honda',
        modelo: 'Civic',
        anoFabricacao: 2019,
        anoModelo: 2020,
      } as Veiculo,
    ];

    mockVeiculoService.getAll.mockResolvedValue(mockVeiculos);

    await expect(controller.getAll()).resolves.toEqual(mockVeiculos);
    expect(mockVeiculoService.getAll).toHaveBeenCalledTimes(1);
  });

  it('deve buscar um veículo por ID com sucesso', async () => {
    const mockVeiculo: Veiculo = {
      id: 1,
      usuarioId: 1,
      placa: 'ABC-1234',
      renavam: '12345678901',
      marca: 'Toyota',
      modelo: 'Corolla',
      anoFabricacao: 2020,
      anoModelo: 2021,
    } as Veiculo;

    mockVeiculoService.getById.mockResolvedValue(mockVeiculo);

    await expect(controller.getById(1)).resolves.toEqual(mockVeiculo);
    expect(mockVeiculoService.getById).toHaveBeenCalledWith(1);
  });

  describe('deleteById', () => {
    it('deve chamar veiculoService.deleteById com sucesso', async () => {
      mockVeiculoService.deleteById.mockResolvedValue(undefined);

      await expect(controller.deleteById(1)).resolves.toBeUndefined();

      expect(mockVeiculoService.deleteById).toHaveBeenCalledWith(1);
    });
  });
});
