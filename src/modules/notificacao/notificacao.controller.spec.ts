import { Test, TestingModule } from '@nestjs/testing';
import { NotificacaoController } from './notificacao.controller';
import { NotificacaoService } from './notificacao.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Debito } from './entities/debito.entity';
import { DebitoVeiculo } from './entities/debito-veiculo.entity';
import { DebitoServico } from './entities/debito-servico.entity';

describe('NotificacaoController', () => {
  let controller: NotificacaoController;
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
      controllers: [NotificacaoController],
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

    controller = module.get<NotificacaoController>(NotificacaoController);
    service = module.get<NotificacaoService>(NotificacaoService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return empty array when no pending debts', async () => {
    mockDebitoRepository.createQueryBuilder.mockReturnValue({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    });

    const result = await controller.getUserNotifications('1');

    expect(result.notificacoes).toEqual([]);
    expect(result.total).toBeUndefined();
  });

  it('should return notifications when pending debts exist', async () => {
    const mockDebito = {
      id: 1,
      valor: 200,
      descricao: 'Débito de teste',
      created_at: new Date(),
      debitoVeiculo: {
        veiculo: {
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

    const result = await controller.getUserNotifications('1');

    expect(result.notificacoes.length).toBe(1);
    expect(result.notificacoes[0]).toHaveProperty('titulo');
    expect(result.notificacoes[0]).toHaveProperty('mensagem');
    expect(result.notificacoes[0]).toHaveProperty('valor');
    expect(result.notificacoes[0]).toHaveProperty('data');
  });

  it('should throw error for invalid userId', async () => {
    await expect(controller.getUserNotifications('invalid')).rejects.toThrow();
  });
});
