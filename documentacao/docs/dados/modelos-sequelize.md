# Modelos Sequelize

## Visão geral

Modelos mapeados em `src/models` usando `sequelize-typescript`.

## Entidades principais

### Banner (`banner`)

- `id` (PK)
- `urlImagem`
- `descricao`
- `ativo`

### Blog (`blog`)

- `id` (PK)
- `titulo`
- `conteudo`
- `dataPublicacao`
- `urlImagem`

### Empresa (`empresa`)

- `id` (PK)
- `nomeFantasia`
- `cnpj`
- `telefone`
- `email`
- `endereco`
- `cidade`
- `estado`
- `site`

### Faq (`faq`)

- `id` (PK)
- `pergunta`
- `resposta`

### Publicidade (`publicidade`)

- `id` (PK)
- `titulo`
- `conteudo`
- `urlImagem`

### Servico (`servico`)

- `id` (PK)
- `nome`
- `descricao`
- `valorBase`
- `prazoEstimadoDias`
- `ativo`

### Usuario (`usuario`)

- `id` (PK)
- `nome`
- `email` (unico)
- `email` (único)
- `senha`
- `nivel` (`cliente` | `administrador`)
- `cpfCnpj`
- `celular`
- `dataCadastro`

### Veiculo (`veiculo`)

- `id` (PK)
- `usuarioId` (FK -> `usuario.id`)
- `placa`
- `renavam`
- `marca`
- `modelo`
- `anoFabricacao`
- `anoModelo`

### Solicitacao (`solicitacao`)

- `id` (PK)
- `usuarioId` (FK -> `usuario.id`)
- `veiculoId` (FK -> `veiculo.id`)
- `servicoId` (FK -> `servico.id`)
- `status` (`recebido`, `aguardando_pagamento`, `aguardando_documento`, `em_andamento`, `concluido`, `cancelado`)
- `observacaoCliente`
- `observacaoAdmin`
- `dataSolicitacao`
- `dataConclusao`

**Relações**

- `Solicitacao` pertence a `Usuario`
- `Solicitacao` pertence a `Veiculo`
- `Solicitacao` pertence a `Servico`

### DocumentoSolicitacao (`documento_solicitacao`)

- `id` (PK)
- `solicitacaoId` (FK -> `solicitacao.id`)
- `nomeHash`
- `tipoDocumento`
- `statusValidacao` (`pendente`, `aprovado`, `rejeitado`)
- `dataUpload`

## Observação sobre schema

O back-end está configurado com `synchronize: false`. Alterações de estrutura devem ser feitas via processo oficial do repositório de banco de dados/migrações.
