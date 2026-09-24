# Arquitetura e decisões

## Estrutura atual

```text
Interface no navegador
 ├─ Carteiras → RPC Solana/EVM → saldos por ativo e rede
 ├─ Cobranças locais → URI/QR Solana Pay → carteira do pagador
 ├─ Assinatura informada → RPC Solana → verificador → recebimento local
 └─ Quantidades + pontos + total → cálculo inteiro → memória de rateio/CSV
```

Não existe servidor de aplicação, contrato próprio, ponte ou custódia. As solicitações de conexão apenas obtêm endereços autorizados. A transmissão e assinatura de pagamentos ficam fora da aplicação; o QR é uma instrução de recebimento para a carteira do pagador.

| Arquivo | Responsabilidade |
| --- | --- |
| `src/main.js` | Interface, formulários, armazenamento local e exportações |
| `src/chains.js` | Registro de redes, RPC, conexões e composição Solana Pay |
| `src/domain.js` | Valores exatos, verificação de transferência e rateio |
| `src/style.css` | Layout responsivo e estados visuais |
| `tests/` | Casos de borda financeiros e falhas de integração |
| `scripts/check-rpc.js` | Consulta real somente leitura, sem carteira pessoal |

## Multicarteiras e multirredes

Solana Wallet Standard descobre extensões compatíveis, enquanto EIP-6963 descobre provedores EVM. Conectar não é requisito para consultar um endereço público. Uma conexão não prova identidade jurídica, propriedade da mercadoria nem autorização de uma cooperativa.

Solana Mainnet e Devnet têm mints diferentes. Base, Ethereum e Arbitrum usam USDC nativo da Circle, não versões bridged. SOL e ETH são exibidos em suas unidades. A soma de USDC é apenas quantidade de tokens nas carteiras principais consultadas; não é saldo bancário, disponibilidade de liquidez nem conversão garantida em dólar ou real.

## Verificação restritiva

A cobrança recebe referência aleatória de 32 bytes, sem criar chave privada persistente. Para aceitar a assinatura informada, o fluxo:

1. Confere o hash de gênese da rede solicitada.
2. Exige status `finalized` sem erro.
3. Obtém a transação em JSON, preservando índices das instruções, inclusive contas carregadas por lookup table.
4. Confere a assinatura retornada e a data, com tolerância de cinco minutos.
5. Deriva a conta associada de USDC do destinatário.
6. Localiza a referência não assinante/somente leitura na instrução SPL direta.
7. Compara o valor identificado com o crédito líquido do mint/destinatário esperados.
8. Impede repetição de rede + assinatura no estado local e recalcula pendência/excedente.

Transações complexas são rejeitadas para análise externa, sem botão para marcar artificialmente como pagas. Verificar recebimento não identifica a pessoa pagadora nem prova cumprimento do contrato.

## Rateio

Se `T` é o total em unidades mínimas e `p` o percentual do prêmio:

```text
pool do prêmio = piso(T × p / 100)
base = T − pool do prêmio
peso base do produtor = kg do produtor
peso do prêmio = kg × pontos declarados
```

Cada pool é distribuído proporcionalmente por maiores restos. Empates seguem a ordem informada. O algoritmo conserva exatamente `T`; o arredondamento do pool ocorre em uma unidade mínima de USDC (0,000001). Pontos não são nota SCA nem certificação automática: o contrato deve definir seu significado. Despesas, descontos e tributos não são deduzidos automaticamente.

## Estado e evolução

O protótipo guarda registros apenas em `localStorage`, no mesmo dispositivo/origem. CSV e JSON permitem retirar os dados. Não há restauração JSON nesta versão, edição de cobranças, sincronização, controle de acesso, trilha inviolável ou uso concorrente suportado.

Um piloto organizacional exigirá banco de dados e transações para a unicidade rede + assinatura; identidade e papéis; revisão de contratos/rateios; histórico de versões; anexos privados; importação/exportação; proteção de dados e integração contábil. Esses itens são trabalho futuro, não capacidades atuais.

## Fontes técnicas

- [Circle — endereços oficiais de USDC](https://developers.circle.com/stablecoins/usdc-contract-addresses)
- [Solana Pay — especificação](https://docs.solanapay.com/spec)
- [Solana — getTransaction](https://solana.com/docs/rpc/http/gettransaction)
- [Solana — getSignatureStatuses](https://solana.com/docs/rpc/http/getsignaturestatuses)
- [Solana — getGenesisHash](https://solana.com/docs/rpc/http/getgenesishash)
- [Solana Kit — derivação de endereço](https://www.solanakit.com/api/functions/getProgramDerivedAddress)
- [Wallet Standard](https://github.com/wallet-standard/wallet-standard)
- [EIP-6963](https://eips.ethereum.org/EIPS/eip-6963)

Consultadas em 23/09/2026. Endereços e respostas de rede foram conferidos também por consultas RPC somente leitura.
