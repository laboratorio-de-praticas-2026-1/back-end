# Modulos e endpoints

## Resumo

Atualmente, o projeto possui **15 controllers** registrados. Destes, **2 controllers** possuem endpoints HTTP implementados no codigo.

## Endpoints implementados

### Blog

- `POST /blog`
  - Metodo: `criarPost()`
  - Body: `BlogCreateDto`
  - Objetivo: criar uma postagem de blog

### Contato

- `GET /contato`
  - Metodo: `buscarContato()`
  - Objetivo: retornar dados de contato/empresa

- `GET /contato/:id`
  - Metodo: `buscarContatoById(id)`
  - Parametros:
    - `id` (number, validado com `ParseIntPipe`)
  - Objetivo: retornar registro de contato por identificador

## Controllers sem endpoints HTTP (estrutura base)

Os controllers abaixo existem e estao registrados no modulo raiz, mas ainda sem rotas HTTP declaradas:

- `agendamento`
- `busca`
- `dashboard`
- `faq`
- `header`
- `mapa`
- `notificacao`
- `publicidade`
- `recomendacao`
- `reports`
- `servicos`
- `simulador`
- `usuario`

## Observacoes de documentacao da API

- Swagger esta configurado globalmente em `/swagger`.
- Decorators Swagger por endpoint estao presentes principalmente em `contato`.
- Recomendacao: adicionar `@ApiTags` e respostas padronizadas em todos os controllers conforme os modulos avancarem.
