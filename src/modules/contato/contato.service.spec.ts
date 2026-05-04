import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { ContatoService } from './contato.service';
import { Empresa } from 'src/models/empresa.model';
import { EmpresaDto } from './dto/empresa-response.dto';
import { EmailService } from 'src/infra/email/email.service';
import { EmailEnviado } from 'src/models/email-enviado.model';

describe('ContatoService', () => {
  let service: ContatoService;

  const mockEmpresaModel = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockEmailService: jest.Mocked<EmailService> = {
    enviarEmail: jest.fn(),
  } as any;

  const mockEmailEnviadoModel = {
    create: jest.fn(),
  };

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

      expect(mockEmpresaModel.update).toHaveBeenCalledWith(
        { telefone: '11999999999' },
        { where: { id: 1 } },
      );
    });

    it('deve lançar NotFoundException quando contato não existir', async () => {
      mockEmpresaModel.findOne.mockResolvedValue(null);

      await expect(
        service.atualizarContato(1, { telefone: '11999999999' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('enviarMensagemContato', () => {
    const dto = {
      nome: 'Lucas',
      email: 'lucas@email.com',
      mensagem: 'Teste mensagem',
      telefone: '11999999999',
    };

    it('deve enviar email e salvar no banco com sucesso', async () => {
      mockEmailService.enviarEmail.mockResolvedValue(undefined);
      mockEmailEnviadoModel.create.mockResolvedValue({});

      const result = await service.enviarMensagemContato(dto);

      expect(mockEmailService.enviarEmail).toHaveBeenCalled();

      expect(mockEmailEnviadoModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          nomeUsuario: dto.nome,
          emailUsuario: dto.email,
          textoDigitado: dto.mensagem,
          assunto: expect.any(String),
        }),
      );

      expect(result).toEqual({
        message: 'Mensagem de contato enviada com sucesso!',
      });
    });

    it('deve lançar erro se envio de email falhar', async () => {
      mockEmailService.enviarEmail.mockRejectedValue(
        new Error('Erro ao enviar'),
      );

      await expect(service.enviarMensagemContato(dto)).rejects.toThrow(
        'Erro ao enviar',
      );

      expect(mockEmailEnviadoModel.create).not.toHaveBeenCalled();
    });
  });
});