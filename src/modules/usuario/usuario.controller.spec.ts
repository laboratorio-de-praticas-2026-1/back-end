import { Test, TestingModule } from '@nestjs/testing';
import { UsuarioController } from './usuario.controller';
import { UsuarioService } from './usuario.service';
import {
  NotFoundException,
  ForbiddenException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsuarioOwnerGuard } from './guards/usuario-owner.guard';

const mockUsuarioService = {
  create: jest.fn(),
  login: jest.fn(),
  remove: jest.fn(),
  update: jest.fn(),
  findAll: jest.fn(),
};

const mockGuard = { canActivate: jest.fn().mockReturnValue(true) };

describe('UsuarioController', () => {
  let controller: UsuarioController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsuarioController],
      providers: [
        {
          provide: UsuarioService,
          useValue: mockUsuarioService,
        },
      ],
    })
      .overrideGuard(UsuarioOwnerGuard)
      .useValue(mockGuard)
      .compile();

    controller = module.get<UsuarioController>(UsuarioController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const dtoBase = {
      nome: 'João Silva',
      email: 'joao@gmail.com',
      senha: 'senha123',
    };

    const respostaMock = {
      id: 1,
      nome: 'João Silva',
      email: 'joao@gmail.com',
      nivel: 'cliente',
      cpf_cnpj: null,
      celular: null,
      data_cadastro: new Date('2026-03-14'),
    };

    it('deve chamar o service com o dto correto e retornar o usuário criado', async () => {
      mockUsuarioService.create.mockResolvedValue(respostaMock);

      const result = await controller.register(dtoBase);

      expect(mockUsuarioService.create).toHaveBeenCalledWith(dtoBase);
      expect(result).toEqual(respostaMock);
    });

    it('não deve retornar o campo senha na resposta', async () => {
      mockUsuarioService.create.mockResolvedValue(respostaMock);

      const result = await controller.register(dtoBase);

      expect(result).not.toHaveProperty('senha');
    });

    it('deve retornar os campos no formato correto (snake_case)', async () => {
      mockUsuarioService.create.mockResolvedValue(respostaMock);

      const result = await controller.register(dtoBase);

      expect(result).toHaveProperty('cpf_cnpj');
      expect(result).toHaveProperty('data_cadastro');
    });

    it('deve propagar ConflictException quando e-mail já estiver cadastrado', async () => {
      mockUsuarioService.create.mockRejectedValue(
        new ConflictException('Esse e-mail já está cadastrado no sistema.'),
      );

      await expect(controller.register(dtoBase)).rejects.toThrow(
        ConflictException,
      );
    });

    it('deve retornar o usuário com cpf_cnpj e celular quando informados', async () => {
      const dtoCompleto = {
        ...dtoBase,
        cpf_cnpj: '12345678901',
        celular: '11999999999',
      };

      const respostaCompleta = {
        ...respostaMock,
        cpf_cnpj: '12345678901',
        celular: '11999999999',
      };

      mockUsuarioService.create.mockResolvedValue(respostaCompleta);

      const result = await controller.register(dtoCompleto);

      expect(result).toEqual(respostaCompleta);
    });
  });

  describe('login', () => {
    const dtoLogin = {
      email: 'joao@gmail.com',
      senha: 'senha123',
    };

    const respostaLoginMock = {
      message: 'Login realizado com sucesso',
      tokenJWT: 'token_jwt_mock',
      usuario: {
        id: 1,
        nome: 'João Silva',
        email: 'joao@gmail.com',
        nivel: 'cliente',
      },
    };

    it('deve chamar o service com o dto correto e retornar o token', async () => {
      mockUsuarioService.login.mockResolvedValue(respostaLoginMock);

      const result = await controller.login(dtoLogin);

      expect(mockUsuarioService.login).toHaveBeenCalledWith(dtoLogin);
      expect(result).toEqual(respostaLoginMock);
    });

    it('deve retornar message, tokenJWT e usuario na resposta', async () => {
      mockUsuarioService.login.mockResolvedValue(respostaLoginMock);

      const result = await controller.login(dtoLogin);

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('tokenJWT');
      expect(result).toHaveProperty('usuario');
    });

    it('não deve retornar o campo senha na resposta', async () => {
      mockUsuarioService.login.mockResolvedValue(respostaLoginMock);

      const result = await controller.login(dtoLogin);

      expect(result.usuario).not.toHaveProperty('senha');
    });

    it('deve propagar UnauthorizedException quando credenciais forem inválidas', async () => {
      mockUsuarioService.login.mockRejectedValue(
        new UnauthorizedException('Email ou senha inválidos'),
      );

      await expect(controller.login(dtoLogin)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('remove', () => {
    it('deve chamar o service com o id correto e retornar mensagem', async () => {
      const resposta = { message: 'Usuário removido com sucesso!' };
      mockUsuarioService.remove.mockResolvedValue(resposta);

      const result = await controller.remove(1);

      expect(mockUsuarioService.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(resposta);
    });

    it('deve propagar NotFoundException quando service lançar', async () => {
      mockUsuarioService.remove.mockRejectedValue(new NotFoundException());

      await expect(controller.remove(99)).rejects.toThrow(NotFoundException);
    });

    it('deve propagar ForbiddenException quando guard lançar', async () => {
      mockUsuarioService.remove.mockRejectedValue(new ForbiddenException());

      await expect(controller.remove(1)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('deve chamar o service com o id e dto corretos', async () => {
      const dto = { nome: 'João Atualizado' };
      const usuarioAtualizado = { id: 1, nome: 'João Atualizado' };

      mockUsuarioService.update.mockResolvedValue(usuarioAtualizado);

      const result = await controller.update(1, dto);

      expect(mockUsuarioService.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(usuarioAtualizado);
    });

    it('deve propagar NotFoundException quando service lançar', async () => {
      mockUsuarioService.update.mockRejectedValue(new NotFoundException());

      await expect(controller.update(99, {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve propagar ForbiddenException quando service lançar', async () => {
      mockUsuarioService.update.mockRejectedValue(new ForbiddenException());

      await expect(controller.update(1, {})).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findAll', () => {
    it('deve retornar uma lista de usuários', async () => {
      const usuarios = [
        {
          id: 1,
          nome: 'Arthur',
          email: 'arthur@email.com',
        },
        {
          id: 2,
          nome: 'João',
          email: 'joao@email.com',
        },
      ];

      mockUsuarioService.findAll.mockResolvedValue(usuarios);

      const result = await controller.findAll();

      expect(mockUsuarioService.findAll).toHaveBeenCalled();
      expect(result).toEqual(usuarios);
    });

    it('deve retornar lista vazia', async () => {
      mockUsuarioService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(mockUsuarioService.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });
});
