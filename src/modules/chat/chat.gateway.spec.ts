// eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment

import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { AuthService } from '../../commons/auth.service';
import { Logger } from '@nestjs/common';
import * as timeUtils from './utils/timeUtils';

type MockSocket = { disconnect: jest.Mock };
type MockWs = { role: string; userId: string };

describe('ChatGateway', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
  });

  afterAll(() => {
    delete process.env.JWT_SECRET;
  });

  let gateway: ChatGateway;
  let chatService: ChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        ChatService,
        AuthService,
        {
          provide: Logger,
          useValue: {
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
    chatService = module.get<ChatService>(ChatService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should disconnect connection with invalid token', () => {
    const socket: MockSocket = {
      disconnect: jest.fn(),
    };

    jest.spyOn(chatService, 'verifyToken').mockReturnValue(null);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    (gateway as any).handleConnect(socket, {
      type: 'connect',
      token: 'invalid',
    });

    expect(socket.disconnect).toHaveBeenCalledWith(true);
  });

  it('should send status outside working hours', () => {
    const ws: MockWs = {
      role: 'user',
      userId: 'user-1',
    };

    const sendSpy = jest
      .spyOn(chatService, 'send')
      .mockImplementation(() => {});
    jest.spyOn(timeUtils, 'dentroHorario').mockReturnValue({
      ok: false,
      message: 'Atendimento disponível das 08h às 18h',
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    (gateway as any).handleMessage(ws, { type: 'message', text: 'Olá' });

    expect(sendSpy).toHaveBeenCalledWith(ws, {
      type: 'status',
      msg: 'Atendimento disponível das 08h às 18h',
    });
  });

  it('should send error on empty message text', () => {
    const ws: MockWs = {
      role: 'user',
      userId: 'user-1',
    };

    chatService.users['user-1'] = {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      socket: ws as any,
      nome: 'Usuário de Teste',
      lastActivity: Date.now(),
    };

    const sendSpy = jest
      .spyOn(chatService, 'send')
      .mockImplementation(() => {});
    jest.spyOn(timeUtils, 'dentroHorario').mockReturnValue({ ok: true });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    (gateway as any).handleMessage(ws, { type: 'message', text: '   ' });

    expect(sendSpy).toHaveBeenCalledWith(ws, {
      type: 'error',
      msg: 'Mensagem inválida',
    });
  });

  it('should broadcast user message to agents room through ChatService', () => {
    const ws: MockWs = {
      role: 'user',
      userId: 'user-1',
    };

    chatService.users['user-1'] = {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      socket: ws as any,
      nome: 'Usuário de Teste',
      lastActivity: Date.now(),
    };

    const broadcastSpy = jest
      .spyOn(chatService, 'broadcastAgents')
      .mockImplementation(() => {});

    jest.spyOn(timeUtils, 'dentroHorario').mockReturnValue({ ok: true });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    (gateway as any).handleMessage(ws, { type: 'message', text: 'Olá' });

    expect(broadcastSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'message',
        userId: 'user-1',
        nome: 'Usuário de Teste',
        text: 'Olá',
      }),
    );
  });

  it('should send status when agent message target is offline', () => {
    const ws: MockWs = {
      role: 'agent',
      userId: 'agent-1',
    };

    const sendSpy = jest
      .spyOn(chatService, 'send')
      .mockImplementation(() => {});
    jest.spyOn(timeUtils, 'dentroHorario').mockReturnValue({ ok: true });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    (gateway as any).handleMessage(ws, {
      type: 'message',
      text: 'Olá',
      to: 'user-offline',
    });

    expect(sendSpy).toHaveBeenCalledWith(ws, {
      type: 'status',
      msg: 'Usuário não está online.',
    });
  });

  it('should join user room on user connect', () => {
    const fakeSocket: any = {
      disconnect: jest.fn(),
      join: jest.fn(),
    };

    gateway.server = {
      to: jest.fn().mockReturnValue({ emit: jest.fn() }),
      sockets: {
        adapter: {
          rooms: new Map(),
        },
        sockets: new Map(),
      },
    } as unknown as Server;

    jest.spyOn(chatService, 'verifyToken').mockReturnValue({
      id: 1,
      nivel: 1,
      nome: 'Aluno',
      email: 'a@a.com',
    });

    (gateway as any).handleConnect(fakeSocket, {
      type: 'connect',
      token: 'valid-token',
      nome: 'Usuário Teste',
    });

    expect(fakeSocket.join).toHaveBeenCalledWith(
      expect.stringMatching(/^chat:user:user-/),
    );
  });

  it('should send agent message through user room', () => {
    const ws: MockWs = {
      role: 'agent',
      userId: 'agent-1',
    };

    chatService.users['user-1'] = {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      ws: ws as any,
      nome: 'Usuário de Teste',
      lastActivity: Date.now(),
    };

    const emitSpy = jest.fn();
    gateway.server = {
      to: jest.fn().mockReturnValue({ emit: emitSpy }),
    } as unknown as Server;

    jest.spyOn(timeUtils, 'dentroHorario').mockReturnValue({ ok: true });

    (gateway as any).handleMessage(ws, {
      type: 'message',
      text: 'Olá agent->user',
      to: 'user-1',
    });

    expect(gateway.server.to).toHaveBeenCalledWith('chat:user:user-1');
    expect(emitSpy).toHaveBeenCalledWith('chat', {
      type: 'message',
      text: 'Olá agent->user',
      timestamp: expect.any(String),
    });
  });
});
