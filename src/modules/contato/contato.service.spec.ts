import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { ContatoService } from './contato.service';
import { Empresa } from 'src/models/empresa.model';
import { EmpresaDto } from './dto/empresa-response.dto';
import { EmailEnviado } from 'src/models/email-enviado.model';
import { EmailService } from 'src/infra/email/email.service';

type MockEmpresaModel = {
  findOne: jest.Mock;
  update: jest.Mock;
};

type MockEmailEnviadoModel = {
  create: jest.Mock;
};

type MockEmailService = {
  enviarEmail: jest.Mock;
};

describe('ContatoService', () => {
  let service: ContatoService;
  let mockEmpresaModel: MockEmpresaModel;
  let mockEmailEnviadoModel: MockEmailEnviadoModel;
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

    mockEmailEnviadoModel = {
      create: jest.fn(),
    };

    mockEmailService = {
      enviarEmail: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContatoService,
        {
          provide: getModelToken(Empresa),
          useValue: mockEmpresaModel,
        },
        {
          provide: getModelToken(EmailEnviado),
          useValue: mockEmailEnviadoModel,
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
      mockEmpresaModel.update.mockResolvedValue([1]);

      const updateData = { telefone: '11999999999' };

      await service.atualizarContato(1, updateData);

      expect(mockEmpresaModel.update).toHaveBeenCalledWith(updateData, {
        where: { id: 1 },
      });
    });

    it('deve lançar NotFoundException quando nenhum registro for atualizado', async () => {
      mockEmpresaModel.update.mockResolvedValue([0]);

      const updateData = { telefone: '11999999999' };

      await expect(
        service.atualizarContato(1, updateData),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve atualizar múltiplos campos', async () => {
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

  describe('enviarMensagemContato', () => {
    it('deve enviar mensagem de contato com sucesso', async () => {
      const enviarEmailDto = {
        nome: 'João Silva',
        email: 'joao@example.com',
        assunto: 'Dúvida',
        mensagem: 'Tenho uma dúvida sobre os serviços',
        telefone: '11987654321',
      };

      mockEmailService.enviarEmail.mockResolvedValue(undefined);
      mockEmailEnviadoModel.create.mockResolvedValue({
        nomeUsuario: enviarEmailDto.nome,
        emailUsuario: enviarEmailDto.email,
      });

      process.env.CONTACT_EMAIL = 'contato@empresa.com';

      const result = await service.enviarMensagemContato(enviarEmailDto);

      expect(result.message).toBe('Mensagem de contato enviada com sucesso!');
      expect(mockEmailService.enviarEmail).toHaveBeenCalled();
      expect(mockEmailEnviadoModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          nomeUsuario: enviarEmailDto.nome,
          emailUsuario: enviarEmailDto.email,
          assunto: enviarEmailDto.assunto,
          textoDigitado: enviarEmailDto.mensagem,
        }),
      );
    });

    it('deve lançar erro quando CONTACT_EMAIL não estiver configurado', async () => {
      const enviarEmailDto = {
        nome: 'João Silva',
        email: 'joao@example.com',
        assunto: 'Dúvida',
        mensagem: 'Tenho uma dúvida',
        telefone: '11987654321',
      };

      delete process.env.CONTACT_EMAIL;

      await expect(
        service.enviarMensagemContato(enviarEmailDto),
      ).rejects.toThrow();
    });

    it('deve lançar erro quando falhar ao enviar email', async () => {
      const enviarEmailDto = {
        nome: 'João Silva',
        email: 'joao@example.com',
        assunto: 'Dúvida',
        mensagem: 'Tenho uma dúvida',
        telefone: '11987654321',
      };

      process.env.CONTACT_EMAIL = 'contato@empresa.com';
      mockEmailService.enviarEmail.mockRejectedValue(
        new Error('Erro ao enviar email'),
      );

      await expect(
        service.enviarMensagemContato(enviarEmailDto),
      ).rejects.toThrow();
    });
  });
});

