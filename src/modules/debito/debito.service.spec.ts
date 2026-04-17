import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { StatusDebito, TipoDebito } from '../../models/debito.model';
import { Veiculo } from '../../models/veiculo.model';
import { DebitoService } from './debito.service';

const mockVeiculo = {
  placa: 'ABC1234',
  debitoVeiculos: [
    {
      debito: {
        id: 1,
        descricao: 'IPVA 2026',
        valor: 1500.0,
        status: StatusDebito.PENDENTE,
        tipo: TipoDebito.VEICULO,
      },
    },
    {
      debito: {
        id: 2,
        descricao: 'Multa',
        valor: 300.0,
        status: StatusDebito.PENDENTE,
        tipo: TipoDebito.VEICULO,
      },
    },
  ],
};

describe('DebitoService', () => {
  let service: DebitoService;
  let mockVeiculoModel: { findOne: jest.Mock };

  beforeEach(async () => {
    mockVeiculoModel = {
      findOne: jest.fn().mockResolvedValue(mockVeiculo),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DebitoService,
        {
          provide: getModelToken(Veiculo),
          useValue: mockVeiculoModel,
        },
      ],
    }).compile();

    service = module.get<DebitoService>(DebitoService);
  });

  it('deve retornar débitos e total corretamente', async () => {
    const resultado = await service.buscarDebitosPorPlaca('ABC1234');

    expect(resultado).toEqual({
      placa: 'ABC1234',
      debitos: [
        {
          id: 1,
          descricao: 'IPVA 2026',
          valor: 1500,
          status: StatusDebito.PENDENTE,
        },
        {
          id: 2,
          descricao: 'Multa',
          valor: 300,
          status: StatusDebito.PENDENTE,
        },
      ],
      total: 1800,
    });
  });

  it('deve retornar lista vazia e total 0 quando não há débitos', async () => {
    mockVeiculoModel.findOne.mockResolvedValue({
      placa: 'ABC1234',
      debitoVeiculos: [],
    });

    const resultado = await service.buscarDebitosPorPlaca('ABC1234');

    expect(resultado.debitos).toEqual([]);
    expect(resultado.total).toBe(0);
  });

  it('deve lançar 404 quando veículo não existe', async () => {
    mockVeiculoModel.findOne.mockResolvedValue(null);

    await expect(service.buscarDebitosPorPlaca('XXX9999')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('deve retornar lista vazia quando débitos não são do tipo veículo', async () => {
    mockVeiculoModel.findOne.mockResolvedValue({
      placa: 'ABC1234',
      debitoVeiculos: [
        {
          debito: {
            id: 1,
            descricao: 'Serviço',
            valor: 200.0,
            status: StatusDebito.PENDENTE,
            tipo: TipoDebito.SERVICO,
          },
        },
      ],
    });

    const resultado = await service.buscarDebitosPorPlaca('ABC1234');

    expect(resultado.debitos).toEqual([]);
    expect(resultado.total).toBe(0);
  });
});
