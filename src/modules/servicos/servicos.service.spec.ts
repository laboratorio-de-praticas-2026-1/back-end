/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import { ServicosService } from './servicos.service';
import { getModelToken } from '@nestjs/sequelize';
import { Servico } from 'src/models/servico.model';
import { NotFoundException } from '@nestjs/common';

describe('ServicosService', () => {
  let service: ServicosService;

  const mockServicoModel = {
    findAll: jest.fn(),
    findByPk: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicosService,
        {
          provide: getModelToken(Servico),
          useValue: mockServicoModel,
        },
      ],
    }).compile();

    service = module.get<ServicosService>(ServicosService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('deve criar um novo serviço', () => {
    const resultado = service.criarServico(
      'Troca de óleo',
      'Troca completa do óleo do motor',
      120.5,
      2,
      true,
    );

    expect(resultado).toBeDefined();
    expect(resultado.nome).toBe('Troca de óleo');
    expect(resultado.valor_base).toBe(120.5);
  });
});
