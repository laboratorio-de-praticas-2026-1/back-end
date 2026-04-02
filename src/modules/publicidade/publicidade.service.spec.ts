import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Readable } from 'stream';
import { CloudinaryService } from 'src/infra/cloudinary/cloudinary.service';
import { Publicidade } from 'src/models/publicidade.model';
import { PublicidadeService } from './publicidade.service';

describe('PublicidadeService', () => {
  let service: PublicidadeService;

  const mockPublicidadeModel = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
  };

  const mockCloudinaryService = {
    uploadFile: jest.fn(),
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
      providers: [
        PublicidadeService,
        {
          provide: getModelToken(Publicidade),
          useValue: mockPublicidadeModel,
        },
        {
          provide: CloudinaryService,
          useValue: mockCloudinaryService,
        },
      ],
    }).compile();

    service = module.get<PublicidadeService>(PublicidadeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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

    mockPublicidadeModel.create.mockResolvedValue(mockPublicidade);
    mockCloudinaryService.uploadFile.mockResolvedValue({
      secure_url: 'http://example.com/publicidade',
    });

    await expect(
      service.criarPublicidade(publicidadeData, mockFile),
    ).resolves.toEqual(mockPublicidade);
    expect(mockCloudinaryService.uploadFile).toHaveBeenCalledWith(mockFile);
    expect(mockPublicidadeModel.create).toHaveBeenCalledWith({
      ...publicidadeData,
      urlImagem: 'http://example.com/publicidade',
    });
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

    mockPublicidadeModel.findAll.mockResolvedValue(mockPublicidade);

    await expect(service.getAll()).resolves.toEqual(mockPublicidade);
    expect(mockPublicidadeModel.findAll).toHaveBeenCalled();
  });

  it('deve buscar publicidade por ID com sucesso!', async () => {
    const mockPublicidade = {
      id: 1,
      titulo: 'Nova publicidade',
      conteudo: 'Conteudo da publicidade',
      urlImagem: 'http://example.com/publicidade',
    };

    mockPublicidadeModel.findByPk.mockResolvedValue(mockPublicidade);

    await expect(service.getById(1)).resolves.toEqual(mockPublicidade);
    expect(mockPublicidadeModel.findByPk).toHaveBeenCalledWith(1);
  });

  it('deve falhar ao buscar publicidade inexistente!', async () => {
    mockPublicidadeModel.findByPk.mockResolvedValue(null);

    await expect(service.getById(999)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(mockPublicidadeModel.findByPk).toHaveBeenCalledWith(999);
  });

  it('deve remover publicidade com sucesso!', async () => {
    const destroy = jest.fn().mockResolvedValue(undefined);

    mockPublicidadeModel.findByPk.mockResolvedValue({ destroy });

    await expect(service.remove(1)).resolves.toBeUndefined();
    expect(mockPublicidadeModel.findByPk).toHaveBeenCalledWith(1);
    expect(destroy).toHaveBeenCalled();
  });

  it('deve falhar ao remover publicidade inexistente!', async () => {
    mockPublicidadeModel.findByPk.mockResolvedValue(null);

    await expect(service.remove(999)).rejects.toBeInstanceOf(NotFoundException);
    expect(mockPublicidadeModel.findByPk).toHaveBeenCalledWith(999);
  });
});
