import { Test, TestingModule } from '@nestjs/testing';
import { ContatoController } from './contato.controller';
import { ContatoService } from './contato.service';
import { ForbiddenException } from '@nestjs/common';
import { EmailParams } from 'src/infra/email/dto/email-params';

describe('ContatoController', () => {
  let controller: ContatoController;

  const mockContatoService = {
    buscarContatoById: jest.fn(),
    atualizarContato: jest.fn(),
    enviarEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContatoController],
      providers: [
        {
          provide: ContatoService,
          useValue: mockContatoService,
        },
      ],
    }).compile();

    controller = module.get<ContatoController>(ContatoController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve buscar contato por id (ID = 1) com sucesso', async () => {
    const mockEmpresaDto = {
      id: 1,
      nomeFantasia: 'Empresa Teste',
      cnpj: '00.000.000/0000-00',
      telefone: '(11) 1234-5678',
      email: 'contato@empresatest.com',
      endereco: 'Rua Teste, 123',
      cidade: 'São Paulo',
      estado: 'SP',
      site: 'www.empresa.com',
      tipo: 'clinica',
      latitude: '-23.5505',
      longitude: '-46.6333',
      enderecoCompleto: 'Rua Teste, 123, São Paulo, SP',
    };

    mockContatoService.buscarContatoById.mockResolvedValue(mockEmpresaDto);

    const result = await controller.buscarContatoById(1);

    expect(result).toEqual(mockEmpresaDto);
    expect(mockContatoService.buscarContatoById).toHaveBeenCalledWith(1);
  });

  it('deve bloquear busca quando id for diferente de 1', () => {
    expect(() => controller.buscarContatoById(2)).toThrow(ForbiddenException);

    expect(mockContatoService.buscarContatoById).not.toHaveBeenCalled();
  });

  it('deve atualizar contato quando id = 1', async () => {
    const updateData = { telefone: '11999999999' };
    const mockResponse = { message: 'Contato atualizado com sucesso' };

    mockContatoService.atualizarContato.mockResolvedValue(mockResponse);

    const result = await controller.atualizarContatoById(1, updateData);

    expect(result).toEqual(mockResponse);
    expect(mockContatoService.atualizarContato).toHaveBeenCalledWith(
      1,
      updateData,
    );
  });

  it('deve bloquear atualização quando id for diferente de 1', async () => {
    const updateData = { telefone: '11999999999' };

    await expect(
      controller.atualizarContatoById(2, updateData),
    ).rejects.toThrow(ForbiddenException);

    expect(mockContatoService.atualizarContato).not.toHaveBeenCalled();
  });

  it('deve enviar email com sucesso', async () => {
    const payload: EmailParams = new EmailParams(
      'destinatario@teste.com',
      'contato',
      'Teste de Email',
      {
        nome: 'Victor',
        email: 'victor@email.com',
        telefone: '99999-9999',
        mensagem: 'Olá mundo',
      },
      true,
    );

    mockContatoService.enviarEmail.mockResolvedValue(undefined);

    const result = await controller.enviarEmail(payload);

    expect(result).toEqual({ message: 'E-mail enviado com sucesso' });

    expect(mockContatoService.enviarEmail).toHaveBeenCalledWith(payload);
  });
});