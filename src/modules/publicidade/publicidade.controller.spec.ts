import { Test, TestingModule } from '@nestjs/testing';
import { Readable } from 'stream';
import { PublicidadeController } from './publicidade.controller';
import { PublicidadeService } from './publicidade.service';

describe('PublicidadeController', () => {
  let controller: PublicidadeController;

  const mockPublicidadeService = {
    criarPublicidade: jest.fn(),
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

  it('deve criar publicidade com sucesso!', () => {
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

    expect(
      controller.criarPublicidade(publicidadeData, mockFile),
    ).resolves.toEqual(mockPublicidade);
    expect(mockPublicidadeService.criarPublicidade).toHaveBeenCalledWith(
      publicidadeData,
      mockFile,
    );
  });
});
