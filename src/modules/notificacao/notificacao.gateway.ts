import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } }) // Permite que o front-end se conecte
export class NotificacaoGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    console.log('WebSocket Gateway Inicializado');
  }

  handleConnection(client: Socket) {
    console.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Cliente desconectado: ${client.id}`);
  }

  // Função que o Service vai usar para disparar a notificação
  enviarNotificacao(evento: string, dados: any) {
    this.server.emit(evento, dados);
  }
  
// BLOCO TEMPORÁRIO PARA TESTE!!!
@SubscribeMessage('me_mande_um_teste')
  handleTest(client: Socket, data: any) {
    console.log('Solicitação de teste múltiplo recebida!');

    // Teste 1: CNH
    this.enviarNotificacao('alerta_cnh', { 
      usuarioId: 1, 
      mensagem: 'Sua CNH vence em 5 dias!', 
      diasRestantes: 5 
    });

    // Teste 2: Licenciamento
    this.enviarNotificacao('alerta_licenciamento', { 
      usuarioId: 1, 
      placa: 'ABC-1234', 
      mensagem: 'Licenciamento próximo!', 
      diasRestantes: 10 
    });

    // Teste 3: Novo Débito
    this.enviarNotificacao('alerta_debito', { 
      usuarioId: 1, 
      placa: 'ABC-1234', 
      valor: 150.50, 
      mensagem: 'Nova multa de trânsito detectada.' 
    });
  }
}