import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { TipoDebito } from '../../models/debito.model';
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
        status: 'PENDENTE',
        tipo: TipoDebito.VEICULO,
      },
    },
    {
      debito: {
        id: 2,
        descricao: 'Multa',
        valor: 300.0,
        status: 'PENDENTE',
        tipo: TipoDebito.VEICULO,
      },
    },
  ],
};

describe('DebitoService', () => {
  let service: DebitoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DebitoService,
        {
          provide: getModelToken(Veiculo),
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockVeiculo),
          },
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
        { id: 1, descricao: 'IPVA 2026', valor: 1500, status: 'PENDENTE' },
        { id: 2, descricao: 'Multa', valor: 300, status: 'PENDENTE' },
      ],
      total: 1800,
    });
  });

  it('deve retornar lista vazia e total 0 quando não há débitos', async () => {
    jest
      .spyOn(service['veiculoModel'], 'findOne')
      .mockResolvedValue({ placa: 'ABC1234', debitoVeiculos: [] } as any);

    const resultado = await service.buscarDebitosPorPlaca('ABC1234');

    expect(resultado.debitos).toEqual([]);
    expect(resultado.total).toBe(0);
  });

  it('deve lançar 404 quando veículo não existe', async () => {
    jest.spyOn(service['veiculoModel'], 'findOne').mockResolvedValue(null);

    await expect(service.buscarDebitosPorPlaca('XXX9999')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('deve lançar BadRequestException quando débitos não são do tipo veículo', async () => {
    jest.spyOn(service['veiculoModel'], 'findOne').mockResolvedValue({
      placa: 'ABC1234',
      debitoVeiculos: [
        {
          debito: {
            id: 1,
            descricao: 'Serviço',
            valor: 200.0,
            status: 'PENDENTE',
            tipo: TipoDebito.SERVICO,
          },
        },
      ],
    } as any);

    await expect(service.buscarDebitosPorPlaca('ABC1234')).rejects.toThrow(
      BadRequestException,
    );
  });
});
