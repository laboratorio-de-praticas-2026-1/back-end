import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { ContatoService } from './contato.service';
import { Empresa } from 'src/models/empresa.model';
import { EmpresaDto } from './dto/empresa-response.dto';

type MockEmpresaModel = {
  findOne: jest.Mock;
  update: jest.Mock;
};

describe('ContatoService', () => {
  let service: ContatoService;
  let mockEmpresaModel: MockEmpresaModel;

  const mockEmpresa = {
    id: 1,
    nomeFantasia: 'Empresa Teste',
    cnpj: '12.345.678/0001-90',
    telefone: '11987654321',
    email: 'contato@empresa.com',
    endereco: 'Rua Teste, 123',
    cidade: 'São Paulo',
    estado: 'SP',
    site: 'www.empresa.com',
  };

  beforeEach(async () => {
    mockEmpresaModel = {
      findOne: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContatoService,
        {
          provide: getModelToken(Empresa),
          useValue: mockEmpresaModel,
        },
      ],
    }).compile();

    service = module.get<ContatoService>(ContatoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('buscarContato', () => {
    it('deve retornar EmpresaDto quando encontrar contato por CNPJ', async () => {
      mockEmpresaModel.findOne.mockResolvedValue(mockEmpresa);

      const result = await service.buscarContato('12.345.678/0001-90');

      expect(result).toBeInstanceOf(EmpresaDto);
      expect(result.cnpj).toBe(mockEmpresa.cnpj);
      expect(result.nomeFantasia).toBe(mockEmpresa.nomeFantasia);
      expect(mockEmpresaModel.findOne).toHaveBeenCalledWith({
        where: { cnpj: '12.345.678/0001-90' },
      });
    });

    it('deve lançar NotFoundException quando contato não for encontrado', async () => {
      mockEmpresaModel.findOne.mockResolvedValue(null);

      await expect(service.buscarContato('12.345.678/0001-99')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('buscarContatoById', () => {
    it('deve retornar EmpresaDto quando encontrar contato por ID e CNPJ', async () => {
      mockEmpresaModel.findOne.mockResolvedValue(mockEmpresa);

      const result = await service.buscarContatoById(1, '12.345.678/0001-90');

      expect(result).toBeInstanceOf(EmpresaDto);
      expect(result.id).toBe(1);
      expect(mockEmpresaModel.findOne).toHaveBeenCalledWith({
        where: { id: 1, cnpj: '12.345.678/0001-90' },
      });
    });

    it('deve lançar NotFoundException quando não encontrar contato por ID e CNPJ', async () => {
      mockEmpresaModel.findOne.mockResolvedValue(null);

      await expect(
        service.buscarContatoById(1, '12.345.678/0001-99'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('atualizarContato', () => {
    it('deve atualizar contato com sucesso', async () => {
      mockEmpresaModel.update.mockResolvedValue([1]);

      const updateData = { telefone: '11999999999' };

      await service.atualizarContato(1, '12.345.678/0001-90', updateData);

      expect(mockEmpresaModel.update).toHaveBeenCalledWith(updateData, {
        where: { id: 1, cnpj: '12.345.678/0001-90' },
      });
    });

    it('deve lançar NotFoundException quando nenhum registro for atualizado', async () => {
      mockEmpresaModel.update.mockResolvedValue([0]);

      const updateData = { telefone: '11999999999' };

      await expect(
        service.atualizarContato(1, '12.345.678/0001-99', updateData),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve atualizar múltiplos campos', async () => {
      mockEmpresaModel.update.mockResolvedValue([1]);

      const updateData = {
        telefone: '11999999999',
        email: 'novo@email.com',
        endereco: 'Novo Endereço, 456',
      };

      await service.atualizarContato(1, '12.345.678/0001-90', updateData);

      expect(mockEmpresaModel.update).toHaveBeenCalledWith(updateData, {
        where: { id: 1, cnpj: '12.345.678/0001-90' },
      });
    });
  });

  describe('toDto', () => {
    it('deve converter Empresa model para EmpresaDto corretamente', async () => {
      mockEmpresaModel.findOne.mockResolvedValue(mockEmpresa);

      const result = await service.buscarContato('12.345.678/0001-90');

      expect(result).toEqual(
        expect.objectContaining({
          id: mockEmpresa.id,
          nomeFantasia: mockEmpresa.nomeFantasia,
          cnpj: mockEmpresa.cnpj,
          telefone: mockEmpresa.telefone,
          email: mockEmpresa.email,
          endereco: mockEmpresa.endereco,
          cidade: mockEmpresa.cidade,
          estado: mockEmpresa.estado,
          site: mockEmpresa.site,
        }),
      );
    });

    it('deve usar valores padrão para campos nulos', async () => {
      const empresaComNulos = {
        id: 2,
        nomeFantasia: null,
        cnpj: null,
        telefone: null,
        email: null,
        endereco: null,
        cidade: null,
        estado: null,
        site: null,
      };

      mockEmpresaModel.findOne.mockResolvedValue(empresaComNulos);

      const result = await service.buscarContato('00.000.000/0000-00');

      expect(result.nomeFantasia).toBe('');
      expect(result.cnpj).toBe('');
      expect(result.telefone).toBe('');
    });
  });
});
