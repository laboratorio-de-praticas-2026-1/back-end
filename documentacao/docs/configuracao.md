# Configuração do ambiente

## Pre-requisitos

- Node.js 20+
- npm 10+
- Banco MySQL acessível (local via repositório database ou remoto)

## Instalar dependências

```bash
npm install
```

## Variáveis de ambiente

Crie um arquivo `.env` na raiz com base em `.env.example`.

### Exemplo de configuração (desenvolvimento)

```env
DATABASE_HOST=mysql-banco-dev-lp.alwaysdata.net
DATABASE_USERNAME=USERNAME
DATABASE_PASSWORD=SENHA
DATABASE_DB=banco-dev-lp_bortonedev
DATABASE_PORT=3306
PORT=3000
```

> Para banco local, use o compose do repositório de database e ajuste host/credenciais conforme seu ambiente.

## Executar a API

```bash
npm run start:dev
```

A aplicação sobe em `http://localhost:3000` por padrão.

## Swagger

Com a API em execução, acesse:

```text
http://localhost:3000/swagger
```

## Scripts úteis

| Script | Função |
| --- | --- |
| `npm run start:dev` | Executa API em modo watch |
| `npm run build` | Build de produção |
| `npm run start:prod` | Roda build gerado em `dist/` |
| `npm run lint` | Lint com correção automática |
| `npm test` | Testes unitários |
| `npm run test:e2e` | Testes end-to-end |
