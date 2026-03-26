# Como visualizar a documentação

## Opção 1 - Rodar localmente com MkDocs (recomendado)

### 1. Instalar dependências

```bash
pip install mkdocs mkdocs-material pymdown-extensions
```

### 2. Entrar na pasta da documentação

```bash
cd documentacao
```

### 3. Subir servidor local

```bash
mkdocs serve
```

### 4. Abrir no navegador

```text
http://127.0.0.1:8000
```

## Opção 2 - Gerar build estático

```bash
cd documentacao
mkdocs build --clean
```

Os arquivos gerados ficam em `documentacao/site/`.

## Opção 3 - Publicar no GitHub Pages (opcional)

```bash
cd documentacao
mkdocs gh-deploy
```
