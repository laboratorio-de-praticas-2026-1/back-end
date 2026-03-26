# Módulos e endpoints

## Resumo

Atualmente, o projeto possui **15 controllers** registrados. Destes, **2 controllers** possuem endpoints HTTP implementados no código.

## Endpoints implementados

### Blog

- `POST /blog`
  - Método: `criarPost()`
  - Body: `BlogCreateDto`
  - Objetivo: criar uma postagem de blog

### Contato

- `GET /contato`
  - Método: `buscarContato()`
  - Objetivo: retornar dados de contato/empresa

- `GET /contato/:id`
  - Método: `buscarContatoById(id)`
  - Parâmetros:
    - `id` (number, validado com `ParseIntPipe`)
  - Objetivo: retornar registro de contato por identificador

## Controllers sem endpoints HTTP (estrutura base)

Os controllers abaixo existem e estão registrados no módulo raiz, mas ainda sem rotas HTTP declaradas:

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

## Observações de documentação da API

- Swagger está configurado globalmente em `/swagger`.
- Decorators Swagger por endpoint estão presentes principalmente em `contato`.
- Recomendação: adicionar `@ApiTags` e respostas padronizadas em todos os controllers conforme os módulos avançarem.
