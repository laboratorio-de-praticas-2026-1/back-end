import { Test, TestingModule } from '@nestjs/testing';
import { BlogService } from './blog.service';
import { getModelToken } from '@nestjs/sequelize';
import { Blog, CategoriaBlog } from 'src/models/blog.model';
import { CloudinaryService } from 'src/infra/cloudinary/cloudinary.service';
import { Readable } from 'stream';

describe('BlogService', () => {
  let service: BlogService;

  const mockBlogModel = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
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

    mockBlogModel.create.mockResolvedValue(mockPost);
    mockCloudinaryService.uploadFile.mockResolvedValue({
      secure_url: 'http://example.com/post',
    });

    await expect(service.criarPost(postData, mockFile)).resolves.toEqual(
      mockPost,
    );

    expect(mockCloudinaryService.uploadFile).toHaveBeenCalledWith(mockFile);
    expect(mockBlogModel.create).toHaveBeenCalledWith({
      ...postData,
      urlImagem: 'http://example.com/post',
    });
  });

  it('deve criar post de blog com ativo e categoria padrao no create quando nao fornecidos', async () => {
    const postData = {
      titulo: 'Título do Post',
      conteudo: 'Conteúdo do post',
      dataPublicacao: new Date(),
    };

    const mockPost = {
      id: 2,
      ...postData,
      ativo: true,
      categoria: CategoriaBlog.Documentacao,
      urlImagem: 'http://example.com/post',
    };

    mockBlogModel.create.mockResolvedValue(mockPost);
    mockCloudinaryService.uploadFile.mockResolvedValue({
      secure_url: 'http://example.com/post',
    });

    await expect(service.criarPost(postData, mockFile)).resolves.toEqual(
      mockPost,
    );

    expect(mockBlogModel.create).toHaveBeenCalledWith({
      ...postData,
      ativo: true,
      categoria: CategoriaBlog.Documentacao,
      urlImagem: 'http://example.com/post',
    });
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

    mockBlogModel.findAll.mockResolvedValue(mockPosts);

    await expect(service.getAll()).resolves.toEqual(mockPosts);
    expect(mockBlogModel.findAll).toHaveBeenCalledTimes(1);
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

    mockBlogModel.findByPk.mockResolvedValue(mockPost);

    await expect(service.getById(1)).resolves.toEqual(mockPost);
    expect(mockBlogModel.findByPk).toHaveBeenCalledWith(1);
  });

  it('deve lançar erro ao buscar post do blog por id inexistente', async () => {
    mockBlogModel.findByPk.mockResolvedValue(null);

    await expect(service.getById(999)).rejects.toThrow('Post não encontrado');
    expect(mockBlogModel.findByPk).toHaveBeenCalledWith(999);
  });

  it('deve deletar um post do blog com sucesso', async () => {
    const mockPost = {
      destroy: jest.fn(),
    };

    mockBlogModel.findByPk.mockResolvedValue(mockPost);

    await expect(service.deleteById(1)).resolves.toBeUndefined();

    expect(mockBlogModel.findByPk).toHaveBeenCalledWith(1);
    expect(mockPost.destroy).toHaveBeenCalled();
  });

  it('deve lançar erro ao deletar post inexistente', async () => {
    mockBlogModel.findByPk.mockResolvedValue(null);

    await expect(service.deleteById(999)).rejects.toThrow(
      'Post não encontrado',
    );

    expect(mockBlogModel.findByPk).toHaveBeenCalledWith(999);
  });

  it('deve atualizar um post do blog com sucesso', async () => {
    const postData = {
      titulo: 'Título do Post',
      conteudo: 'Conteúdo do post',
      dataPublicacao: new Date(),
      olhoDoTexto: 'Resumo atualizado',
      categoria: CategoriaBlog.Documentacao,
      ativo: false,
    };

    const mockPost = {
      id: 1,
      update: jest.fn(),
      titulo: 'Título Antigo',
      conteudo: 'Conteúdo Antigo',
      dataPublicacao: new Date(),
      urlImagem: 'http://example.com/old',
      ativo: true,
      categoria: CategoriaBlog.Documentacao,
      olhoDoTexto: 'Resumo antigo',
    };

    mockPost.update.mockResolvedValue({ ...mockPost, ...postData });
    mockBlogModel.findByPk.mockResolvedValue(mockPost);

    await expect(service.updateBlog(1, postData)).resolves.toEqual(mockPost);

    expect(mockBlogModel.findByPk).toHaveBeenCalledWith(1);
    expect(mockPost.update).toHaveBeenCalledWith(postData);
  });

  it('deve lançar erro ao atualizar post inexistente', async () => {
    const postData = {
      titulo: 'Título inexistente',
      conteudo: 'Conteúdo qualquer',
      dataPublicacao: new Date(),
      urlImagem: 'http://example.com/inexistente',
    };

    mockBlogModel.findByPk.mockResolvedValue(null);

    await expect(service.updateBlog(999, postData)).rejects.toThrow(
      'Post não encontrado',
    );

    expect(mockBlogModel.findByPk).toHaveBeenCalledWith(999);
  });
});
