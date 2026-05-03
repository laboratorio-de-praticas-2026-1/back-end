# Módulos e endpoints

## Resumo

Atualmente, o projeto possui **15 controllers** registrados no `AppModule` e **1 gateway WebSocket** (`chat`).

Dos controllers HTTP, **6 módulos** possuem rotas implementadas no código.

## Endpoints implementados

### Blog

- `POST /blog`
  - Método: `criarPost()`
  - Body: `BlogCreateDto` (multipart/form-data com campo `imagem`)
  - Objetivo: criar uma postagem de blog

- `GET /blog`
  - Método: `getAll()`
  - Objetivo: listar todos os posts

- `GET /blog/:id`
  - Método: `getById(id)`
  - Parâmetros:
    - `id` (number, validado com `ParseIntPipe`)
  - Objetivo: buscar post por identificador

- `PUT /blog/:id`
  - Método: `updateBlog(id)`
  - Parâmetros:
    - `id` (number)
  - Body: `BlogUpdateDto` (multipart/form-data, `imagem` opcional)
  - Objetivo: atualizar dados do post

- `DELETE /blog/:id`
  - Método: `deleteById(id)`
  - Parâmetros:
    - `id` (number)
  - Objetivo: remover post por identificador

### Busca

- `GET /busca/blog/periodo`
  - Método: `buscarBlogsPorIntervaloDeData()`
  - Query params:
    - `de` (date string `YYYY-MM-DD`, opcional)
    - `ate` (date string `YYYY-MM-DD`, opcional)
  - Objetivo: filtrar posts de blog por intervalo de data

- `GET /busca/banner/status`
  - Método: `buscarBannerPorStatus()`
  - Query params:
    - `status` (`ativo` | `inativo`)
  - Objetivo: filtrar banners por status

- `GET /busca/blog/termo`
  - Método: `listarBlog()`
  - Query params:
    - `termo` (string, opcional)
  - Objetivo: buscar posts por termo no titulo/conteudo

- `GET /busca/carrossel/termo`
  - Método: `listarCarrossel()`
  - Query params:
    - `termo` (string, opcional)
  - Objetivo: buscar banners por termo na descricao

### Contato

- `GET /contato`
  - Método: `buscarContato()`
  - Objetivo: retornar dados de contato/empresa

- `GET /contato/:id`
  - Método: `buscarContatoById(id)`
  - Parâmetros:
    - `id` (number, validado com `ParseIntPipe`)
  - Objetivo: retornar registro de contato por identificador

- `PUT /contato/:id`
  - Método: `atualizarContato(id)`
  - Parâmetros:
    - `id` (number, validado com `ParseIntPipe`)
  - Body: `ContatoUpdateDto`
  - Objetivo: atualizar dados de contato

### Header

- `GET /header/carrossel`
  - Método: `getCarrossel()`
  - Objetivo: retornar banners ativos para exibição no carrossel

- `GET /header`
  - Método: `getAll()`
  - Objetivo: listar banners

- `GET /header/:id`
  - Método: `getById(id)`
  - Parâmetros:
    - `id` (number)
  - Objetivo: buscar banner por identificador

- `POST /header`
  - Método: `create()`
  - Body: `HeaderCreateDto` (multipart/form-data com campo `imagem`)
  - Objetivo: criar banner

- `PATCH /header/:id`
  - Método: `update(id)`
  - Parâmetros:
    - `id` (number, validado com `ParseIntPipe`)
  - Body: `HeaderUpdateDto` (multipart/form-data, `imagem` opcional)
  - Objetivo: atualizar banner

- `DELETE /header/:id`
  - Método: `delete(id)`
  - Parâmetros:
    - `id` (number, validado com `ParseIntPipe`)
  - Objetivo: remover banner

### Publicidade

- `GET /publicidade`
  - Método: `getAll()`
  - Objetivo: listar publicidades

- `GET /publicidade/:id`
  - Método: `getById(id)`
  - Parâmetros:
    - `id` (number, validado com `ParseIntPipe`)
  - Objetivo: buscar publicidade por identificador

- `GET /publicidade/status/:status`
  - Método: `getByStatus(status)`
  - Parâmetros:
    - `status` (`ativo` | `inativo`)
  - Objetivo: filtrar publicidades por status

- `POST /publicidade`
  - Método: `criarPublicidade()`
  - Body: `PublicidadeCreateDto` (multipart/form-data com campo `file`)
  - Objetivo: criar publicidade

- `PUT /publicidade/:id`
  - Método: `update(id)`
  - Parâmetros:
    - `id` (number, validado com `ParseIntPipe`)
  - Body: `PublicidadeUpdateDto` (multipart/form-data, `imagem` opcional)
  - Objetivo: atualizar publicidade

- `DELETE /publicidade/:id`
  - Método: `remove(id)`
  - Parâmetros:
    - `id` (number, validado com `ParseIntPipe`)
  - Objetivo: remover publicidade

### Solicitacoes

- `POST /solicitacoes`
  - Método: `criarSolicitacao()`
  - Body: `CreateSolicitacaoDto`
  - Objetivo: criar solicitacao e retornar protocolo

- `GET /solicitacoes`
  - Método: `listarSolicitacoes()`
  - Objetivo: listar solicitacoes do sistema

- `PUT /solicitacoes/:id`
  - Método: `updateSolicitacaoStatus(id)`
  - Parâmetros:
    - `id` (number, validado com `ParseIntPipe`)
  - Body: `UpdateSolicitacaoStatusDto`
    - `status`: `recebido` | `aguardando_pagamento` | `aguardando_documento` | `em_andamento` | `concluido` | `cancelado`
    - `observacaoAdmin` (opcional)
  - Objetivo: atualizar status da solicitacao

- `POST /solicitacoes/:id/documentos`
  - Método: `enviarDocumento(id)`
  - Parâmetros:
    - `id` (number, validado com `ParseIntPipe`)
  - Body: multipart/form-data
    - `tipo_documento` (string)
    - `documento` (arquivo)
  - Objetivo: anexar documento a solicitacao

## Controllers sem endpoints HTTP (estrutura base)

Os controllers abaixo existem e estão registrados no módulo raiz, mas ainda sem rotas HTTP declaradas:

- `dashboard`
- `faq`
- `mapa`
- `notificacao`
- `recomendacao`
- `reports`
- `servicos`
- `simulador`
- `usuario`

## Observações de documentação da API

- Swagger está configurado globalmente em `/swagger`.
- A maior parte dos endpoints ativos já possui decorators Swagger (`@ApiOperation`, `@ApiBody`, `@ApiResponse`).
- Alguns endpoints usam upload multipart/form-data; validar tamanho/tipo de arquivo também no front-end para reduzir erros de integração.
