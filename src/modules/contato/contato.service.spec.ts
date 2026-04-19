import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { ContatoService } from './contato.service';
import { Empresa } from 'src/models/empresa.model';
import { EmpresaDto } from './dto/empresa-response.dto';
import { EmailService } from 'src/infra/email/email.service';
import { EmailParams } from 'src/infra/email/dto/email-params';

type MockEmpresaModel = {
  findOne: jest.Mock;
  update: jest.Mock;
};

type MockEmailService = {
  enviarEmail: jest.Mock;
};

describe('ContatoService', () => {
  let service: ContatoService;
  let mockEmpresaModel: MockEmpresaModel;
  let mockEmailService: MockEmailService;

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
    tipo: 'clinica',
    latitude: '-23.5505',
    longitude: '-46.6333',
  };

  beforeEach(async () => {
    mockEmpresaModel = {
      findOne: jest.fn(),
      update: jest.fn(),
    };

    mockEmailService = {
      enviarEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContatoService,
        {
          provide: getModelToken(Empresa),
          useValue: mockEmpresaModel,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    service = module.get<ContatoService>(ContatoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('enviarEmail', () => {
    it('deve chamar EmailService.enviarEmail corretamente', async () => {
      const payload: EmailParams = new EmailParams(
        'destino@teste.com',
        'contato',
        'Teste',
        {
          nome: 'Victor',
          email: 'victor@email.com',
          mensagem: 'Olá mundo',
        },
        true,
      );

      mockEmailService.enviarEmail.mockResolvedValue(undefined);

      await service.enviarEmail(payload);

      expect(mockEmailService.enviarEmail).toHaveBeenCalledWith(payload);
      expect(mockEmailService.enviarEmail).toHaveBeenCalledTimes(1);
    });

    it('deve propagar erro do EmailService', async () => {
      mockEmailService.enviarEmail.mockRejectedValue(new Error('Erro email'));

      const payload: EmailParams = new EmailParams(
        'destino@teste.com',
        'contato',
        'Erro',
        {
          nome: 'Victor',
          email: 'victor@email.com',
          mensagem: 'teste',
        },
        true,
      );

      await expect(service.enviarEmail(payload)).rejects.toThrow('Erro email');
    });
  });

  describe('buscarContatoById', () => {
    it('deve retornar EmpresaDto quando encontrar contato por ID', async () => {
      mockEmpresaModel.findOne.mockResolvedValue(mockEmpresa);

      const result = await service.buscarContatoById(1);

      expect(result).toBeInstanceOf(EmpresaDto);
      expect(result.id).toBe(1);
      expect(result.tipo).toBe('clinica');
      expect(result.latitude).toBe('-23.5505');

      expect(mockEmpresaModel.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('deve lançar NotFoundException quando não encontrar contato', async () => {
      mockEmpresaModel.findOne.mockResolvedValue(null);

      await expect(service.buscarContatoById(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('atualizarContato', () => {
    it('deve atualizar contato com sucesso', async () => {
      mockEmpresaModel.findOne.mockResolvedValue(mockEmpresa);
      mockEmpresaModel.update.mockResolvedValue([1]);

      const updateData = { telefone: '11999999999' };

      await service.atualizarContato(1, updateData);

      expect(mockEmpresaModel.update).toHaveBeenCalledWith(updateData, {
        where: { id: 1 },
      });
    });

    it('deve lançar NotFoundException quando contato não existir', async () => {
      mockEmpresaModel.findOne.mockResolvedValue(null);

      const updateData = { telefone: '11999999999' };

      await expect(service.atualizarContato(1, updateData)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockEmpresaModel.update).not.toHaveBeenCalled();
    });

    it('deve atualizar múltiplos campos', async () => {
      mockEmpresaModel.findOne.mockResolvedValue(mockEmpresa);
      mockEmpresaModel.update.mockResolvedValue([1]);

      const updateData = {
        telefone: '11999999999',
        email: 'novo@email.com',
        endereco: 'Novo Endereço, 456',
        tipo: 'vistoria',
      };

      await service.atualizarContato(1, updateData);

      expect(mockEmpresaModel.update).toHaveBeenCalledWith(updateData, {
        where: { id: 1 },
      });
    });
  });

  describe('toDto', () => {
    it('deve converter Empresa model para EmpresaDto corretamente', async () => {
      mockEmpresaModel.findOne.mockResolvedValue(mockEmpresa);

      const result = await service.buscarContatoById(1);

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
          tipo: mockEmpresa.tipo,
          latitude: mockEmpresa.latitude,
          longitude: mockEmpresa.longitude,
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
        tipo: null,
        latitude: null,
        longitude: null,
      };

      mockEmpresaModel.findOne.mockResolvedValue(empresaComNulos);

      const result = await service.buscarContatoById(2);

      expect(result.nomeFantasia).toBe('');
      expect(result.cnpj).toBe('');
      expect(result.telefone).toBe('');
      expect(result.tipo).toBe('');
      expect(result.latitude).toBe('');
    });
  });
});