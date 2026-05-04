import { Test, TestingModule } from '@nestjs/testing';
import { Readable } from 'stream';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { CategoriaBlog } from 'src/models/blog.model';
import { AdminGuard } from '../usuario/guards/admin.guard';

const mockGuard = { canActivate: jest.fn().mockReturnValue(true) };

describe('BlogController', () => {
  let controller: BlogController;

  const mockBlogService = {
    criarPost: jest.fn(),
    getAll: jest.fn(),
    getById: jest.fn(),
    deleteById: jest.fn(),
    updateBlog: jest.fn(),
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
    })
      .overrideGuard(AdminGuard)
      .useValue(mockGuard)
      .compile();

    controller = module.get<BlogController>(BlogController);
  });

  it('deve criar post de blog com sucesso', async () => {
    const postData = {
      titulo: 'Título do Post',
      conteudo: 'Conteúdo do post',
      dataPublicacao: new Date(),
      olhoDoTexto: 'Resumo curto',
      categoria: CategoriaBlog.Documentacao,
      ativo: true,
    };

    const mockPost = {
      id: 1,
      ...postData,
      urlImagem: 'http://example.com/post',
    };

    mockBlogService.criarPost.mockResolvedValue(mockPost);

    await expect(controller.criarPost(postData, mockFile)).resolves.toEqual(
      mockPost,
    );
    expect(mockBlogService.criarPost).toHaveBeenCalledWith(postData, mockFile);
  });

  it('deve buscar todos os posts do blog com sucesso', async () => {
    const mockPosts = [
      {
        id: 1,
        titulo: 'Título 1',
        conteudo: 'Conteúdo 1',
        dataPublicacao: new Date(),
        urlImagem: 'http://example.com/1',
        ativo: true,
        categoria: CategoriaBlog.Documentacao,
        olhoDoTexto: 'Resumo 1',
      },
      {
        id: 2,
        titulo: 'Título 2',
        conteudo: 'Conteúdo 2',
        dataPublicacao: new Date(),
        urlImagem: 'http://example.com/2',
        ativo: true,
        categoria: CategoriaBlog.Documentacao,
        olhoDoTexto: 'Resumo 2',
      },
    ];

    mockBlogService.getAll.mockResolvedValue(mockPosts);

    await expect(controller.getAll()).resolves.toEqual(mockPosts);
    expect(mockBlogService.getAll).toHaveBeenCalledTimes(1);
  });

  it('deve buscar um post do blog por id com sucesso', async () => {
    const mockPost = {
      id: 1,
      titulo: 'Título do Post',
      conteudo: 'Conteúdo do post',
      dataPublicacao: new Date(),
      urlImagem: 'http://example.com/post',
      ativo: true,
      categoria: CategoriaBlog.Documentacao,
      olhoDoTexto: 'Resumo',
    };

    mockBlogService.getById.mockResolvedValue(mockPost);

    await expect(controller.getById(1)).resolves.toEqual(mockPost);
    expect(mockBlogService.getById).toHaveBeenCalledWith(1);
  });

  it('deve deletar um post do blog com sucesso', async () => {
    mockBlogService.deleteById.mockResolvedValue(undefined);

    await expect(controller.deleteById(1)).resolves.toBeUndefined();
    expect(mockBlogService.deleteById).toHaveBeenCalledWith(1);
  });

  it('deve atualizar post de blog com sucesso', async () => {
    const postData = {
      titulo: 'Título do Post',
      conteudo: 'Conteúdo do post',
      dataPublicacao: new Date(),
      olhoDoTexto: 'Resumo atualizado',
      categoria: CategoriaBlog.Multas,
      ativo: false,
    };

    const mockPostAtualizado = {
      id: 1,
      urlImagem: 'http://example.com/post',
      ...postData,
    };

    mockBlogService.updateBlog.mockResolvedValue(mockPostAtualizado);

    await expect(controller.updateBlog(1, postData, mockFile)).resolves.toEqual(
      mockPostAtualizado,
    );
    expect(mockBlogService.updateBlog).toHaveBeenCalledWith(
      1,
      postData,
      mockFile,
    );
  });
});
