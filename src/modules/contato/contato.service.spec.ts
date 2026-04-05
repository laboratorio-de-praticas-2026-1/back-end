import { Test, TestingModule } from '@nestjs/testing';
import { ContatoService } from './contato.service';
import { getModelToken } from '@nestjs/sequelize';
import { Empresa } from 'src/models/empresa.model';
import { EmailEnviado } from 'src/models/email-enviado.model';
import { EmailService } from 'src/modules/contato/email.service';

describe('ContatoService', () => {
  let service: ContatoService;

  const mockEmpresaModel = {
    findOne: jest.fn(),
    findByPk: jest.fn(),
  };

  const mockEmailEnviadoModel = {
    create: jest.fn(),
  };

  const mockEmailService = {
    enviarEmail: jest.fn(),
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
  });

  it('deve retornar os dados de contato', async () => {
    const empresaMock = {
      id: 1,
      nomeFantasia: 'Empresa Teste',
      cnpj: '123',
      telefone: '9999',
      email: 'teste@email.com',
      endereco: 'Rua A',
      cidade: 'SP',
      estado: 'SP',
      site: 'empresa.com',
    };

    mockEmpresaModel.findOne.mockResolvedValue(empresaMock);

    const result = await service.buscarContato();

    expect(result.id).toBe(1);
    expect(mockEmpresaModel.findOne).toHaveBeenCalled();
  });
});