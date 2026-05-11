import { Test, TestingModule } from '@nestjs/testing';
import { ServicosController } from './servicos.controller';
import { ServicosService } from './servicos.service';
import { NotFoundException } from '@nestjs/common';
import { CreateServicoDto } from './dto/servico-create.dto';
import { UpdateServicoDto } from './dto/servico-update.dto';
import { JwtAuthGuard } from '../usuario/guards/jwt-auth.guard';
import { RolesGuard } from '../usuario/guards/roles.guard';

const mockGuard = { canActivate: jest.fn().mockReturnValue(true) };

describe('ServicosController', () => {
  let controller: ServicosController;

  const mockServicosService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    updateServico: jest.fn(),
    deleteServico: jest.fn(),
    createServico: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServicosController],
      providers: [
        {
          provide: ServicosService,
          useValue: mockServicosService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockGuard)
      .compile();

    controller = module.get<ServicosController>(ServicosController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('deve retornar lista de serviços', async () => {
      const mockList = [
        { id: 1, nome: 'Troca de óleo', descricao: 'Serviço de troca de óleo' },
        { id: 2, nome: 'Alinhamento', descricao: 'Serviço de alinhamento' },
      ];
      mockServicosService.findAll.mockResolvedValue(mockList);

      await expect(controller.findAll()).resolves.toEqual(mockList);
      expect(mockServicosService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('deve retornar o serviço quando encontrado', async () => {
      const mockServico = {
        id: 1,
        nome: 'Troca de óleo',
        descricao: 'Serviço de troca de óleo',
      };
      mockServicosService.findOne.mockResolvedValue(mockServico);

      await expect(controller.findOne(1)).resolves.toEqual(mockServico);
      expect(mockServicosService.findOne).toHaveBeenCalledWith(1);
    });

    it('deve propagar NotFoundException quando serviço não encontrado', async () => {
      mockServicosService.findOne.mockRejectedValue(new NotFoundException());

      const promise = controller.findOne(99);
      await expect(promise).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateServico', () => {
    it('deve retornar o serviço atualizado', async () => {
      const id = 1;
      const dto: UpdateServicoDto = { nome: 'Novo Nome' };

      mockServicosService.updateServico.mockResolvedValue({ id: 1, ...dto });

      const result = await controller.updateServico(id, dto);

      expect(result).toEqual({
        message: 'Serviço atualizado com sucesso',
      });
    });
    it('deve propagar erro quando o serviço não for encontrado para atualizar', async () => {
      mockServicosService.updateServico.mockRejectedValue(
        new NotFoundException(),
      );
      const promise = controller.updateServico(1, { nome: 'Teste' });
      await expect(promise).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteServico', () => {
    it('deve deletar um serviço com sucesso', async () => {
      const id = 1;
      mockServicosService.deleteServico.mockResolvedValue(undefined);
      const resultado = await controller.deleteServico(id);
      expect(mockServicosService.deleteServico).toHaveBeenCalledWith(id);
      expect(resultado).toEqual({
        message: 'Serviço removido com sucesso',
      });
    });

    it('deve propagar NotFoundException quando serviço não encontrado para deletar', async () => {
      mockServicosService.deleteServico.mockRejectedValue(
        new NotFoundException(),
      );
      const promise = controller.deleteServico(1);
      await expect(promise).rejects.toThrow(NotFoundException);
    });
  });

  describe('createServico', () => {
    it('deve criar um serviço com sucesso e retornar os dados', async () => {
      const dto: CreateServicoDto = {
        nome: 'Troca de óleo',
        descricao: 'Troca completa do óleo do motor',
        valor_base: 120.5,
        prazo_estimado_dias: 2,
        ativo: true,
        exige_veiculo: true,
      };
      const mockResult = { id: 1, ...dto };

      mockServicosService.createServico.mockResolvedValue(mockResult);

      const result = await controller.createServico(dto);

      expect(mockServicosService.createServico).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockResult);
    });
    it('deve propagar erro quando houver falha na criação do serviço', async () => {
      const dto: CreateServicoDto = {
        nome: 'Erro',
        valor_base: 0,
      } as CreateServicoDto;
      mockServicosService.createServico.mockRejectedValue(
        new Error('Erro interno'),
      );
      const promise = controller.createServico(dto);
      await expect(promise).rejects.toThrow('Erro interno');
    });
  });
});
