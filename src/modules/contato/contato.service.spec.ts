import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { ContatoService } from './contato.service';
import { Empresa } from 'src/models/empresa.model';
import { EmpresaDto } from './dto/empresa-response.dto';
import { EmailService } from 'src/infra/email/email.service';

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

  describe('buscarContatoById', () => {
    it('deve retornar EmpresaDto quando encontrar contato por ID', async () => {
      mockEmpresaModel.findOne.mockResolvedValue(mockEmpresa);

      const result = await service.buscarContatoById(1);

      expect(result).toBeInstanceOf(EmpresaDto);
      expect(result.id).toBe(1);
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

      await service.atualizarContato(1, { telefone: '11999999999' });

      expect(mockEmpresaModel.update).toHaveBeenCalled();
    });

    it('deve lançar NotFoundException quando contato não existir', async () => {
      mockEmpresaModel.findOne.mockResolvedValue(null);

      await expect(
        service.atualizarContato(1, { telefone: '11999999999' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});