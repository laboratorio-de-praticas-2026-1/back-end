import { Test, TestingModule } from '@nestjs/testing';
import { UsuarioService } from './usuario.service';
import { getModelToken } from '@nestjs/sequelize';
import { Usuario } from 'src/models/usuario.model';
import {
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('token_jwt_mock'),
}));

const mockUsuarioToJSON = {
  id: 1,
  nome: 'Davi Mathais',
  email: 'davi@example.com',
  senha: 'hashed_password',
  nivel: 'cliente',
  cpfCnpj: null,
  celular: null,
  dataCadastro: new Date(),
};

const mockUsuario = {
  id: 1,
  nome: 'Davi Mathais',
  email: 'davi@example.com',
  senha: 'hashed_password',
  nivel: 'cliente',
  cpfCnpj: null,
  celular: null,
  dataCadastro: new Date(),
  destroy: jest.fn(),
  update: jest.fn(),
  get: jest.fn().mockReturnValue(mockUsuarioToJSON),
  toJSON: jest.fn().mockReturnValue(mockUsuarioToJSON),
} as any;

const mockUsuarioModel = {
  findByPk: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
};

describe('UsuarioService', () => {
  let service: UsuarioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuarioService,
        {
          provide: getModelToken(Usuario),
          useValue: mockUsuarioModel,
        },
      ],
    }).compile();

    service = module.get<UsuarioService>(UsuarioService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const dtoBase = {
      nome: 'Davi Mathais',
      email: 'davi@example.com',
      senha: 'senha123',
    };

    it('deve criar o usuário com sucesso e retornar sem a senha', async () => {
      mockUsuarioModel.findOne.mockResolvedValue(null);
      mockUsuarioModel.create.mockResolvedValue(mockUsuario);

      const result = await service.create(dtoBase);

      expect(mockUsuarioModel.findOne).toHaveBeenCalledWith({
        where: { email: dtoBase.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(dtoBase.senha, 10);
      expect(mockUsuarioModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          nome: dtoBase.nome,
          email: dtoBase.email,
          senha: 'hashed_password',
        }),
      );
      expect(result).not.toHaveProperty('senha');
    });

    it('deve retornar os campos no formato correto (snake_case)', async () => {
      mockUsuarioModel.findOne.mockResolvedValue(null);
      mockUsuarioModel.create.mockResolvedValue(mockUsuario);

      const result = await service.create(dtoBase);

      expect(result).toHaveProperty('cpf_cnpj');
      expect(result).toHaveProperty('data_cadastro');
    });

    it('deve lançar ConflictException se e-mail já estiver cadastrado', async () => {
      mockUsuarioModel.findOne.mockResolvedValue(mockUsuario);

      await expect(service.create(dtoBase)).rejects.toThrow(ConflictException);
      expect(mockUsuarioModel.create).not.toHaveBeenCalled();
    });

    it('deve lançar InternalServerErrorException se o create falhar', async () => {
      mockUsuarioModel.findOne.mockResolvedValue(null);
      mockUsuarioModel.create.mockRejectedValue(new Error('DB error'));

      await expect(service.create(dtoBase)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

   describe('login', () => {
    const dtoLogin = {
      email: 'davi@example.com',
      senha: 'senha123',
    };

    it('deve retornar token e dados do usuário com credenciais válidas', async () => {
      mockUsuarioModel.findOne.mockResolvedValue(mockUsuario);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(dtoLogin);

      expect(mockUsuarioModel.findOne).toHaveBeenCalledWith({
        where: { email: dtoLogin.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(dtoLogin.senha, mockUsuario.senha);
      expect(result).toEqual({
        message: 'Login realizado com sucesso',
        tokenJWT: 'token_jwt_mock',
        usuario: {
          id: mockUsuario.id,
          nome: mockUsuario.nome,
          email: mockUsuario.email,
          nivel: mockUsuario.nivel,
        },
      });
    });

    it('não deve retornar o campo senha na resposta', async () => {
      mockUsuarioModel.findOne.mockResolvedValue(mockUsuario);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(dtoLogin);

      expect(result.usuario).not.toHaveProperty('senha');
    });

    it('deve lançar UnauthorizedException se o e-mail não existir', async () => {
      mockUsuarioModel.findOne.mockResolvedValue(null);

      await expect(service.login(dtoLogin)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('deve lançar UnauthorizedException se a senha estiver incorreta', async () => {
      mockUsuarioModel.findOne.mockResolvedValue(mockUsuario);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(dtoLogin)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('deve retornar a mesma mensagem de erro para e-mail e senha inválidos', async () => {
      mockUsuarioModel.findOne.mockResolvedValue(null);

      await expect(service.login(dtoLogin)).rejects.toThrow(
        'Email ou senha inválidos',
      );
    });
  });

  describe('remove', () => {
    it('deve remover o usuário do banco e retornar mensagem de sucesso', async () => {
      mockUsuarioModel.findByPk.mockResolvedValue(mockUsuario);
      mockUsuario.destroy.mockResolvedValue(undefined);

      const result = await service.remove(1);

      expect(mockUsuarioModel.findByPk).toHaveBeenCalledWith(1);
      expect(mockUsuario.destroy).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Usuário removido com sucesso!' });
    });

    it('deve lançar NotFoundException se usuário não existir', async () => {
      mockUsuarioModel.findByPk.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('deve atualizar o usuário com sucesso', async () => {
      mockUsuarioModel.findByPk.mockResolvedValue(mockUsuario);
      mockUsuario.update.mockResolvedValue(mockUsuario);

      const dto = { nome: 'Davi Atualizado' };
      const result = await service.update(1, dto);

      expect(mockUsuarioModel.findByPk).toHaveBeenCalledWith(1);
      expect(mockUsuario.update).toHaveBeenCalledWith(dto);

      expect(result).toMatchObject({
        id: mockUsuario.id,
        nome: mockUsuario.nome,
        email: mockUsuario.email,
        nivel: mockUsuario.nivel,
        cpf_cnpj: mockUsuario.cpfCnpj ?? null,
        celular: mockUsuario.celular,
        data_cadastro: mockUsuario.dataCadastro,
      });

      expect(result).not.toHaveProperty('senha');
    });

    it('deve lançar NotFoundException se usuário não existir', async () => {
      mockUsuarioModel.findByPk.mockResolvedValue(null);

      await expect(service.update(99, { nome: 'Teste' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve aplicar hash na senha quando ela for enviada', async () => {
      mockUsuarioModel.findByPk.mockResolvedValue(mockUsuario);
      mockUsuarioModel.findOne.mockResolvedValue(null);
      mockUsuario.update.mockResolvedValue(mockUsuario);

      const dto = { senha: 'nova_senha_123' };
      await service.update(1, dto);

      expect(bcrypt.hash).toHaveBeenCalledWith('nova_senha_123', 10);
      expect(mockUsuario.update).toHaveBeenCalledWith(
        expect.objectContaining({ senha: 'hashed_password' }),
      );
    });

    it('não deve aplicar hash quando senha não for enviada', async () => {
      mockUsuarioModel.findByPk.mockResolvedValue(mockUsuario);
      mockUsuario.update.mockResolvedValue(mockUsuario);

      await service.update(1, { nome: 'Sem senha' });

      expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    it('deve lançar ConflictException se e-mail já estiver em uso por outro usuário', async () => {
      mockUsuarioModel.findByPk.mockResolvedValue(mockUsuario);
      mockUsuarioModel.findOne.mockResolvedValue({
        id: 2,
        email: 'outro@email.com',
      });

      await expect(
        service.update(1, { email: 'outro@email.com' }),
      ).rejects.toThrow(ConflictException);
    });

    it('deve permitir que o usuário reenvie seu próprio e-mail sem conflito', async () => {
      mockUsuarioModel.findByPk.mockResolvedValue(mockUsuario);
      mockUsuarioModel.findOne.mockResolvedValue({
        id: 1,
        email: 'davi@example.com',
      });
      mockUsuario.update.mockResolvedValue(mockUsuario);

      await expect(
        service.update(1, { email: 'davi@example.com' }),
      ).resolves.not.toThrow();
    });
  });
});
