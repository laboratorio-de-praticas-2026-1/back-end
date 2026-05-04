import { Test, TestingModule } from '@nestjs/testing';
import { ContatoController } from './contato.controller';
import { ContatoService } from './contato.service';

describe('ContatoController', () => {
  let controller: ContatoController;

  const mockContatoService = {
    buscarContato: jest.fn(),
    buscarContatoById: jest.fn(),
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

  //TESTES
  it('deve buscar contato com sucesso', async () => {
    const mockEmpresaDto = {
      id: 1,
      nomeFantasia: 'Empresa Teste',
      cnpj: '00.000.000/0000-00',
      telefone: '(11) 1234-5678',
      email: 'contato@empresatest.com',
    };

    mockContatoService.buscarContato.mockResolvedValue(mockEmpresaDto);

    const result = await controller.buscarContato();

    expect(result).toEqual(mockEmpresaDto);
    expect(mockContatoService.buscarContato).toHaveBeenCalledTimes(1);
  });

  it('deve buscar contato por id com sucesso', async () => {
    const mockEmpresaDto = {
      id: 1,
      nomeFantasia: 'Empresa Teste',
      cnpj: '00.000.000/0000-00',
      telefone: '(11) 1234-5678',
      email: 'contato@empresatest.com',
    };

    mockContatoService.buscarContato.mockResolvedValue(mockEmpresaDto);

    const result = await controller.buscarContato();

    expect(result).toEqual(mockEmpresaDto);
    expect(mockContatoService.buscarContato).toHaveBeenCalledTimes(1);
  });
});
