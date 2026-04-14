import { Test, TestingModule } from '@nestjs/testing';
import { UsuarioController } from './usuario.controller';
import { UsuarioService } from './usuario.service';
import { NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { UsuarioOwnerGuard } from './guards/usuario-owner.guard';

const mockUsuarioService = {
  create: jest.fn(),
  update: jest.fn(),
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
});
