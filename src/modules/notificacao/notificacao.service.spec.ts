import { Test, TestingModule } from '@nestjs/testing';
import { NotificacaoService } from './notificacao.service';
import { getModelToken } from '@nestjs/sequelize';


const mockSequelize = {
  query: jest.fn(),
  transaction: jest.fn(),

};


const mockDebitoModel = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
};

describe('NotificacaoService', () => {
  let service: NotificacaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificacaoService,
        {
          provide: 'SEQUELIZE',
          useValue: mockSequelize,
        },
        {
          provide: getModelToken('Debito'), 
          useValue: mockDebitoModel,
        },
        
      ],
    }).compile();

    service = module.get<NotificacaoService>(NotificacaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});