# Arquitetura do back-end

## Visão geral

A aplicação segue o padrão modular do NestJS, com separação por contexto de negócio em `src/modules`.

## Bootstrap da aplicação

No `main.ts`, a aplicação:

1. Cria a instância Nest
2. Configura Swagger em `/swagger`
3. Habilita CORS aberto
4. Aplica pipe global de validação
5. Inicia na porta `PORT` (fallback `3000`)

## Módulo raiz

No `app.module.ts`, são carregados:

- `ConfigModule` global com `.env`
- `SequelizeModule.forRoot(...)` com MySQL
- Módulos de domínio (contato, blog, faq, chat, etc.)

## Camadas e convenções

Cada módulo segue a estrutura típica:

- `*.module.ts`: declaração do módulo
- `*.controller.ts`: exposição de endpoints
- `*.service.ts`: regra de negócio
- `dto/`: contratos de entrada/saída (quando aplicável)

## Persistência

- ORM: Sequelize (`sequelize-typescript`)
- Modelos em `src/models/*.model.ts`
- `autoLoadModels: true`
- `synchronize: false` (não altera schema automaticamente)
- `timestamps: false` por padrão global

## Integrações expostas

- API HTTP REST via controllers
- Swagger para documentação interativa
- WebSocket gateway no módulo `chat`

## Módulos registrados atualmente

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
