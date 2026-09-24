# Registro de validação

Execução em **23/09/2026, horário de Brasília**. O teste de integração final ocorreu em `2026-09-24T00:58:51Z` (21:58:51 do dia 23 no Brasil).

## Testes automatizados

`npm test`: **23 testes aprovados, nenhuma falha**.

- Valores monetários com seis casas, sem conversão para ponto flutuante; formatação acima da precisão de Number.
- Conservação do total em rateio por maiores restos, prêmio separado e rejeição de quantidades/pontos inválidos.
- Pendência, recebimento parcial, completo e excedente.
- Impedimento de repetição da mesma rede + assinatura em cobranças locais.
- Transfer/TransferChecked diretas, ATA recém-criada e referências readonly carregadas por address lookup.
- Rejeição de referência em instrução alheia, token, destinatário, programa, assinatura e precisão incorretos.
- Rejeição de referência gravável, transação falha, antiga, sem data ou ainda não finalizada.
- Rejeição de movimento adicional no destino e configuração de RPC na rede errada.
- Exportação CSV com aspas, separadores e prefixos de fórmulas tratados.

As respostas usadas nos testes unitários são **fixtures sintéticas**. Elas verificam decisões de código, não são comprovantes de pagamento.

## Build e dependências

`npm run build`: concluído. JavaScript de distribuição de aproximadamente 73 KB antes de compressão, sem backend.

`npm audit`: **zero vulnerabilidades reportadas** após atualização do Vite/esbuild e substituição do SDK legado pelo módulo de endereços do Solana Kit. Esse resultado reflete a base de alertas na consulta, não equivale a auditoria de segurança independente.

## Consulta real às redes

`node scripts/check-rpc.js`: respostas válidas em Solana Mainnet, Solana Devnet, Base, Ethereum e Arbitrum. Usados endereços públicos de mint/zero; nenhuma carteira pessoal ou transferência.

| Ambiente | Resultado |
| --- | --- |
| Solana Mainnet | Hash de gênese, SOL e contas USDC consultados |
| Solana Devnet | Hash de gênese, SOL de teste e contas USDC consultados |
| Base | Chain ID, ETH e USDC consultados |
| Ethereum | Chain ID, ETH e USDC consultados |
| Arbitrum | Chain ID, ETH e USDC consultados |

A disponibilidade futura depende dos provedores. Sucesso da consulta no ambiente de execução não garante todos os cenários de CORS, limitação ou extensões em navegadores dos usuários.

## Interface

Inspeção no navegador local:

- Tela inicial sem saldo fictício, navegação e estados vazios.
- Exemplo de rateio de 1.000 USDC: 597,142857 + 402,857143, soma exata.
- Percentual de prêmio 101 rejeitado.
- Cobrança fictícia `QA-DEVNET-SEM-PAGAMENTO`, 10,01 USDC de teste, criada com QR e referência aleatória; nenhum pagamento enviado.
- Assinatura textual inválida rejeitada; cobrança permaneceu pendente, recebido zero.
- Recarga preservou a cobrança local.
- Ferramenta WebMCP de leitura retornou o mesmo estado visível; entrada com campos inesperados foi rejeitada.
- Layout inspecionado em largura móvel e desktop; tabelas financeiras usam rolagem horizontal quando necessário.

## Ainda não validado

- Conexão e autorização com extensões reais de Phantom, Solflare, Backpack, MetaMask ou outros fornecedores.
- Pagamento completo via carteira externa, em Devnet ou Mainnet.
- Uso simultâneo, backend, trilha de auditoria e operação institucional.
- Conformidade regulatória, segurança independente e homologação contábil.
- Entrevistas, demanda, preço, economia de tempo ou resultado comercial.

Essas lacunas não são preenchidas com simulações apresentadas como reais. A versão serve para testar a proposta e revisar o fluxo antes de um piloto.

## Publicação

- Repositório público confirmado: `SouBeatrizKaroline/safraflux`.
- Commit funcional `9d396fd9e213d721c95a20fcecc1640d50bd3c04`, com [CI aprovado no GitHub](https://github.com/SouBeatrizKaroline/safraflux/actions/runs/35941267350).
- Canal privado de relato de vulnerabilidades habilitado no GitHub.
- Empacotamento do site concluído e versão salva. O Windows exigiu disponibilizar o Bash do Git e configurar o tar para tratar caminhos de disco como locais.
- A primeira publicação hospedada falhou por timeout de emissão de certificado TLS; não houve erro de aplicação nessa etapa. Em 24/09/2026 foi solicitada nova publicação da mesma versão, sem recriar o projeto ou alterar seu acesso privado.
- Consulta real Devnet também confirmada pela interface no navegador: endereço descartável sem fundos, saldos zero obtidos da rede, sem transferências.
- **Publicação confirmada em 24/09/2026 às 11:41:01 UTC:** https://safraflux.ebeatrizkcs.chatgpt.site . O serviço retornou estado `succeeded`, sem mensagem de falha. Acesso privado à proprietária; não é uma URL pública para avaliadores. A versão hospedada corresponde ao código funcional do commit `9d396fd`; esta foi a primeira versão hospedada. As alterações seguintes são registradas abaixo.

## Restauração JSON — 24/09/2026

30 testes automatizados aprovados. Os sete novos testes verificam que valores de comprovantes importados não quitam cobranças, saldos importados são ignorados, referências conflitantes rejeitam o arquivo sem alterar o estado, duplicatas são mescladas, comprovantes locais são preservados e limites/formato são aplicados. Compilação de produção aprovada.

O teste completo em Devnet permanece pendente: a solicitação de 0,01 SOL de teste ao RPC oficial retornou erro interno (-32603) às 11:46 UTC. Não houve transferência.

Interface local: seleção de arquivo, prévia, confirmação e mesclagem verificadas no navegador. A cobrança QA-RESTAURACAO-SEM-PAGAMENTO foi acrescentada com recebido zero e situação pendente; a cobrança e a carteira anteriores permaneceram presentes.

Nova publicação confirmada em 24/09/2026 às 11:58:23 UTC: restauração disponível no site privado. Código hospedado: 9187f6f3b83c54b542625e12eb2b7c688f94d094. CI aprovado: https://github.com/SouBeatrizKaroline/safraflux/actions/runs/35995952906 . Publicação retornou succeeded, sem falha.

## Evolução com servidor — 24/09/2026

39 testes aprovados: incluem isolamento entre contas, recusa de anônimos e origem externa, SQL parametrizado, revisão concorrente, limites de frequência e corpo, cálculo no servidor e retenção/isolamento das cópias. Testes usam SQLite real em memória e identidades de teste; não são login real de usuários externos.

Interface local: produtor cadastrado, lote criado, etapa avançada, rateio salvo e recarga com recuperação dos dados pelo banco. Valores de teste não representam transações. Pagamento em Devnet adiado a pedido da proponente. A publicação com D1 será registrada separadamente após confirmação.

## Publicação do backend

Publicação privada confirmada em 24/09/2026 às 19:15:24 UTC. Código hospedado: 508ed93dbf80360043976d4d4e4aebe3d7fcd71e. [CI aprovado](https://github.com/SouBeatrizKaroline/safraflux/actions/runs/36046680802). A publicação incluiu Worker, interface e migrações D1; o serviço retornou succeeded sem falha.

Diagnóstico sem identidade pessoal: state, history e backups responderam 401, recusando acesso. O token técnico de acesso do publicador não foi tratado como identidade de usuário. No navegador, a entrada chegou à seleção de conta do ChatGPT; a seleção foi interrompida pela revisão automática por exigir autorização específica para compartilhar perfil. A leitura autenticada do banco hospedado ainda não foi confirmada nesta etapa.

Inspeção local adicional: histórico, listagem de cópias e página de apresentação conferidos na interface.
