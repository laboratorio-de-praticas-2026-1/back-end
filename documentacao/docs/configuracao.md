# Configuracao do ambiente

## Pre-requisitos

- Node.js 20+
- npm 10+
- Banco MySQL acessivel (local via repositorio database ou remoto)

## Instalar dependencias

```bash
npm install
```

## Variaveis de ambiente

Crie um arquivo `.env` na raiz com base em `.env.example`.

### Exemplo de configuracao (desenvolvimento)

```env
DATABASE_HOST=mysql-banco-dev-lp.alwaysdata.net
DATABASE_USERNAME=USERNAME
DATABASE_PASSWORD=SENHA
DATABASE_DB=banco-dev-lp_bortonedev
DATABASE_PORT=3306
PORT=3000
```

> Para banco local, use o compose do repositorio de database e ajuste host/credenciais conforme seu ambiente.

## Executar a API

```bash
npm run start:dev
```

A aplicacao sobe em `http://localhost:3000` por padrao.

## Swagger

Com a API em execucao, acesse:

```text
http://localhost:3000/swagger
```

## Scripts uteis

| Script | Funcao |
| --- | --- |
| `npm run start:dev` | Executa API em modo watch |
| `npm run build` | Build de producao |
| `npm run start:prod` | Roda build gerado em `dist/` |
| `npm run lint` | Lint com correcao automatica |
| `npm test` | Testes unitarios |
| `npm run test:e2e` | Testes end-to-end |
