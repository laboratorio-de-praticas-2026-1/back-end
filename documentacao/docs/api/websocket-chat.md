# WebSocket - módulo chat

## Estrutura atual

O projeto possui um gateway em `src/modules/chat/chat.gateway.ts` com `@WebSocketGateway()`.

## Estado de implementação

- Gateway registrado: **sim**
- Namespace customizado: **não definido**
- Evento com `@SubscribeMessage(...)`: **implementado** (`chat`)
- Autenticação por token no handshake: **sim**
- Controle de regras de envio: **sim** (cooldown, rate limit e bloqueio de duplicadas)

## Evento principal

### Entrada (`client -> server`)

- Evento: `chat`
- Payload esperado (resumo):
	- `type`: atualmente tratado para `message`
	- `text`: texto da mensagem
	- `to`: id do usuario destino (quando remetente e atendente)

### Saida (`server -> client`)

Mensagens sao emitidas no evento `chat`, com tipos como:

- `status`
- `history`
- `users`
- `agents`
- `message`
- `error`

## Regras de comunicacao atuais

- Conexao exige token valido no handshake (`auth.token` ou header `token`).
- Usuarios sao separados por perfil (cliente x administrador).
- Janela de funcionamento validada por horario (`dentroHorario`).
- Cooldown entre mensagens: 3 segundos.
- Rate limit: ate 10 mensagens por minuto por usuario.
- Bloqueio de mensagens duplicadas em janela curta.
- Sanitizacao basica do texto para reduzir risco de injecao HTML.

## Próximo passo recomendado

Para evolucao da documentacao, detalhar:

1. Namespace e autenticação do socket
2. Contrato completo de payload por tipo de evento (`chat`)
3. Eventos de saída (`server -> client`) com exemplos reais
4. Payloads esperados e códigos de erro
5. Politica de reconexao e heartbeat
