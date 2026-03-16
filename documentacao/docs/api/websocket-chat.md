# WebSocket - modulo chat

## Estrutura atual

O projeto possui um gateway em `src/modules/chat/chat.gateway.ts` com `@WebSocketGateway()`.

## Estado de implementacao

- Gateway registrado: **sim**
- Namespace customizado: **nao definido**
- Eventos com `@SubscribeMessage(...)`: **nao implementados no momento**

## Impacto atual

No estado atual, a infraestrutura de WebSocket existe apenas como base de projeto, sem handlers de eventos para emissao/escuta.

## Proximo passo recomendado

Quando a funcionalidade de chat for implementada, documentar:

1. Namespace e autenticacao do socket
2. Eventos de entrada (`client -> server`)
3. Eventos de saida (`server -> client`)
4. Payloads esperados e codigos de erro
5. Politica de reconexao e heartbeat
