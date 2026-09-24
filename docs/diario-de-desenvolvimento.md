# Diário de desenvolvimento

## 23/09/2026 — abertura

- Consultada a página indicada pelo briefing. A edição vigente é o Crypto World's Fair, com oito trilhas por rede.
- Iniciada pesquisa independente de regulamento, vencedores, mercado e concorrentes.
- Definido um recorte provisório: conciliação de recebimentos por lote e memória de rateio para cooperativas/exportadoras de café.
- Criado repositório próprio para a pesquisa e a implementação. O nome SafraFlux é provisório; disponibilidade de marca não foi investigada.
- Nenhuma movimentação financeira foi realizada. Nenhum dado pessoal de produtores foi coletado.

Os commits intermediários preservam o andamento da pesquisa; apenas os recursos descritos como implementados na versão final devem ser considerados entregues.

## Pesquisa e decisão

- Conferidas as regras globais e regionais; documentadas divergências de comunicação sobre código anterior, capital levantado e duração da aceleração.
- Identificados dez premiados em fontes dos organizadores, sem confundir captação, aceleração ou Top 25 com colocação numerada.
- Comparadas três oportunidades. Escolhida conciliação por lote com memória de rateio; crédito/tokenização adiados.
- Comparados concorrentes agro, pagamentos e o processo banco/ERP/planilha. Não foi alegado pioneirismo.
- Elaborados cenários de preço/receita, custos sem cotação, plano de 14 entrevistas e critérios de revisão. Nenhuma entrevista realizada.

## Implementação

- Criada interface responsiva com visão geral, carteiras, cobranças, rateio, pesquisa e configuração.
- Implementada consulta real de SOL/ETH e USDC, com lista oficial de mints/contratos e identificação de rede.
- Adicionadas descobertas Wallet Standard/EIP-6963. Teste com extensão real permanece pendente.
- Criadas referências e solicitações Solana Pay, verificação de assinaturas e estados de recebimento.
- A revisão identificou que verificar uma referência somente na lista de contas seria insuficiente. O código passou a exigir a referência na instrução de transferência, ATA correta e correspondência entre valor transferido e crédito líquido.
- Adicionados cálculo inteiro de rateio, exportações CSV/JSON e proteção contra repetição de assinatura no estado local.
- Substituídas dependências com alertas conhecidos; auditoria final sem vulnerabilidades reportadas.

## Verificação e publicação

- 23 testes aprovados e build de distribuição concluído.
- Consultas RPC reais realizadas nos cinco ambientes, sem transferências ou endereços pessoais.
- Fluxos de rateio, cobrança, rejeição de assinatura e persistência conferidos no navegador.
- README, arquitetura, segurança, contribuição, licença MIT e resumo em inglês preparados.
- GitHub recebeu checkpoints em intervalos aproximados de dois minutos durante as etapas ativas. A rotina original tinha duração limitada; depois da interrupção/retomada, foi reiniciada, sem simular continuidade no intervalo.
- A publicação periódica foi encerrada na finalização da versão de código. Registro de validação e limitações: `docs/validacao.md`.

## 24/09/2026 — conferência final da hospedagem

- Confirmado que a versão funcional está sincronizada com o GitHub e tem CI aprovado.
- Identificada falha externa na emissão do certificado TLS do endereço hospedado. Solicitada uma nova tentativa da versão já salva, preservando acesso privado.
- Documentação atualizada para separar publicação do código, execução local e hospedagem online. Nenhum endereço foi apresentado como funcionando sem confirmação do serviço.
- Nova tentativa concluída com sucesso. Link privado confirmado: https://safraflux.ebeatrizkcs.chatgpt.site . A falha de certificado foi superada sem alteração de código ou de permissões.
