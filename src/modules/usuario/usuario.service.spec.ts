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
import { JwtService } from '@nestjs/jwt';
import { NivelUsuario } from './dto/create-usuario.dto';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn(),
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
  findAll: jest.fn(),
  create: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('token_jwt_mock'),
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
        {
          provide: JwtService,
          useValue: mockJwtService,
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

  describe('createByAdmin', () => {
    const dtoAdmin = {
      nome: 'João Silva',
      email: 'joao@empresa.com',
      senha: 'senhaTemporaria123',
      nivel: NivelUsuario.administrador,
    };

    const mockAdminUsuario = {
      ...mockUsuario,
      nivel: 'administrador',
      toJSON: jest.fn().mockReturnValue({
        ...mockUsuarioToJSON,
        nivel: 'administrador',
      }),
    };

    it('deve criar usuário com o nível definido pelo admin', async () => {
      mockUsuarioModel.findOne.mockResolvedValue(null);
      mockUsuarioModel.create.mockResolvedValue(mockAdminUsuario);

      const result = await service.createByAdmin(dtoAdmin);

      expect(mockUsuarioModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          nome: dtoAdmin.nome,
          email: dtoAdmin.email,
          senha: 'hashed_password',
          nivel: 'administrador',
        }),
      );
      expect(result).not.toHaveProperty('senha');
    });

    it('deve lançar ConflictException se e-mail já estiver cadastrado', async () => {
      mockUsuarioModel.findOne.mockResolvedValue(mockUsuario);

      await expect(service.createByAdmin(dtoAdmin)).rejects.toThrow(
        ConflictException,
      );
      expect(mockUsuarioModel.create).not.toHaveBeenCalled();
    });

    it('deve lançar ConflictException se CPF/CNPJ já estiver cadastrado', async () => {
      mockUsuarioModel.findOne
        .mockResolvedValueOnce(null)       // email livre
        .mockResolvedValueOnce(mockUsuario); // cpf duplicado

      await expect(
        service.createByAdmin({ ...dtoAdmin, cpfCnpj: '00000000000' }),
      ).rejects.toThrow(ConflictException);
      expect(mockUsuarioModel.create).not.toHaveBeenCalled();
    });

    it('deve lançar InternalServerErrorException se o create falhar', async () => {
      mockUsuarioModel.findOne.mockResolvedValue(null);
      mockUsuarioModel.create.mockRejectedValue(new Error('DB error'));

      await expect(service.createByAdmin(dtoAdmin)).rejects.toThrow(
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
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        { id: mockUsuario.id, nivel: mockUsuario.nivel },
        { expiresIn: '1d' },
      );
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

  describe('findOne', () => {
    it('deve retornar um usuário por id sem senha', async () => {
      mockUsuarioModel.findByPk.mockResolvedValue(mockUsuario);

      const result = await service.findOne(1);

      expect(mockUsuarioModel.findByPk).toHaveBeenCalledWith(1, {
        attributes: { exclude: ['senha'] },
      });

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

      await expect(service.findOne(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('deve retornar lista de usuários sem senha', async () => {
      const usuariosMock = [
        {
          get: jest.fn().mockReturnValue({
            id: 1,
            nome: 'Arthur',
            email: 'arthur@email.com',
            senha: 'hashed',
          }),
        },
        {
          get: jest.fn().mockReturnValue({
            id: 2,
            nome: 'João',
            email: 'joao@email.com',
            senha: 'hashed',
          }),
        },
      ];

      mockUsuarioModel.findAll.mockResolvedValue(usuariosMock);

      const result = await service.findAll();

      expect(mockUsuarioModel.findAll).toHaveBeenCalled();

      expect(result[0]).not.toHaveProperty('senha');
      expect(result[1]).not.toHaveProperty('senha');
    });

    it('deve retornar lista vazia', async () => {
      mockUsuarioModel.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(mockUsuarioModel.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });
});
