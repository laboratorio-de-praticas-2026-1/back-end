# Algoritmo de recomendação de serviços

Este documento explica como funciona a recomendação de serviços do sistema, com base no service de recomendação e na evolução planejada para a rota `GET /recomendacoes/:usuarioId`.

A ideia é simples: em vez de mostrar serviços genéricos, o sistema tenta sugerir aquilo que faz mais sentido para o momento do usuário, usando regras de negócio, dados do veículo, histórico de solicitações e interesse recente no blog.

## Objetivo

O objetivo do algoritmo é montar uma lista de serviços recomendados de forma automática e organizada.

Ele segue uma lógica de prioridade:

1. tenta encontrar situações urgentes ou relevantes no perfil do usuário;
2. depois verifica o histórico do usuário;
3. por fim, usa os serviços mais populares, se ainda não houver informação suficiente.

## Rota da API

A recomendação será consumida pela rota:

```http
GET /recomendacoes/:usuarioId
```

### O que essa rota faz

- extrai o `usuarioId` dos parâmetros da requisição;
- chama o método principal do service;
- retorna o JSON com a lista de recomendações.

## Entrada da lógica

A entrada principal é apenas o `usuarioId`.

Com esse valor, o sistema consulta automaticamente as tabelas necessárias para decidir quais serviços fazem sentido recomendar.

## Entidades usadas

As regras de recomendação usam principalmente estes dados:

- `usuario`
- `veiculo`
- `solicitacao`
- `debito`
- `interacao_usuario`
- `servico`

## Formato da resposta

A API retorna um array de objetos com esta estrutura:

```json
[
  {
    "id": 1,
    "nome": "Licenciamento Anual",
    "descricao": "O licenciamento do veículo ABC-1234 vence em breve."
  },
  {
    "id": 6,
    "nome": "Recurso de Multa",
    "descricao": "Você possui uma nova infração. Deseja iniciar o recurso?"
  }
]
```

Cada item representa um serviço sugerido ao usuário.

## Fluxo geral do service

A lógica abaixo descreve a implementação prevista para a próxima etapa da recomendação, com a lista acumulando todas as regras que fizerem sentido antes do fallback final.

A lógica principal do service deve funcionar em cima de uma lista chamada `listaRecomendacoes`.

O fluxo esperado é este:

1. criar `listaRecomendacoes` vazia;
2. chamar `buscarLicenciamentoAnual`;
3. chamar `buscarRenovacaoCNH`;
4. chamar `buscarAdquiriuCarro`;
5. chamar `buscarInfracoes`;
6. chamar `buscarDividas`;
7. chamar `buscarComunicacaoVenda`;
8. adicionar cada retorno válido dentro do array;
9. se o array continuar vazio no fim das checagens obrigatórias, chamar `buscarAtributosPerfil`;
10. se ainda assim não houver dados úteis, usar popularidade como último fallback.

Essa ordem é importante porque as regras mais urgentes precisam aparecer antes das recomendações mais genéricas.

## Regra 1: usuário sem veículo

A primeira verificação é descobrir se o usuário possui veículo cadastrado.

Se não houver veículo, o sistema não precisa seguir o restante das regras voltadas para automóveis. Nesse cenário, a recomendação é mais simples e direcionada para serviços que fazem sentido para esse perfil.

Hoje, o comportamento esperado para esse caso é recomendar serviços como:

- Renovação de CNH
- Mudança de Categoria

Isso ajuda a não deixar o usuário sem nenhuma sugestão útil mesmo quando ele ainda não tem veículo cadastrado.

## Regra 2: Licenciamento Anual

Essa recomendação é analisada por veículo.

Ela deve ser exibida quando:

- o usuário possui veículo cadastrado;
- o veículo já entrou no período de licenciamento;
- ainda não existe uma solicitação de licenciamento ativa ou concluída no ano atual.

O gatilho do licenciamento é definido pelo último dígito da placa.

### Exemplo de regra por placa

| Último dígito | Mês de gatilho |
| --- | --- |
| 1 | Março |
| 2 | Abril |
| 3 | Maio |
| 4 | Junho |
| 5 | Julho |
| 6 | Julho |
| 7 | Agosto |
| 8 | Setembro |
| 9 | Outubro |
| 0 | Novembro |

Se a regra disparar, o sistema recomenda o serviço `1`.

## Regra 3: Renovação de CNH

Essa recomendação é usada para lembrar o usuário da renovação da carteira de habilitação.

Ela deve ser exibida quando não existir uma solicitação recente desse serviço nos últimos 10 anos.

Na prática, o sistema verifica se o usuário já pediu esse serviço dentro desse intervalo. Se não pediu, a recomendação aparece.

O objetivo é evitar que a CNH fique vencida por falta de aviso ou descuido.

## Regra 4: Transferência de Propriedade

Essa regra entra quando o usuário possui veículo e ainda não possui solicitação de transferência para aquele veículo.

Se o veículo já passou por esse processo, a recomendação não deve aparecer de novo.

Essa checagem é importante porque a transferência de propriedade é um dos serviços mais ligados à regularização do veículo após compra ou venda.

## Regra 5: Infrações e Recurso de Multa

O sistema também tenta identificar situações em que o usuário pode precisar recorrer de uma multa.

Para isso, ele busca débitos pendentes do tipo veículo e procura palavras relacionadas a multa ou infração na descrição, como:

- multa
- infração / infracao
- autuação / autuacao
- radar
- transitar em velocidade

Depois disso, o sistema cruza esses débitos com os veículos do usuário e verifica se já existe uma solicitação do serviço `6` para aquele veículo.

Se houver multa pendente e ainda não existir recurso aberto, o serviço `6` deve ser sugerido.

## Regra 6: Dívidas e Parcelamento de Débitos

Quando o usuário possui pendências financeiras em aberto para o veículo, o sistema pode recomendar o parcelamento.

Essa verificação procura débitos do tipo veículo com status pendente e valida se já existe ou não uma solicitação ativa do serviço `10`.

Se ainda não houver solicitação, o sistema recomenda o parcelamento de débitos.

Essa regra ajuda o usuário a enxergar uma alternativa antes de deixar a pendência se acumular.

## Regra 7: Comunicação de Venda

Essa recomendação usa dois sinais de intenção:

1. interação recente com conteúdo da categoria de documentação no blog, nos últimos 30 dias;
2. solicitação já iniciada de transferência de propriedade.

Se qualquer um desses sinais existir, o sistema entende que há chance de o usuário estar se preparando para vender o veículo, então recomenda o serviço `9`.

## Fallback por histórico e interesse

Se nenhuma das verificações obrigatórias retornar alguma recomendação, o sistema entra na etapa de personalização por histórico.

### Como essa etapa funciona

O service chama `buscarAtributosPerfil` para buscar os serviços que o usuário já contratou anteriormente.

Depois disso, ele pode usar esse histórico de duas formas:

- sugerir serviços que ainda não foram contratados;
- ou, se não houver dados suficientes, usar serviços mais populares.



A ideia é não deixar a resposta vazia.

Mesmo quando o usuário não se encaixa em nenhuma regra mais específica, o sistema ainda consegue oferecer recomendações com base no comportamento dele ou no que outras pessoas mais acessam.

## Fallback por popularidade

Se o usuário não tiver nenhuma solicitação, o sistema consulta os serviços mais populares.

Nessa etapa, a recomendação é montada com base na quantidade de solicitações já feitas por serviço, retornando os 5 mais solicitados.

## Resumo da prioridade

De forma prática, a ordem de decisão é esta:

1. verificar se o usuário tem veículo;
2. aplicar as regras de negócio mais importantes;
3. montar uma lista de recomendações com os retornos encontrados;
4. se a lista ficar vazia, buscar histórico do usuário;
5. se ainda não houver base suficiente, usar popularidade.

## Exemplo de resposta final

Quando mais de uma regra dispara, a API pode responder com mais de um serviço ao mesmo tempo:

```json
[
  {
    "id": 1,
    "nome": "Licenciamento Anual",
    "descricao": "O licenciamento do veículo ABC-1234 vence em breve."
  },
  {
    "id": 6,
    "nome": "Recurso de Multa",
    "descricao": "Você possui uma nova infração. Deseja iniciar o recurso?"
  },
  {
    "id": 10,
    "nome": "Parcelamento de Débitos",
    "descricao": "Você possui pendências financeiras. Parcele seus débitos em até 12x no cartão e mantenha seu veículo regularizado."
  }
]
```

## Conclusão

Esse algoritmo foi pensado para entregar a recomendação mais útil possível, começando pelas regras mais urgentes, passando pelo histórico do usuário e terminando na popularidade quando não há informação suficiente para personalizar melhor.


