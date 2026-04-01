import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Usuario } from '../../models/usuario.model';
import { Veiculo } from '../../models/veiculo.model';
import { EmailService } from './email.service';

export interface NotificacaoDTO {
  usuarioId: number;
  tipo: 'ALERTA_CNH' | 'ALERTA_LICENCIAMENTO' | 'ALERTA_DEBITO';
  titulo: string;
  mensagem: string;
  descricaoDetalhada?: string;
  placaVeiculo?: string;
  valorDebito?: number;
  diasRestantes?: number;
  dataVencimento?: Date;
}

@Injectable()
export class NotificacaoService {
  private readonly logger = new Logger(NotificacaoService.name);

  constructor(
    @InjectModel(Usuario)
    private usuarioModel: typeof Usuario,
    @InjectModel(Veiculo)
    private veiculoModel: typeof Veiculo,
    private readonly emailService: EmailService,
  ) {}

  /*
    Busca configurações de notificação do usuário
   */
  async buscarConfiguracoes(usuarioId: number) {
    const usuario = await this.usuarioModel.findByPk(usuarioId);

    if (!usuario) {
      throw new NotFoundException(`Usuário com ID ${usuarioId} não encontrado`);
    }

    return {
      notificacoesAtivas: usuario.notificacoesAtivas,
      diasAvisoCnh: usuario.diasAvisoCnh,
      diasAvisoLicenciamento: usuario.diasAvisoLicenciamento,
      notificarDebitos: usuario.notificarDebitos,
      enviarEmail: usuario.enviarEmail,
    };
  }

  /*
    Atualiza configurações de notificação
   */
  async atualizarConfiguracoes(usuarioId: number, configuracoes: any) {
    const usuario = await this.usuarioModel.findByPk(usuarioId);

    if (!usuario) {
      throw new NotFoundException(`Usuário com ID ${usuarioId} não encontrado`);
    }

    await usuario.update({
      notificacoesAtivas: configuracoes.notificacoesAtivas ?? usuario.notificacoesAtivas,
      diasAvisoCnh: configuracoes.diasAvisoCnh ?? usuario.diasAvisoCnh,
      diasAvisoLicenciamento: configuracoes.diasAvisoLicenciamento ?? usuario.diasAvisoLicenciamento,
      notificarDebitos: configuracoes.notificarDebitos ?? usuario.notificarDebitos,
      enviarEmail: configuracoes.enviarEmail ?? usuario.enviarEmail,
    });

    this.logger.log(`Configurações atualizadas para usuário ${usuarioId}`);
    return usuario;
  }

  /*
    Verifica se CNH está vencendo e retorna dados
   */
  async verificarVencimentoCNH(usuarioId: number): Promise<any> {
    const usuario = await this.usuarioModel.findByPk(usuarioId);

    if (!usuario) {
      throw new NotFoundException(`Usuário com ID ${usuarioId} não encontrado`);
    }

    if (!usuario.dataVencimentoCnh) {
      return null;
    }

    const agora = new Date();
    const dataVencimento = new Date(usuario.dataVencimentoCnh);
    const diasRestantes = Math.ceil(
      (dataVencimento.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diasRestantes > 0 && diasRestantes <= usuario.diasAvisoCnh) {
      return {
        usuarioId,
        tipo: 'ALERTA_CNH',
        titulo: '⚠️ Sua CNH vence em breve',
        mensagem: `Sua CNH vence em ${diasRestantes} dias`,
        descricaoDetalhada: `A Carteira Nacional de Habilitação está com vencimento próximo. Data de vencimento: ${dataVencimento.toLocaleDateString('pt-BR')}. Procure renovar sua CNH para evitar multas.`,
        diasRestantes,
        dataVencimento,
      };
    }

    return null;
  }

  /*
    Verifica se licenciamento está vencendo
   */
  async verificarVencimentoLicenciamento(usuarioId: number): Promise<any[]> {
    const veiculos = await this.veiculoModel.findAll({
      where: { usuarioId },
    });

    const notificacoes = [];

    for (const veiculo of veiculos) {
      if (!veiculo.dataLicenciamentoVencimento) {
        continue;
      }

      const usuario = await this.usuarioModel.findByPk(usuarioId);
      const agora = new Date();
      const dataVencimento = new Date(veiculo.dataLicenciamentoVencimento);
      const diasRestantes = Math.ceil(
        (dataVencimento.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (diasRestantes > 0 && diasRestantes <= usuario!.diasAvisoLicenciamento) {
        notificacoes.push({
          usuarioId,
          tipo: 'ALERTA_LICENCIAMENTO',
          titulo: '⚠️ Licenciamento do veículo vence em breve',
          mensagem: `Licenciamento da placa ${veiculo.placa} vence em ${diasRestantes} dias`,
          descricaoDetalhada: `O licenciamento do veículo ${veiculo.placa} está com vencimento próximo. Data: ${dataVencimento.toLocaleDateString('pt-BR')}.`,
          placaVeiculo: veiculo.placa,
          diasRestantes,
          dataVencimento,
          veiculoId: veiculo.id,
        });
      }
    }

    return notificacoes;
  }

  /*
    Verifica débitos pendentes
   */
  async verificarDebitos(usuarioId: number): Promise<any[]> {
    const veiculos = await this.veiculoModel.findAll({
      where: { usuarioId, possuiDebitos: true },
    });

    const notificacoes = [];

    for (const veiculo of veiculos) {
      if (veiculo.valorDebitoTotal && veiculo.valorDebitoTotal > 0) {
        notificacoes.push({
          usuarioId,
          tipo: 'ALERTA_DEBITO',
          titulo: '💰 Novo débito registrado',
          mensagem: `Débito de R$ ${veiculo.valorDebitoTotal.toFixed(2)} para a placa ${veiculo.placa}`,
          descricaoDetalhada: `Um débito foi registrado para o veículo ${veiculo.placa}. Valor: R$ ${veiculo.valorDebitoTotal.toFixed(2)}. Regularize o débito para evitar multas.`,
          placaVeiculo: veiculo.placa,
          valorDebito: veiculo.valorDebitoTotal,
          dataUltimoDebito: veiculo.dataUltimoDebito,
          veiculoId: veiculo.id,
        });
      }
    }

    return notificacoes;
  }

  /*
    Atualiza data de vencimento de CNH
   */
  async atualizarDataVencimentoCNH(usuarioId: number, dataVencimento: Date) {
    const usuario = await this.usuarioModel.findByPk(usuarioId);

    if (!usuario) {
      throw new NotFoundException(`Usuário com ID ${usuarioId} não encontrado`);
    }

    await usuario.update({
      dataVencimentoCnh: dataVencimento,
    });

    this.logger.log(`Data de vencimento de CNH atualizada para usuário ${usuarioId}`);
    return usuario;
  }

  /*
    Atualiza data de licenciamento do veículo
   */
  async atualizarDataLicenciamento(veiculoId: number, dataVencimento: Date) {
    const veiculo = await this.veiculoModel.findByPk(veiculoId);

    if (!veiculo) {
      throw new NotFoundException(`Veículo com ID ${veiculoId} não encontrado`);
    }

    await veiculo.update({
      dataLicenciamentoVencimento: dataVencimento,
    });

    this.logger.log(`Data de licenciamento atualizada para veículo ${veiculoId}`);
    return veiculo;
  }

  /*
    Atualiza débito do veículo
   */
  async atualizarDebito(veiculoId: number, valor: number, descricao?: string) {
    const veiculo = await this.veiculoModel.findByPk(veiculoId);

    if (!veiculo) {
      throw new NotFoundException(`Veículo com ID ${veiculoId} não encontrado`);
    }

    await veiculo.update({
      possuiDebitos: valor > 0,
      valorDebitoTotal: valor,
      dataUltimoDebito: new Date(),
    });

    this.logger.log(`Débito atualizado para veículo ${veiculoId}: R$ ${valor}`);
    return veiculo;
  }

  /*
    Limpa débito do veículo
   */
  async limparDebito(veiculoId: number) {
    const veiculo = await this.veiculoModel.findByPk(veiculoId);

    if (!veiculo) {
      throw new NotFoundException(`Veículo com ID ${veiculoId} não encontrado`);
    }

    await veiculo.update({
      possuiDebitos: false,
      valorDebitoTotal: 0,
      dataUltimoDebito: null,
    });

    this.logger.log(`Débito limpo para veículo ${veiculoId}`);
    return veiculo;
  }

  /*
    Envia email de notificação
   */
  async enviarNotificacao(notificacao: NotificacaoDTO): Promise<boolean> {
    const usuario = await this.usuarioModel.findByPk(notificacao.usuarioId);

    if (!usuario || !usuario.enviarEmail) {
      return false;
    }

    return this.emailService.enviarNotificacao({
      destinatario: usuario.email,
      assunto: notificacao.titulo,
      tipo: notificacao.tipo,
      dados: {
        nomeUsuario: usuario.nome,
        placa: notificacao.placaVeiculo,
        diasRestantes: notificacao.diasRestantes,
        dataVencimento: notificacao.dataVencimento?.toLocaleDateString('pt-BR'),
        valorDebito: notificacao.valorDebito,
      },
    });
  }

  /*
    Busca todas as notificações de um usuário (do banco em tempo real)
   */
  async buscarNotificacoesDoUsuario(usuarioId: number) {
    const usuario = await this.usuarioModel.findByPk(usuarioId);

    if (!usuario) {
      throw new NotFoundException(`Usuário com ID ${usuarioId} não encontrado`);
    }

    const notificacoes = [];

    // Verifica CNH
    const cnhNotif = await this.verificarVencimentoCNH(usuarioId);
    if (cnhNotif) {
      notificacoes.push(cnhNotif);
    }

    // Verifica licenciamentos
    const licenciamentos = await this.verificarVencimentoLicenciamento(usuarioId);
    notificacoes.push(...licenciamentos);

    // Verifica débitos
    const debitos = await this.verificarDebitos(usuarioId);
    notificacoes.push(...debitos);

    return notificacoes;
  }
}
