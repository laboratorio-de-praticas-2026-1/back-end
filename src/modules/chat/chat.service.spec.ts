import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { Logger } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { Usuario } from 'src/models/usuario.model';

describe('ChatService', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
  });

  afterAll(() => {
    delete process.env.JWT_SECRET;
  });

  let service: ChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: Logger,
          useValue: {
            error: jest.fn(),
          },
        },
        {
          provide: getModelToken(Usuario),
          useValue: {
            findByPk: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
