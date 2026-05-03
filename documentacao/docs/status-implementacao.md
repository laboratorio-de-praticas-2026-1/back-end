# Status de implementação

## Panorama atual

| Módulo | Status do service | Endpoints HTTP |
| --- | --- | --- |
| blog | implementado | sim |
| busca | implementado | sim |
| chat | implementado parcial (gateway ativo) | não |
| contato | implementado | sim |
| dashboard | stub | não |
| faq | stub | não |
| header | implementado | sim |
| mapa | stub | não |
| notificacao | stub | não |
| publicidade | implementado | sim |
| recomendacao | stub | não |
| reports | stub | não |
| servicos | stub | não |
| simulador | stub | não |
| solicitacao | implementado | sim |
| usuario | stub | não |

## DTOs existentes

- `blog/dto/blog-create.dto.ts`
- `contato/dto/empresa-response.dto.ts`
- `busca/dto/busca-blog-intervalo.dto.ts`
- `busca/dto/busca-banner-status.dto.ts`
- `header/dto/header-create.dto.ts`
- `header/dto/header-update.dto.ts`
- `publicidade/dto/publicidade-create.dto.ts`
- `publicidade/dto/publicidade-update.dto.ts`
- `solicitacao/dto/create-solicitacao.dto.ts`
- `solicitacao/dto/update-solicitacao-status.dto.ts`
- `solicitacao/dto/create-documento.dto.ts`

## Testes

- Há arquivos unitários `.spec.ts` por módulo.
- Existe suite e2e em `test/`.

## Prioridades técnicas sugeridas

1. Definir endpoints mínimos para módulos ainda em stub (`dashboard`, `faq`, `mapa`, `notificacao`, `recomendacao`, `reports`, `servicos`, `simulador`, `usuario`).
2. Padronizar respostas de erro e contratos de sucesso entre os módulos já ativos.
3. Aumentar cobertura de testes para services com regra de negócio e fluxos de upload.
4. Formalizar documentação de eventos do chat (payloads, autenticação e regras de uso).
