# Arquitetura do back-end

## Visao geral

A aplicacao segue o padrao modular do NestJS, com separacao por contexto de negocio em `src/modules`.

## Bootstrap da aplicacao

No `main.ts`, a aplicacao:

1. Cria a instancia Nest
2. Configura Swagger em `/swagger`
3. Habilita CORS aberto
4. Aplica pipe global de validacao
5. Inicia na porta `PORT` (fallback `3000`)

## Modulo raiz

No `app.module.ts`, sao carregados:

- `ConfigModule` global com `.env`
- `SequelizeModule.forRoot(...)` com MySQL
- Modulos de dominio (contato, blog, faq, chat, etc.)

## Camadas e convencoes

Cada modulo segue a estrutura tipica:

- `*.module.ts`: declaracao do modulo
- `*.controller.ts`: exposicao de endpoints
- `*.service.ts`: regra de negocio
- `dto/`: contratos de entrada/saida (quando aplicavel)

## Persistencia

- ORM: Sequelize (`sequelize-typescript`)
- Modelos em `src/models/*.model.ts`
- `autoLoadModels: true`
- `synchronize: false` (nao altera schema automaticamente)
- `timestamps: false` por padrao global

## Integracoes expostas

- API HTTP REST via controllers
- Swagger para documentacao interativa
- WebSocket gateway no modulo `chat`

## Modulos registrados atualmente

- agendamento
- blog
- busca
- chat
- contato
- dashboard
- faq
- header
- mapa
- notificacao
- publicidade
- recomendacao
- reports
- servicos
- simulador
- usuario
