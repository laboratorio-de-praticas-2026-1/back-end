import { Test, TestingModule } from '@nestjs/testing';
import { MapaService } from './mapa.service';
import { getModelToken } from '@nestjs/sequelize';
import { Empresa } from 'src/models/empresa.model';
import { BadRequestException } from '@nestjs/common';
import { Op } from 'sequelize';

describe('MapaService', () => {
  let service: MapaService;

  const mockEmpresas = [
    {
      id: 1,
      nomeFantasia: 'Clinica A',
      tipo: 'clinica',
      latitude: '1',
      longitude: '1',
    },
    {
      id: 2,
      nomeFantasia: 'Detran B',
      tipo: 'detran',
      latitude: '2',
      longitude: '2',
    },
  ];

  const mockEmpresaModel = {
    findAll: jest.fn(),
  };

  const coordenadasValidas = {
    [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: '' }],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MapaService,
        {
          provide: getModelToken(Empresa),
          useValue: mockEmpresaModel,
        },
      ],
    }).compile();

    service = module.get<MapaService>(MapaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('deve retornar todas as empresas válidas', async () => {
      mockEmpresaModel.findAll.mockResolvedValue(mockEmpresas);
      const result = await service.findAll();
      expect(result).toEqual(mockEmpresas);
      expect(mockEmpresaModel.findAll).toHaveBeenCalledWith({
        where: { latitude: coordenadasValidas, longitude: coordenadasValidas },
      });
    });
  });

  describe('findByTipo', () => {
    it('deve retornar empresas de um tipo válido', async () => {
      mockEmpresaModel.findAll.mockResolvedValue([mockEmpresas[0]]);
      const result = await service.findByTipo('clinica');
      expect(result).toEqual([mockEmpresas[0]]);
    });

    it('deve lançar BadRequestException se o tipo for inválido', async () => {
      await expect(service.findByTipo('padaria')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findByCidade', () => {
    it('deve buscar empresas com filtro de cidade (LIKE)', async () => {
      mockEmpresaModel.findAll.mockResolvedValue(mockEmpresas);
      await service.findByCidade('São Paulo');
      expect(mockEmpresaModel.findAll).toHaveBeenCalledWith({
        where: {
          latitude: coordenadasValidas,
          longitude: coordenadasValidas,
          cidade: { [Op.like]: '%São Paulo%' },
        },
      });
    });
  });

  describe('findComFiltro', () => {
    it('deve filtrar simultaneamente por tipo e cidade', async () => {
      mockEmpresaModel.findAll.mockResolvedValue([mockEmpresas[0]]);
      await service.findComFiltro('clinica', 'Registro');
      expect(mockEmpresaModel.findAll).toHaveBeenCalledWith({
        where: {
          latitude: coordenadasValidas,
          longitude: coordenadasValidas,
          tipo: 'clinica',
          cidade: { [Op.like]: '%Registro%' },
        },
      });
    });

    it('deve retornar todos os registros válidos quando nenhum parâmetro for informado', async () => {
      mockEmpresaModel.findAll.mockResolvedValue(mockEmpresas);
      await service.findComFiltro(undefined, undefined);
      expect(mockEmpresaModel.findAll).toHaveBeenCalledWith({
        where: {
          latitude: coordenadasValidas,
          longitude: coordenadasValidas,
        },
      });
    });

    it('deve filtrar apenas por tipo', async () => {
      mockEmpresaModel.findAll.mockResolvedValue([mockEmpresas[1]]);
      await service.findComFiltro('detran', undefined);
      expect(mockEmpresaModel.findAll).toHaveBeenCalledWith({
        where: {
          latitude: coordenadasValidas,
          longitude: coordenadasValidas,
          tipo: 'detran',
        },
      });
    });

    it('deve filtrar apenas por cidade', async () => {
      mockEmpresaModel.findAll.mockResolvedValue(mockEmpresas);
      await service.findComFiltro(undefined, 'Registro');
      expect(mockEmpresaModel.findAll).toHaveBeenCalledWith({
        where: {
          latitude: coordenadasValidas,
          longitude: coordenadasValidas,
          cidade: { [Op.like]: '%Registro%' },
        },
      });
    });

    it('deve lançar erro se o tipo no filtro combinado for inválido', async () => {
      await expect(
        service.findComFiltro('invalido', 'São Paulo'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
