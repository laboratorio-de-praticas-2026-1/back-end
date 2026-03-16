# Status de implementação

## Panorama atual

| Módulo | Status do service | Endpoints HTTP |
| --- | --- | --- |
| agendamento | stub | não |
| blog | implementado | sim |
| busca | stub | não |
| chat | stub (gateway base) | não |
| contato | implementado | sim |
| dashboard | stub | não |
| faq | stub | não |
| header | stub | não |
| mapa | stub | não |
| notificacao | stub | não |
| publicidade | stub | não |
| recomendacao | stub | não |
| reports | stub | não |
| servicos | stub | não |
| simulador | stub | não |
| usuario | stub | não |

## DTOs existentes

- `blog/dto/blog-create.dto.ts`
- `contato/dto/empresa-response.dto.ts`

## Testes

- Há arquivos unitários `.spec.ts` por módulo.
- Existe suite e2e em `test/`.

## Prioridades técnicas sugeridas

1. Definir endpoints mínimos para módulos stubs com contrato claro de DTO.
2. Padronizar documentação Swagger com `@ApiTags` em todos os controllers.
3. Aumentar cobertura de testes para services com regra de negócio.
4. Documentar eventos do chat quando os handlers WebSocket forem implementados.
