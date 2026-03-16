# Status de implementacao

## Panorama atual

| Modulo | Status do service | Endpoints HTTP |
| --- | --- | --- |
| agendamento | stub | nao |
| blog | implementado | sim |
| busca | stub | nao |
| chat | stub (gateway base) | nao |
| contato | implementado | sim |
| dashboard | stub | nao |
| faq | stub | nao |
| header | stub | nao |
| mapa | stub | nao |
| notificacao | stub | nao |
| publicidade | stub | nao |
| recomendacao | stub | nao |
| reports | stub | nao |
| servicos | stub | nao |
| simulador | stub | nao |
| usuario | stub | nao |

## DTOs existentes

- `blog/dto/blog-create.dto.ts`
- `contato/dto/empresa-response.dto.ts`

## Testes

- Ha arquivos unitarios `.spec.ts` por modulo.
- Existe suite e2e em `test/`.

## Prioridades tecnicas sugeridas

1. Definir endpoints minimos para modulos stubs com contrato claro de DTO.
2. Padronizar documentacao Swagger com `@ApiTags` em todos os controllers.
3. Aumentar cobertura de testes para services com regra de negocio.
4. Documentar eventos do chat quando os handlers WebSocket forem implementados.
