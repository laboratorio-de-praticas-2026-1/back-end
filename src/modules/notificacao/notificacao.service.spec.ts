import { Test, TestingModule } from '@nestjs/testing';
import { NotificacaoService } from './notificacao.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Debito, StatusDebito } from './entities/debito.entity';
import { DebitoVeiculo } from './entities/debito-veiculo.entity';
import { DebitoServico } from './entities/debito-servico.entity';

describe('NotificacaoService', () => {
  let service: NotificacaoService;

  const mockDebitoRepository = {
    createQueryBuilder: jest.fn(),
  };

  const mockDebitoVeiculoRepository = {
    find: jest.fn(),
  };

  const mockDebitoServicoRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificacaoService,
        {
          provide: getRepositoryToken(Debito),
          useValue: mockDebitoRepository,
        },
        {
          provide: getRepositoryToken(DebitoVeiculo),
          useValue: mockDebitoVeiculoRepository,
        },
        {
          provide: getRepositoryToken(DebitoServico),
          useValue: mockDebitoServicoRepository,
        },
      ],
    }).compile();

    service = module.get<NotificacaoService>(NotificacaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return empty array when user has no pending debts', async () => {
    mockDebitoRepository.createQueryBuilder.mockReturnValue({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    });

    const result = await service.getUserNotifications(1);

    expect(result).toEqual([]);
  });

  it('should return notification for vehicle debt', async () => {
    const mockDebito = {
      id: 1,
      valor: 200,
      descricao: 'Débito de veículo',
      created_at: new Date('2024-01-15'),
      status: StatusDebito.PENDENTE,
      debitoVeiculo: {
        id: 1,
        id_debito: 1,
        id_veiculo: 1,
        veiculo: {
          id: 1,
          usuario_id: 1,
          placa: 'ABC-1234',
        },
      },
      debitoServico: null,
    };

    mockDebitoRepository.createQueryBuilder.mockReturnValue({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([mockDebito]),
    });

    const result = await service.getUserNotifications(1);

    expect(result.length).toBe(1);
    expect(result[0].titulo).toContain('Veículo');
    expect(result[0].mensagem).toContain('ABC-1234');
    expect(result[0].valor).toBe(200);
    expect(result[0].data).toEqual(mockDebito.created_at);
  });

  it('should return notification for service debt', async () => {
    const mockDebito = {
      id: 2,
      valor: 150,
      descricao: 'Débito de serviço',
      created_at: new Date('2024-01-16'),
      status: StatusDebito.PENDENTE,
      debitoVeiculo: null,
      debitoServico: {
        id: 1,
        id_debito: 2,
        id_servico: 1,
        servico: {
          id: 1,
          nome: 'Vistoria Completa',
        },
      },
    };

    mockDebitoRepository.createQueryBuilder.mockReturnValue({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([mockDebito]),
    });

    const result = await service.getUserNotifications(1);

    expect(result.length).toBe(1);
    expect(result[0].titulo).toContain('Serviço');
    expect(result[0].mensagem).toContain('Vistoria Completa');
    expect(result[0].valor).toBe(150);
  });

  it('should handle multiple debts from same user', async () => {
    const mockDebitos = [
      {
        id: 1,
        valor: 200,
        descricao: 'Débito 1',
        created_at: new Date(),
        status: StatusDebito.PENDENTE,
        debitoVeiculo: {
          veiculo: { placa: 'ABC-1234' },
        },
        debitoServico: null,
      },
      {
        id: 2,
        valor: 150,
        descricao: 'Débito 2',
        created_at: new Date(),
        status: StatusDebito.PENDENTE,
        debitoVeiculo: {
          veiculo: { placa: 'XYZ-5678' },
        },
        debitoServico: null,
      },
    ];

    mockDebitoRepository.createQueryBuilder.mockReturnValue({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(mockDebitos),
    });

    const result = await service.getUserNotifications(1);

    expect(result.length).toBe(2);
  });

  it('should send notification for request confirmation', async () => {
    const consoleSpy = jest.spyOn(console, 'log');
    const testData = { id: 1, status: 'confirmado' };

    await service.enviarConfirmacaoSolicitacao(testData);

    expect(consoleSpy).toHaveBeenCalledWith('Notificação enviada', testData);
    consoleSpy.mockRestore();
  });
});
