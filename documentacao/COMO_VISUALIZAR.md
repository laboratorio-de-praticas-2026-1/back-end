# Como visualizar a documentacao

## Opcao 1 - Rodar localmente com MkDocs (recomendado)

### 1. Instalar dependencias

```bash
pip install mkdocs mkdocs-material pymdown-extensions
```

### 2. Entrar na pasta da documentacao

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

## Opcao 2 - Gerar build estatico

```bash
cd documentacao
mkdocs build --clean
```

Os arquivos gerados ficam em `documentacao/site/`.

## Opcao 3 - Publicar no GitHub Pages (opcional)

```bash
cd documentacao
mkdocs gh-deploy
```
