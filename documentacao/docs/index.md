# Back-end Bortone

Esta documentação cobre exclusivamente o back-end atual do repositório, implementado com **NestJS + Sequelize + MySQL**.

## Escopo

- Estrutura de inicialização da API
- Configuração de ambiente
- Arquitetura por módulos
- Endpoints HTTP implementados
- Gateway WebSocket
- Modelos Sequelize do domínio
- Status atual de implementação por módulo

## Tecnologias

| Tecnologia | Função |
| --- | --- |
| NestJS 11 | Framework principal da API |
| Sequelize + sequelize-typescript | ORM e mapeamento de modelos |
| MySQL | Banco de dados |
| class-validator / class-transformer | Validação de DTOs |
| Swagger (`/swagger`) | Exploração e teste de endpoints |
| Socket.IO via `@nestjs/websockets` | Comunicação em tempo real |

## Início rápido

1. Configurar variáveis de ambiente em `.env` (com base em `.env.example`)
2. Instalar dependências: `npm install`
3. Rodar a API: `npm run start:dev`
4. Abrir Swagger: `http://localhost:3000/swagger`

## Mapa da documentação

- **Configuração do Ambiente**: setup local e variáveis
- **Arquitetura Back-end**: organização da aplicação NestJS
- **API / Módulos e Endpoints**: rotas por controller
- **API / WebSocket (Chat)**: status e estrutura de gateway
- **Dados / Modelos Sequelize**: entidades, campos e relações
- **Status de Implementação**: panorama de módulos implementados e stubs

## Observação importante

Esta documentação representa o estado atual do código no repositório. Módulos ainda sem rotas implementadas foram marcados explicitamente como **stub/estrutura base**.
