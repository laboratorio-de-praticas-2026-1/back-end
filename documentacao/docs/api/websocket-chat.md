# WebSocket - módulo chat

## Estrutura atual

O projeto possui um gateway em `src/modules/chat/chat.gateway.ts` com `@WebSocketGateway()`.

## Estado de implementação

- Gateway registrado: **sim**
- Namespace customizado: **não definido**
- Eventos com `@SubscribeMessage(...)`: **não implementados no momento**

## Impacto atual

No estado atual, a infraestrutura de WebSocket existe apenas como base de projeto, sem handlers de eventos para emissão/escuta.

## Próximo passo recomendado

Quando a funcionalidade de chat for implementada, documentar:

1. Namespace e autenticação do socket
2. Eventos de entrada (`client -> server`)
3. Eventos de saída (`server -> client`)
4. Payloads esperados e códigos de erro
5. Política de reconexão e heartbeat
