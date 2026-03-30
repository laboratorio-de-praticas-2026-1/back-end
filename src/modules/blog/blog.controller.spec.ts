import { Test, TestingModule } from '@nestjs/testing';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';

describe('BlogController', () => {
  let controller: BlogController;

  const mockBlogService = {
    criarPost: jest.fn(),
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

  it('deve criar post de blog com sucesso!', () => {
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

    expect(controller.criarPost(postData)).resolves.toEqual(mockPost);
    expect(mockBlogService.criarPost).toHaveBeenCalledWith(postData);
  });
});
