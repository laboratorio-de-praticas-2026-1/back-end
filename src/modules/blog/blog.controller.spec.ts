import { Test, TestingModule } from '@nestjs/testing';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';

describe('BlogController', () => {
  let controller: BlogController;

  const mockBlogService = {
    criarPost: jest.fn(),
    getAll: jest.fn(),
    getById: jest.fn(),
    deleteById: jest.fn(),
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

    await expect(controller.criarPost(postData)).resolves.toEqual(mockPost);
    expect(mockBlogService.criarPost).toHaveBeenCalledWith(postData);
  });

  it('deve buscar todos os posts do blog com sucesso!', async () => {
    const mockPosts = [
      {
        id: 1,
        titulo: 'Título 1',
        conteudo: 'Conteúdo 1',
        dataPublicacao: new Date(),
        urlImagem: 'http://example.com/1',
      },
      {
        id: 2,
        titulo: 'Título 2',
        conteudo: 'Conteúdo 2',
        dataPublicacao: new Date(),
        urlImagem: 'http://example.com/2',
      },
    ];

    mockBlogService.getAll.mockResolvedValue(mockPosts);

    await expect(controller.getAll()).resolves.toEqual(mockPosts);
    expect(mockBlogService.getAll).toHaveBeenCalledTimes(1);
  });

  it('deve buscar um post do blog por id com sucesso!', async () => {
    const mockPost = {
      id: 1,
      titulo: 'Título do Post',
      conteudo: 'Conteúdo do post',
      dataPublicacao: new Date(),
      urlImagem: 'http://example.com/post',
    };

    mockBlogService.getById.mockResolvedValue(mockPost);

    await expect(controller.getById(1)).resolves.toEqual(mockPost);
    expect(mockBlogService.getById).toHaveBeenCalledWith(1);
  });

  it('deve deletar um post do blog com sucesso!', async () => {
    mockBlogService.deleteById.mockResolvedValue(undefined);

    await expect(controller.deleteById(1)).resolves.toBeUndefined();
    expect(mockBlogService.deleteById).toHaveBeenCalledWith(1);
  });
});
