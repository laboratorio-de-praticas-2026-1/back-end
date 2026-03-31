import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { Readable } from 'stream';
import { CloudinaryService } from 'src/infra/cloudinary/cloudinary.service';
import { Publicidade } from 'src/models/publicidade.model';
import { PublicidadeService } from './publicidade.service';

describe('PublicidadeService', () => {
  let service: PublicidadeService;

  const mockPublicidadeModel = {
    create: jest.fn(),
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
});
