# Back-end

# Guia de Contribuição

Este documento descreve o fluxo de trabalho adotado neste repositório. Siga as etapas abaixo para contribuir de forma organizada.
---
 
## Ambientes de Produção
 
| Branch | URL |
|---|---|
| `main` | https://despachante-bortone-main-production.up.railway.app |
| `develop` | https://despachante-bortone-develop-production.up.railway.app |
| `release` | https://despachante-bortone-release-production.up.railway.app |
 
---

## Estrutura de Branches

```
main
└── develop
      ├── chore/                        ← tarefas técnicas globais
      └── release/entrega-DD-MM         ← entrega do período
              └── short-release/produto ← escopo do produto
                      └── {issue}-{descricao}  ← sua branch (criada pela issue)
```

---

## Passo a Passo

### 1. Encontre sua Issue

Acesse a aba **Issues** do repositório e filtre por `assignee:@me` para ver as issues atribuídas a você.

---

### 2. Leia e analise a tarefa

Antes de começar, leia a issue com atenção e entenda o que precisa ser feito.

---

### 3. Crie a branch pela própria Issue

No painel lateral direito da issue, clique em **"Create a branch"** na seção **Development**.

> **Deixe o nome ser gerado automaticamente** — ele já vem no formato correto baseado no título da issue (ex: `10-feature-preparar-a-seed-para-popular-o-bd`).

**Escolha a origem correta:**

| Repositório | Branch de origem |
|---|---|
| **Back-end** | `short-release/seu-produto` |
| **Database** | `develop` |

Selecione a branch de origem no campo **"Branch source"** e clique em **"Create branch"**.

---

### 4. Faça checkout na branch criada

Após criar, o GitHub mostra o comando. Você pode usar:

```bash
git fetch origin
git checkout nome-da-branch-criada
```

Ou pelo **VSCode** (aba Source Control → trocar branch) ou pelo **GitHub Desktop**.

---

### 5. Desenvolva e commite
(Para desenvolver siga o fluxo de setup do projeto localmente [Guia de Setup Local](#setup-local))

Faça seu trabalho e commite seguindo o padrão [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git add .
git commit -m "feat: descrição do que foi feito"
git push origin nome-da-sua-branch
```

| Prefixo | Uso |
|---|---|
| `feat:` | Nova funcionalidade |
| `fix:` | Correção de bug |
| `chore:` | Tarefa técnica sem impacto funcional |
| `docs:` | Documentação |
| `refactor:` | Refatoração sem mudança de comportamento |
| `test:` | Adição ou ajuste de testes |
| `ci:` | Configuração de CI/CD |

---

### 6. Abra o Pull Request

Na aba **Pull Requests**, clique em **New pull request** e configure:

| Campo | Valor |
|---|---|
| **base** (esquerda) | branch pai (`short-release/seu-produto``) |
| **compare** (direita) | sua branch |

**No corpo do PR:**
- Descreva com detalhes o que foi feito
- Referencie a issue com `closes #numero` para fechá-la automaticamente

**No painel lateral:**
- Solicite a review do seu **PO ou PM** na aba **Reviewers**

---

## Fluxo de Merges

```
sua branch  →  short-release/produto  →  release/entrega-DD-MM  →  develop  →  main
```
```
chore/      →  develop  →  main
```

> O merge entre os níveis acima é responsabilidade do **PO/PM** de cada produto. Sua responsabilidade é abrir o PR da sua branch para a `short-release` do seu produto.

---

## Regras Gerais

- **Nunca faça push direto** em `main`, `develop`, `release/*` ou `short-release/*`
- **Todo merge** deve ser feito via Pull Request com ao menos **1 aprovação**
- **Sempre crie sua branch a partir da Issue** para manter o rastreamento automático
- **Atualize sua branch** com a base antes de abrir o PR para evitar conflitos

---

## Setup Local
``` 
Caso seja necessário rodar o banco de dados localmente, utilize o repositório abaixo:
https://github.com/laboratorio-de-praticas-2026-1/database
Inicialize o banco utilizando Docker Compose e depois siga os passos para iniciar o back-end.
```


### 1. Clone o repositório

```bash
git clone https://github.com/laboratorio-de-praticas-2026-1/back-end.git
```

---

### 2. Instale as dependências

```bash
npm install
```

---

### 3. Crie um arquivo ``` .env ``` seguindo a estrutura de variáveis do ``` .env.example ```

---

### 4. Inicialize o projeto
```bash
npm run start:dev
```
