import 'dotenv/config';
import { PrismaClient, NivelUsuario, StatusSolicitacao, StatusValidacaoDocumento } from '../generated/prisma/client.js';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!.replace('mysql://', 'mariadb://'));
const prisma = new PrismaClient({ adapter });

async function main() {

    // Empresa
    await prisma.empresa.upsert({
        where:  { id: 1 },
        update: {},
        create: {
            id: 1, nomeFantasia: 'Despachante Bortone', cnpj: '12.345.678/0001-99',
            telefone: '(11) 3333-4444', email: 'contato@bortone.com',
            endereco: 'Av. Paulista, 1000', cidade: 'São Paulo', estado: 'SP', site: 'www.bortone.com',
        },
    });
    console.log('Empresa criada');

    // Usuários
    const usuarios = [
        { id: 1,  nome: 'Ana Martins',    email: 'ana@bortone.com',      senha: 'senha_segura_123', nivel: NivelUsuario.administrador, cpfCnpj: '111.111.111-11', celular: '(11) 99999-0001', dataCadastro: new Date('2026-03-03T15:18:13') },
        { id: 2,  nome: 'Bruno Costa',    email: 'bruno@bortone.com',    senha: 'senha_segura_123', nivel: NivelUsuario.cliente,       cpfCnpj: '222.222.222-22', celular: '(11) 99999-0002', dataCadastro: new Date('2026-03-03T15:18:13') },
        { id: 3,  nome: 'Carla Souza',    email: 'carla@bortone.com',    senha: 'senha_segura_123', nivel: NivelUsuario.cliente,       cpfCnpj: '333.333.333-33', celular: '(11) 99999-0003', dataCadastro: new Date('2026-03-03T15:18:13') },
        { id: 4,  nome: 'Daniel Lima',    email: 'daniel@bortone.com',   senha: 'senha_segura_123', nivel: NivelUsuario.cliente,       cpfCnpj: '444.444.444-44', celular: '(11) 99999-0004', dataCadastro: new Date('2026-03-03T15:18:13') },
        { id: 5,  nome: 'Eduardo Rocha',  email: 'eduardo@bortone.com',  senha: 'senha_segura_123', nivel: NivelUsuario.cliente,       cpfCnpj: '555.555.555-55', celular: '(11) 99999-0005', dataCadastro: new Date('2026-03-03T15:18:13') },
        { id: 6,  nome: 'Fernanda Alves', email: 'fernanda@bortone.com', senha: 'senha_segura_123', nivel: NivelUsuario.cliente,       cpfCnpj: '666.666.666-66', celular: '(11) 99999-0006', dataCadastro: new Date('2026-03-03T15:18:13') },
        { id: 7,  nome: 'Gabriel Pinto',  email: 'gabriel@bortone.com',  senha: 'senha_segura_123', nivel: NivelUsuario.cliente,       cpfCnpj: '777.777.777-77', celular: '(11) 99999-0007', dataCadastro: new Date('2026-03-03T15:18:13') },
        { id: 8,  nome: 'Helena Dias',    email: 'helena@bortone.com',   senha: 'senha_segura_123', nivel: NivelUsuario.cliente,       cpfCnpj: '888.888.888-88', celular: '(11) 99999-0008', dataCadastro: new Date('2026-03-03T15:18:13') },
        { id: 9,  nome: 'Igor Mendes',    email: 'igor@bortone.com',     senha: 'senha_segura_123', nivel: NivelUsuario.cliente,       cpfCnpj: '999.999.999-99', celular: '(11) 99999-0009', dataCadastro: new Date('2026-03-03T15:18:13') },
        { id: 10, nome: 'Juliana Melo',   email: 'juliana@bortone.com',  senha: 'senha_segura_123', nivel: NivelUsuario.administrador, cpfCnpj: '000.000.000-00', celular: '(11) 99999-0010', dataCadastro: new Date('2026-03-03T15:18:13') },
    ];
    for (const u of usuarios) {
        await prisma.usuario.upsert({
            where:  { email: u.email },
            update: { nome: u.nome, nivel: u.nivel, cpfCnpj: u.cpfCnpj, celular: u.celular },
            create: u,
        });
    }
    console.log('Usuários criados');

    // Serviços
    const servicos = [
        { id: 1,  nome: 'Licenciamento Anual',          descricao: 'Renovação do CRLV anual',                     valorBase: 180.00, prazoEstimadoDias: 2,  ativo: true },
        { id: 2,  nome: 'Transferência de Propriedade', descricao: 'Transferência de titularidade do veículo',    valorBase: 350.00, prazoEstimadoDias: 5,  ativo: true },
        { id: 3,  nome: 'Primeiro Emplacamento',        descricao: 'Registro de veículo zero quilômetro',         valorBase: 420.00, prazoEstimadoDias: 7,  ativo: true },
        { id: 4,  nome: 'Renovação CNH',                descricao: 'Renovação da carteira de habilitação',        valorBase: 200.00, prazoEstimadoDias: 10, ativo: true },
        { id: 5,  nome: 'Baixa de Gravame',             descricao: 'Retirada de restrição financeira do veículo', valorBase: 190.00, prazoEstimadoDias: 3,  ativo: true },
        { id: 6,  nome: 'Recurso de Multa',             descricao: 'Defesa administrativa de autuação',           valorBase: 250.00, prazoEstimadoDias: 15, ativo: true },
        { id: 7,  nome: '2ª Via CRLV',                  descricao: 'Emissão de segunda via do documento',         valorBase: 120.00, prazoEstimadoDias: 2,  ativo: true },
        { id: 8,  nome: 'Mudança de Categoria CNH',     descricao: 'Alteração de categoria da habilitação',       valorBase: 600.00, prazoEstimadoDias: 30, ativo: true },
        { id: 9,  nome: 'Comunicação de Venda',         descricao: 'Registro de venda no Detran',                 valorBase: 150.00, prazoEstimadoDias: 1,  ativo: true },
        { id: 10, nome: 'Parcelamento de Débitos',      descricao: 'Parcelamento de IPVA e multas pendentes',     valorBase: 90.00,  prazoEstimadoDias: 1,  ativo: true },
    ];
    for (const s of servicos) {
        await prisma.servico.upsert({
            where:  { id: s.id },
            update: { nome: s.nome, descricao: s.descricao, valorBase: s.valorBase, prazoEstimadoDias: s.prazoEstimadoDias },
            create: s,
        });
    }
    console.log('Serviços criados');

    // Banners
    const banners = [
        { id: 1, urlImagem: 'https://img.com/banner1.jpg', descricao: 'Renove sua CNH sem sair de casa',  ativo: true },
        { id: 2, urlImagem: 'https://img.com/banner2.jpg', descricao: 'Licenciamento 2026 já disponível', ativo: true },
        { id: 3, urlImagem: 'https://img.com/banner3.jpg', descricao: 'Transferência rápida e segura',    ativo: true },
    ];
    for (const b of banners) {
        await prisma.banner.upsert({
            where:  { id: b.id },
            update: { urlImagem: b.urlImagem, descricao: b.descricao, ativo: b.ativo },
            create: b,
        });
    }
    console.log('Banners criados');

    // FAQs
    const faqs = [
        { id: 1, pergunta: 'Quais documentos são necessários para transferência?', resposta: 'CRV assinado, RG, CPF e comprovante de residência.' },
        { id: 2, pergunta: 'Posso parcelar o IPVA?',                               resposta: 'Sim, parcelamos no cartão em até 12x.' },
        { id: 3, pergunta: 'Quanto tempo demora o licenciamento?',                 resposta: 'Em média 2 dias úteis após confirmação do pagamento.' },
        { id: 4, pergunta: 'É possível recorrer de multa online?',                 resposta: 'Sim, mediante envio da documentação necessária pelo portal.' },
        { id: 5, pergunta: 'Preciso agendar para atendimento presencial?',         resposta: 'Não é obrigatório, mas recomendamos agendamento prévio.' },
    ];
    for (const f of faqs) {
        await prisma.faq.upsert({
            where:  { id: f.id },
            update: { pergunta: f.pergunta, resposta: f.resposta },
            create: f,
        });
    }
    console.log('FAQs criadas');

    // Blog
    const posts = [
        { id: 1, titulo: 'Calendário IPVA 2026',                     conteudo: 'Confira as datas de vencimento do IPVA por final de placa e evite multas.',      dataPublicacao: new Date('2026-01-10'), urlImagem: 'https://img.com/blog1.jpg' },
        { id: 2, titulo: 'Como recorrer de uma multa de trânsito',   conteudo: 'Entenda o passo a passo para apresentar recurso administrativo de forma eficaz.', dataPublicacao: new Date('2026-01-15'), urlImagem: 'https://img.com/blog2.jpg' },
        { id: 3, titulo: 'Documentos para transferência de veículo', conteudo: 'Veja a lista completa de documentos exigidos pelo Detran para transferência.',    dataPublicacao: new Date('2026-01-20'), urlImagem: 'https://img.com/blog3.jpg' },
    ];
    for (const p of posts) {
        await prisma.blog.upsert({
            where:  { id: p.id },
            update: { titulo: p.titulo, conteudo: p.conteudo, dataPublicacao: p.dataPublicacao },
            create: p,
        });
    }
    console.log('Posts do blog criados');

    // Publicidades
    const publicidades = [
        { id: 1, titulo: 'Seguro Auto Completo',       conteudo: 'Proteja seu veículo com nosso parceiro credenciado.',       urlImagem: 'https://img.com/pub1.jpg' },
        { id: 2, titulo: 'Vistoria Cautelar Premium',  conteudo: 'Agende sua vistoria com desconto exclusivo para clientes.', urlImagem: 'https://img.com/pub2.jpg' },
        { id: 3, titulo: 'Clínica Médica Credenciada', conteudo: 'Renove sua CNH com rapidez e comodidade.',                  urlImagem: 'https://img.com/pub3.jpg' },
    ];
    for (const pub of publicidades) {
        await prisma.publicidade.upsert({
            where:  { id: pub.id },
            update: { titulo: pub.titulo, conteudo: pub.conteudo, urlImagem: pub.urlImagem },
            create: pub,
        });
    }
    console.log('Publicidades criadas');

    // Veículos
    const veiculos = [
        { id: 1, usuarioId: 2, placa: 'ABC1A23', renavam: '12345678901', marca: 'Honda',     modelo: 'Civic',    anoFabricacao: 2020, anoModelo: 2020 },
        { id: 2, usuarioId: 3, placa: 'DEF2B34', renavam: '23456789012', marca: 'Toyota',    modelo: 'Corolla',  anoFabricacao: 2019, anoModelo: 2020 },
        { id: 3, usuarioId: 4, placa: 'GHI3C45', renavam: '34567890123', marca: 'Chevrolet', modelo: 'Onix',     anoFabricacao: 2022, anoModelo: 2023 },
        { id: 4, usuarioId: 5, placa: 'JKL4D56', renavam: '45678901234', marca: 'Hyundai',   modelo: 'HB20',     anoFabricacao: 2021, anoModelo: 2022 },
        { id: 5, usuarioId: 2, placa: 'YZA9I12', renavam: '90123456789', marca: 'Jeep',      modelo: 'Renegade', anoFabricacao: 2021, anoModelo: 2022 },
    ];
    for (const v of veiculos) {
        await prisma.veiculo.upsert({
            where:  { id: v.id },
            update: { placa: v.placa, renavam: v.renavam, marca: v.marca, modelo: v.modelo },
            create: v,
        });
    }
    console.log('Veículos criados');

    // Solicitações
    const solicitacoes = [
        { id: 1, usuarioId: 2, veiculoId: 1, servicoId: 1, status: StatusSolicitacao.em_andamento,         observacaoCliente: 'Preciso com urgência.',        dataSolicitacao: new Date('2026-03-03T15:18:52'), dataConclusao: null },
        { id: 2, usuarioId: 3, veiculoId: 2, servicoId: 2, status: StatusSolicitacao.recebido,             observacaoCliente: 'Documentos enviados.',          dataSolicitacao: new Date('2026-03-03T15:18:52'), dataConclusao: null },
        { id: 3, usuarioId: 4, veiculoId: 3, servicoId: 3, status: StatusSolicitacao.aguardando_documento, observacaoCliente: 'Falta comprovante.',            dataSolicitacao: new Date('2026-03-03T15:18:52'), dataConclusao: null },
        { id: 4, usuarioId: 5, veiculoId: 4, servicoId: 4, status: StatusSolicitacao.concluido,            observacaoCliente: 'Tudo certo.',                   dataSolicitacao: new Date('2026-03-03T15:18:52'), dataConclusao: new Date('2026-03-05T10:00:00') },
        { id: 5, usuarioId: 2, veiculoId: 5, servicoId: 5, status: StatusSolicitacao.em_andamento,         observacaoCliente: 'Aguardando resposta do banco.', dataSolicitacao: new Date('2026-03-03T15:18:52'), dataConclusao: null },
    ];
    for (const sol of solicitacoes) {
        await prisma.solicitacao.upsert({
            where:  { id: sol.id },
            update: { status: sol.status, observacaoCliente: sol.observacaoCliente },
            create: sol,
        });
    }
    console.log('Solicitações criadas');

    // Documentos
    const documentos = [
        { id: 1, solicitacaoId: 1, nomeHash: 'doc_rg_001.pdf',   tipoDocumento: 'RG',                     statusValidacao: StatusValidacaoDocumento.aprovado, dataUpload: new Date('2026-03-03T18:19:00') },
        { id: 2, solicitacaoId: 1, nomeHash: 'doc_crlv_001.pdf', tipoDocumento: 'CRLV',                   statusValidacao: StatusValidacaoDocumento.aprovado, dataUpload: new Date('2026-03-03T18:19:00') },
        { id: 3, solicitacaoId: 2, nomeHash: 'doc_cpf_002.pdf',  tipoDocumento: 'CPF',                    statusValidacao: StatusValidacaoDocumento.pendente, dataUpload: new Date('2026-03-03T18:19:00') },
        { id: 4, solicitacaoId: 3, nomeHash: 'doc_res_003.pdf',  tipoDocumento: 'Comprovante Residência', statusValidacao: StatusValidacaoDocumento.pendente, dataUpload: new Date('2026-03-03T18:19:00') },
        { id: 5, solicitacaoId: 4, nomeHash: 'doc_cnh_004.pdf',  tipoDocumento: 'CNH',                    statusValidacao: StatusValidacaoDocumento.aprovado, dataUpload: new Date('2026-03-03T18:19:00') },
    ];
    for (const doc of documentos) {
        await prisma.documentoSolicitacao.upsert({
            where:  { id: doc.id },
            update: { statusValidacao: doc.statusValidacao },
            create: doc,
        });
    }
    console.log('Documentos criados');

    console.log('Seed concluído com sucesso!');
}

main()
    .catch((e) => { console.error('Erro:', e); process.exit(1); })
    .finally(() => prisma.$disconnect());
