import { Test, TestingModule } from '@nestjs/testing';
import { UsuarioController } from './usuario.controller';
import { UsuarioService } from './usuario.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { UsuarioOwnerGuard } from './guards/usuario-owner.guard';

const mockUsuarioService = {
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
