import { Test, TestingModule } from '@nestjs/testing';
import { UsuarioService } from './usuario.service';
import { getModelToken } from '@nestjs/sequelize';
import { Usuario } from 'src/models/usuario.model';
import { NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
}));

const mockUsuario = {
  id: 1,
  nome: 'Davi Mathais',
  email: 'davi@example.com',
  senha: 'hashed_password',
  nivel: 'cliente',
  cpfCnpj: null,
  celular: null,
  dataCadastro: new Date(),
  update: jest.fn(),
};

const mockUsuarioModel = {
  findByPk: jest.fn(),
  findOne: jest.fn(),
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

  describe('update', () => {
    it('deve atualizar o usuário com sucesso', async () => {
      mockUsuarioModel.findByPk.mockResolvedValue(mockUsuario);
      mockUsuario.update.mockResolvedValue(mockUsuario);

      const dto = { nome: 'Davi Atualizado' };
      const result = await service.update(1, dto);

      expect(mockUsuarioModel.findByPk).toHaveBeenCalledWith(1);
      expect(mockUsuario.update).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockUsuario);
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
      mockUsuarioModel.findOne.mockResolvedValue({ id: 2, email: 'outro@email.com' });

      await expect(
        service.update(1, { email: 'outro@email.com' }),
      ).rejects.toThrow(ConflictException);
    });

    it('deve permitir que o usuário reenvie seu próprio e-mail sem conflito', async () => {
      mockUsuarioModel.findByPk.mockResolvedValue(mockUsuario);
      mockUsuarioModel.findOne.mockResolvedValue({ id: 1, email: 'davi@example.com' });
      mockUsuario.update.mockResolvedValue(mockUsuario);

      await expect(
        service.update(1, { email: 'davi@example.com' }),
      ).resolves.not.toThrow();
    });
  });
});