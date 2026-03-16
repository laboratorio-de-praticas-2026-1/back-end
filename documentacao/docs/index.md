# Back-end Bortone

Esta documentacao cobre exclusivamente o back-end atual do repositorio, implementado com **NestJS + Sequelize + MySQL**.

## Escopo

- Estrutura de inicializacao da API
- Configuracao de ambiente
- Arquitetura por modulos
- Endpoints HTTP implementados
- Gateway WebSocket
- Modelos Sequelize do dominio
- Status atual de implementacao por modulo

## Tecnologias

| Tecnologia | Funcao |
| --- | --- |
| NestJS 11 | Framework principal da API |
| Sequelize + sequelize-typescript | ORM e mapeamento de modelos |
| MySQL | Banco de dados |
| class-validator / class-transformer | Validacao de DTOs |
| Swagger (`/swagger`) | Exploracao e teste de endpoints |
| Socket.IO via `@nestjs/websockets` | Comunicacao em tempo real |

## Inicio rapido

1. Configurar variaveis de ambiente em `.env` (com base em `.env.example`)
2. Instalar dependencias: `npm install`
3. Rodar a API: `npm run start:dev`
4. Abrir Swagger: `http://localhost:3000/swagger`

## Mapa da documentacao

- **Configuracao do Ambiente**: setup local e variaveis
- **Arquitetura Back-end**: organizacao da aplicacao NestJS
- **API / Modulos e Endpoints**: rotas por controller
- **API / WebSocket (Chat)**: status e estrutura de gateway
- **Dados / Modelos Sequelize**: entidades, campos e relacoes
- **Status de Implementacao**: panorama de modulos implementados e stubs

## Observacao importante

Esta documentacao representa o estado atual do codigo no repositorio. Modulos ainda sem rotas implementadas foram marcados explicitamente como **stub/estrutura base**.
