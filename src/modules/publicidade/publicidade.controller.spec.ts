import { Test, TestingModule } from '@nestjs/testing';
import { Readable } from 'stream';
import { PublicidadeController } from './publicidade.controller';
import { PublicidadeService } from './publicidade.service';

describe('PublicidadeController', () => {
  let controller: PublicidadeController;

  const mockPublicidadeService = {
    getAll: jest.fn(),
    getById: jest.fn(),
    criarPublicidade: jest.fn(),
    remove: jest.fn(),
    update: jest.fn(),
  };

  const mockFile: Express.Multer.File = {
    fieldname: 'file',
    originalname: 'publicidade.png',
    encoding: '7bit',
    mimetype: 'image/png',
    size: 1024,
    buffer: Buffer.from('fake image'),
    destination: '',
    filename: 'publicidade.png',
    path: '',
    stream: new Readable(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublicidadeController],
      providers: [
        {
          provide: PublicidadeService,
          useValue: mockPublicidadeService,
        },
      ],
    }).compile();

    controller = module.get<PublicidadeController>(PublicidadeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('deve listar publicidades com sucesso!', async () => {
    const mockPublicidade = [
      {
        id: 1,
        titulo: 'Nova publicidade',
        conteudo: 'Conteudo da publicidade',
        urlImagem: 'http://example.com/publicidade',
      },
    ];

    mockPublicidadeService.getAll.mockResolvedValue(mockPublicidade);

    await expect(controller.getAll()).resolves.toEqual(mockPublicidade);
    expect(mockPublicidadeService.getAll).toHaveBeenCalled();
  });

  it('deve buscar publicidade por ID com sucesso!', async () => {
    const mockPublicidade = {
      id: 1,
      titulo: 'Nova publicidade',
      conteudo: 'Conteudo da publicidade',
      urlImagem: 'http://example.com/publicidade',
    };

    mockPublicidadeService.getById.mockResolvedValue(mockPublicidade);

    await expect(controller.getById(1)).resolves.toEqual(mockPublicidade);
    expect(mockPublicidadeService.getById).toHaveBeenCalledWith(1);
  });

  it('deve criar publicidade com sucesso!', async () => {
    const publicidadeData = {
      titulo: 'Nova publicidade',
      conteudo: 'Conteudo da publicidade',
    };

    const mockPublicidade = {
      id: 1,
      ...publicidadeData,
      urlImagem: 'http://example.com/publicidade',
    };

    mockPublicidadeService.criarPublicidade.mockResolvedValue(mockPublicidade);

    await expect(
      controller.criarPublicidade(publicidadeData, mockFile),
    ).resolves.toEqual(mockPublicidade);
    expect(mockPublicidadeService.criarPublicidade).toHaveBeenCalledWith(
      publicidadeData,
      mockFile,
    );
  });

  it('deve atualizar publicidade com sucesso!', async () => {
    const updateDto = {
      titulo: 'Publicidade atualizada',
    };
    const mockPublicidade = {
      id: 1,
      titulo: 'Publicidade atualizada',
      conteudo: 'Conteudo da publicidade',
      urlImagem: 'http://example.com/publicidade',
    };

    mockPublicidadeService.update.mockResolvedValue(mockPublicidade);

    await expect(controller.update(1, updateDto, mockFile)).resolves.toEqual(
      mockPublicidade,
    );
    expect(mockPublicidadeService.update).toHaveBeenCalledWith(
      1,
      updateDto,
      mockFile,
    );
  });

  it('deve remover publicidade com sucesso!', async () => {
    mockPublicidadeService.remove.mockResolvedValue(undefined);

    await expect(controller.remove(1)).resolves.toEqual({
      message: 'Publicidade com ID 1 removida com sucesso',
    });
    expect(mockPublicidadeService.remove).toHaveBeenCalledWith(1);
  });
});
