import { Test, TestingModule } from '@nestjs/testing';
import { BlogService } from './blog.service';
import { getModelToken } from '@nestjs/sequelize';
import { Blog } from 'src/models/blog.model';
import { CloudinaryService } from 'src/infra/cloudinary/cloudinary.service';
import { Readable } from 'stream';

describe('BlogService', () => {
  let service: BlogService;

  const mockBlogModel = {
    create: jest.fn(),
  };

  const mockCloudinaryService = {
    uploadFile: jest.fn(),
  };

  const mockFile: Express.Multer.File = {
    fieldname: 'imagem',
    originalname: 'imagem.png',
    encoding: '7bit',
    mimetype: 'image/png',
    size: 1024,
    buffer: Buffer.from('fake image'),
    destination: '',
    filename: 'imagem.png',
    path: '',
    stream: new Readable(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogService,
        {
          provide: getModelToken(Blog),
          useValue: mockBlogModel,
        },
        {
          provide: CloudinaryService,
          useValue: mockCloudinaryService,
        },
      ],
    }).compile();

    service = module.get<BlogService>(BlogService);
  });

  it('deve criar post de blog com sucesso!', async () => {
    const postData = {
      titulo: 'Título do Post',
      conteudo: 'Conteúdo do post',
      dataPublicacao: new Date(),
      urlImagem: 'http://example.com/post',
    };

    const mockPost = {
      id: 1,
      ...postData,
    };

    mockBlogModel.create.mockResolvedValue(mockPost);
    mockCloudinaryService.uploadFile.mockResolvedValue({
      secure_url: 'http://example.com/post',
    });

    await service.criarPost(postData, mockFile);

    expect(mockCloudinaryService.uploadFile).toHaveBeenCalledWith(mockFile);
    await expect(service.criarPost(postData, mockFile)).resolves.toEqual(
      mockPost,
    );
    expect(mockBlogModel.create).toHaveBeenCalledWith(postData);
  });
});
