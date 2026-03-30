import { Test, TestingModule } from '@nestjs/testing';
import { BlogService } from './blog.service';
import { getModelToken } from '@nestjs/sequelize';
import { Blog } from 'src/models/blog.model';

describe('BlogService', () => {
  let service: BlogService;

  const mockBlogModel = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogService,
        {
          provide: getModelToken(Blog),
          useValue: mockBlogModel,
        },
      ],
    }).compile();

    service = module.get<BlogService>(BlogService);
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

    mockBlogModel.create.mockResolvedValue(mockPost);

    expect(service.criarPost(postData)).resolves.toEqual(mockPost);
    expect(mockBlogModel.create).toHaveBeenCalledWith(postData);
  });
});
