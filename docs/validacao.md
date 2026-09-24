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
- Uso simultâneo, restauração, backend, trilha de auditoria e operação institucional.
- Conformidade regulatória, segurança independente e homologação contábil.
- Entrevistas, demanda, preço, economia de tempo ou resultado comercial.

Essas lacunas não são preenchidas com simulações apresentadas como reais. A versão serve para testar a proposta e revisar o fluxo antes de um piloto.
