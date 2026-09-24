# Recursos da Colosseum aplicados ao SafraFlux

Consulta em 24/09/2026, a partir do [link enviado pela proponente](https://colosseum.com/worldsfair/resources?ref=blog.colosseum.com). A [página de recursos](https://colosseum.com/worldsfair/resources) reúne carteiras, SDKs, testes, provedores, pagamentos e tesouraria. A presença no catálogo não comprova integração ou adequação automática ao projeto.

## Decisões práticas

| Necessidade | Recurso | Decisão para o projeto |
| --- | --- | --- |
| Facilitar acesso à carteira | Phantom Connect | Avaliar para usuários externos, após registro do aplicativo e desenho de autorização. Não está integrado. |
| Testar sem depender do faucet | Surfpool | Alternativa para a próxima etapa de integração. Não foi instalado ou executado; pagamento permanece adiado. |
| Reduzir conferência manual | Indexação de pagamentos | Evolução para ingestão persistente com reprocessamento e deduplicação. A versão atual continua com assinatura informada. |
| Aprovação de tesouraria por mais de uma pessoa | Squads | Candidato para uma fase de repasses autorizados. Não confundir multisig com permissões do sistema agrícola. |

## Acesso e carteira são responsabilidades diferentes

[Phantom Connect](https://docs.phantom.com/phantom-connect) documenta entrada por Google/Apple, carteira incorporada e conexão com extensão existente. A adoção exige aplicativo no portal, domínio, origens e redirecionamentos configurados. Isso pode reduzir a necessidade de instalar uma extensão, mas não define quais funcionários podem acessar lotes, contratos ou aprovar ações. A identidade da carteira precisaria ser vinculada, no servidor, a uma identidade e autorização da organização. Hoje o SafraFlux usa a autenticação real do Sites/ChatGPT e mantém registros separados por conta; não oferece login Phantom.

## Integração sem depender do faucet público

[Surfpool](https://solana.com/docs/tools/surfpool) oferece uma rede local compatível com fluxos de test-validator e carregamento de contas para testes. É uma alternativa técnica para investigar quando a validação de pagamentos for retomada. Um teste local, mesmo completo, não será descrito como transferência em Mainnet ou Devnet. O sistema atual não foi alterado para aceitar um hash de gênese local em produção.

## Conciliação automática

A [documentação de indexação da Solana](https://solana.com/docs/payments/accept-payments/indexing) distingue consultas RPC de baixo volume de ingestão persistente para pagamentos. Para o SafraFlux, uma implementação futura deverá guardar eventos, deduplicar por rede/assinatura/instrução, reprocessar falhas e vincular entradas à referência da cobrança. O verificador atual permanece restritivo: a expansão não pode transformar qualquer variação de saldo em quitação.

## Tesouraria com múltiplas aprovações

[Squads Multisig](https://squads.xyz/multisig) é uma opção a avaliar para gestão de ativos Solana com múltiplos participantes. Não foi criada carteira, concedida autorização, transferido ativo ou integrado SDK. Antes de repasses, será necessário definir responsáveis, quórum, recuperação de acesso e a ligação entre uma memória de rateio aprovada e a transação assinada.

## O que já mudou e o que permanece pendente

O avanço entregue nesta etapa é o backend autenticado, banco por conta, histórico, cópias e operação agrícola persistente. Os recursos acima orientam próximas integrações; nenhum deles é anunciado como disponível na interface. A preparação para produção depende também de revisão independente, testes de carteira, acesso organizacional e validação da rotina com usuários.
