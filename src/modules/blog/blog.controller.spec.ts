import { Test, TestingModule } from '@nestjs/testing';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { Readable } from 'stream';

describe('BlogController', () => {
  let controller: BlogController;

  const mockBlogService = {
    criarPost: jest.fn(),
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
      controllers: [BlogController],
      providers: [
        {
          provide: BlogService,
          useValue: mockBlogService,
        },
      ],
    }).compile();

    controller = module.get<BlogController>(BlogController);
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

    mockBlogService.criarPost.mockResolvedValue(mockPost);

    await expect(controller.criarPost(postData, mockFile)).resolves.toEqual(
      mockPost,
    );
    expect(mockBlogService.criarPost).toHaveBeenCalledWith(postData, mockFile);
  });
});
