import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { Veiculo } from 'src/models/veiculo.model';
import { VeiculoService } from './veiculo.service';

describe('VeiculoService', () => {
  let service: VeiculoService;

  const mockVeiculoModel = {
    findAll: jest.fn(),
    findByPk: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VeiculoService,
        {
          provide: getModelToken(Veiculo),
          useValue: mockVeiculoModel,
        },
      ],
    }).compile();

    service = module.get<VeiculoService>(VeiculoService);
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
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

    mockVeiculoModel.findAll.mockResolvedValue(mockVeiculos);

    await expect(service.getAll()).resolves.toEqual(mockVeiculos);
    expect(mockVeiculoModel.findAll).toHaveBeenCalledTimes(1);
  });

  it('deve buscar um veículo por ID com sucesso', async () => {
    const mockVeiculo = {
      id: 1,
      usuarioId: 1,
      placa: 'ABC-1234',
      renavam: '12345678901',
      marca: 'Toyota',
      modelo: 'Corolla',
      anoFabricacao: 2020,
      anoModelo: 2021,
    } as Veiculo;

    mockVeiculoModel.findByPk.mockResolvedValue(mockVeiculo);

    await expect(service.getById(1)).resolves.toEqual(mockVeiculo);
    expect(mockVeiculoModel.findByPk).toHaveBeenCalledWith(1);
  });

  it('deve lançar erro ao buscar veículo por ID inexistente', async () => {
    mockVeiculoModel.findByPk.mockResolvedValue(null);

    await expect(service.getById(999)).rejects.toThrow(
      'Veículo não encontrado',
    );
    expect(mockVeiculoModel.findByPk).toHaveBeenCalledWith(999);
  });

  describe('deleteById', () => {
    it('deve remover um veículo existente com sucesso', async () => {
      const mockDestroy = jest.fn().mockResolvedValue(undefined);

      const mockVeiculo = {
        id: 1,
        placa: 'ABC-1234',
        destroy: mockDestroy,
      } as unknown as Veiculo;

      mockVeiculoModel.findByPk.mockResolvedValue(mockVeiculo);

      await expect(service.deleteById(1)).resolves.toBeUndefined();

      expect(mockVeiculoModel.findByPk).toHaveBeenCalledWith(1);
      expect(mockDestroy).toHaveBeenCalledTimes(1);
    });

    it('deve lançar erro ao tentar remover um veículo inexistente', async () => {
      mockVeiculoModel.findByPk.mockResolvedValue(null);

      await expect(service.deleteById(999)).rejects.toThrow(
        'Veículo não encontrado',
      );

      expect(mockVeiculoModel.findByPk).toHaveBeenCalledWith(999);
    });
  });
});
