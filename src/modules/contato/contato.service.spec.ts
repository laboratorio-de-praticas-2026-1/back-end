import { Test, TestingModule } from '@nestjs/testing';
import { ContatoService } from './contato.service';
import { getModelToken } from '@nestjs/sequelize';
import { Empresa } from 'src/models/empresa.model';

describe('ContatoService', () => {
  let service: ContatoService;

  const mockEmpresaModel = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
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

  it('deve retornar os dados de contato pelo CNPJ', async () => {
    const empresaMock = {
      id: 1,
      nomeFantasia: 'Empresa Teste',
      cnpj: '12345678000100',
      telefone: '9999',
      email: 'teste@email.com',
      endereco: 'Rua A',
      cidade: 'SP',
      estado: 'SP',
      site: 'empresa.com',
    };

    mockEmpresaModel.findOne.mockResolvedValue(empresaMock);

    const result = await service.buscarContato('12345678000100');

    expect(result).toMatchObject({
      id: 1,
      nomeFantasia: 'Empresa Teste',
      cnpj: '12345678000100',
    });

    expect(mockEmpresaModel.findOne).toHaveBeenCalledWith({
      where: { cnpj: '12345678000100' },
    });
  });

  it('deve buscar empresa por ID e CNPJ', async () => {
    const empresaMock = {
      id: 1,
      cnpj: '12345678000100',
    };

    mockEmpresaModel.findOne.mockResolvedValue(empresaMock);

    const result = await service.buscarContatoById(1, '12345678000100');

    expect(result).toMatchObject({
      id: 1,
      cnpj: '12345678000100',
    });

    expect(mockEmpresaModel.findOne).toHaveBeenCalledWith({
      where: { id: 1, cnpj: '12345678000100' },
    });
  });

  it('deve atualizar contato com sucesso', async () => {
    mockEmpresaModel.update.mockResolvedValue([1]); // 1 linha afetada

    await service.atualizarContato(1, '12345678000100', {
      nomeFantasia: 'Novo Nome',
    });

    expect(mockEmpresaModel.update).toHaveBeenCalledWith(
      { nomeFantasia: 'Novo Nome' },
      {
        where: { id: 1, cnpj: '12345678000100' },
      },
    );
  });

  it('deve lançar erro se não encontrar empresa no update', async () => {
    mockEmpresaModel.update.mockResolvedValue([0]);

    await expect(
      service.atualizarContato(1, '12345678000100', {}),
    ).rejects.toThrow('Contato não encontrado');
  });
});