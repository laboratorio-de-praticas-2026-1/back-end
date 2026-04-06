/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { AuthService, JwtUserPayload } from '../../commons/auth.service';
import { Logger } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { Usuario } from 'src/models/usuario.model';
import * as timeUtils from './utils/timeUtils';
import { NivelUsuarioEnum } from 'src/commons/constantes/nivel-usuario-enum';

type MockAuthSocket = {
  disconnect: jest.Mock;
  join: jest.Mock;
  emit: jest.Mock;
  connected: boolean;
  userId?: string;
  role?: string;
  name?: string;
  handshake?: {
    auth?: { token?: string };
    headers?: { token?: string };
  };
};

describe('ChatGateway', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
  });

  afterAll(() => {
    delete process.env.JWT_SECRET;
  });

  let gateway: ChatGateway;
  let chatService: ChatService;
  let authService: AuthService;

  beforeEach(async () => {
    const mockUsuarioModel = {
      findByPk: jest.fn().mockResolvedValue({
        id: 1,
        nivel: NivelUsuarioEnum.cliente,
        nome: 'Test User',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        ChatService,
        AuthService,
        {
          provide: Logger,
          useValue: {
            error: jest.fn(),
            log: jest.fn(),
          },
        },
        {
          provide: getModelToken(Usuario),
          useValue: mockUsuarioModel,
        },
      ],
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
    chatService = module.get<ChatService>(ChatService);
    authService = module.get<AuthService>(AuthService);

    // Mock gateway.server
    gateway.server = {
      to: jest.fn().mockReturnValue({ emit: jest.fn() }),
      sockets: {
        adapter: {
          rooms: new Map(),
        },
        sockets: new Map(),
      },
    } as any;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should disconnect connection with invalid token', async () => {
    const socket: MockAuthSocket = {
      disconnect: jest.fn(),
      join: jest.fn(),
      emit: jest.fn(),
      connected: true,
      handshake: {
        auth: { token: 'invalid' },
      },
    };

    jest.spyOn(authService, 'verifyToken').mockReturnValue(null);

    await gateway.handleConnection(socket as any);

    expect(socket.disconnect).toHaveBeenCalledWith(true);
  });

  it('should send error on empty message text', () => {
    const socket: MockAuthSocket = {
      disconnect: jest.fn(),
      join: jest.fn(),
      emit: jest.fn(),
      connected: true,
      role: NivelUsuarioEnum.cliente,
      userId: 'user-1',
      name: 'Test User',
    };

    jest.spyOn(timeUtils, 'dentroHorario').mockReturnValue({ ok: true });
    const sendSpy = jest
      .spyOn(chatService, 'send')
      .mockImplementation(() => {});

    gateway.handleChat(
      {
        type: 'message',
        text: '   ',
      },
      socket as any,
    );

    expect(sendSpy).toHaveBeenCalledWith(socket, {
      type: 'error',
      msg: 'A mensagem deve ter entre 1 e 200 caracteres.',
    });
  });

  it('should broadcast user message to agents room through ChatService', () => {
    const socket: MockAuthSocket = {
      disconnect: jest.fn(),
      join: jest.fn(),
      emit: jest.fn(),
      connected: true,
      role: NivelUsuarioEnum.cliente,
      userId: 'user-1',
      name: 'Usuário de Teste',
    };

    chatService.users['user-1'] = {
      socket: socket as any,
      nome: 'Usuário de Teste',
      lastActivity: Date.now(),
    };

    jest.spyOn(timeUtils, 'dentroHorario').mockReturnValue({ ok: true });
    const broadcastSpy = jest
      .spyOn(chatService, 'broadcastAgents')
      .mockImplementation(() => {});

    gateway.handleChat(
      {
        type: 'message',
        text: 'Olá',
      },
      socket as any,
    );

    expect(broadcastSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        fromUserId: 'user-1',
        nome: 'Usuário de Teste',
        text: 'Olá',
        timestamp: expect.any(String),
      }),
    );
  });

  it('should send status when agent message target is offline', () => {
    const socket: MockAuthSocket = {
      disconnect: jest.fn(),
      join: jest.fn(),
      emit: jest.fn(),
      connected: true,
      role: NivelUsuarioEnum.administrador,
      userId: 'agent-1',
    };

    jest.spyOn(timeUtils, 'dentroHorario').mockReturnValue({ ok: true });
    const sendSpy = jest
      .spyOn(chatService, 'send')
      .mockImplementation(() => {});

    gateway.handleChat(
      {
        type: 'message',
        text: 'Olá',
        to: 'user-offline',
      },
      socket as any,
    );

    expect(sendSpy).toHaveBeenCalledWith(socket, {
      type: 'status',
      msg: 'Usuário não está online.',
    });
  });

  it('should join user room on user connect', async () => {
    const socket: MockAuthSocket = {
      disconnect: jest.fn(),
      join: jest.fn(),
      emit: jest.fn(),
      connected: true,
      handshake: {
        auth: { token: 'valid-token' },
      },
    };

    const payload: JwtUserPayload = {
      id: 1,
      nivel: NivelUsuarioEnum.cliente,
      nome: 'Aluno',
      email: 'a@a.com',
    };

    jest.spyOn(authService, 'verifyToken').mockReturnValue(payload);
    jest.spyOn(chatService, 'buscarUsuarioPeloId').mockResolvedValue({
      id: 1,
      nivel: NivelUsuarioEnum.cliente,
      nome: 'Aluno',
    } as any);

    await gateway.handleConnection(socket as any);

    expect(socket.join).toHaveBeenCalledWith(
      expect.stringMatching(/^chat:user:/),
    );
  });

  it('should send agent message through user room', () => {
    const socket: MockAuthSocket = {
      disconnect: jest.fn(),
      join: jest.fn(),
      emit: jest.fn(),
      connected: true,
      role: NivelUsuarioEnum.administrador,
      userId: 'agent-1',
    };

    chatService.users['user-1'] = {
      socket: {} as any,
      nome: 'Usuário de Teste',
      lastActivity: Date.now(),
    };

    jest.spyOn(timeUtils, 'dentroHorario').mockReturnValue({ ok: true });
    const emitSpy = jest.fn();
    gateway.server.to = jest.fn().mockReturnValue({ emit: emitSpy });

    gateway.handleChat(
      {
        type: 'message',
        text: 'Olá agent->user',
        to: 'user-1',
      },
      socket as any,
    );

    expect(gateway.server.to).toHaveBeenCalledWith('chat:user:user-1');
    expect(emitSpy).toHaveBeenCalledWith('chat', {
      type: 'message',
      text: 'Olá agent-&gt;user',
      timestamp: expect.any(String),
    });
  });
});
