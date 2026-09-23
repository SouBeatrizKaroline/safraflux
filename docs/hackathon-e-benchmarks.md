# Hackathon e referências de produto

Pesquisa documental realizada em **23 de setembro de 2026**. Fontes consultadas: organizadores, regulamento oficial e anúncios oficiais de resultados. Este levantamento confirma regras publicadas e premiações; não certifica a operação atual, a segurança ou o desempenho comercial dos projetos citados.

## Conclusão para o SafraFlux

O enquadramento proposto é um produto de pagamentos e conciliação para operações agrícolas, com Solana como primeira rede. Há precedentes premiados em pagamentos de cadeia produtiva, comunidades de cultivo, gestão de ativos e infraestrutura. A oportunidade precisa ser demonstrada pela dor específica do cliente e pelo funcionamento do fluxo, não pela alegação de ser o primeiro projeto a juntar agro e cripto.

**Decisão recomendada:** apresentar uma operação agrícola completa — obrigação comercial, identificação do lote, carteira pagadora, pagamento e conciliação — antes de ampliar o número de redes. O elemento inovador a testar é associar saldos distribuídos entre carteiras a compromissos agrícolas e evidências de cumprimento. Isso é uma hipótese de diferenciação, ainda sem validação com clientes.

## 1. Qual é a edição indicada

O endereço fornecido direciona à **Crypto World's Fair**, realizada pela Colosseum com apoio da Superteam Brasil. A competição atual se abre a diferentes ecossistemas. A página oficial anuncia US$ 840 mil em prêmios e US$ 2,5 milhões em investimento; prêmio e investimento são processos distintos. [Página da edição](https://colosseum.com/worldsfair) · [Anúncio da mudança de formato](https://blog.colosseum.com/expanding-the-arena/).

### Regras que alteram o planejamento

| Item | Verificação |
| --- | --- |
| Período | 14/09/2026, 06:00 PT, até 12/10/2026, 23:59 PT. |
| Horário em Brasília | Conversão: início em 14/09 às 10:00; encerramento em 13/10 às 03:59. PT está em UTC−7 nessas datas; Brasília, UTC−3. |
| Participação | Uma equipe por pessoa e uma submissão por equipe. Cada integrante precisa se registrar. |
| Idioma | Conteúdo submetido em inglês. |
| Elegibilidade pessoal | Maioridade local ou 18 anos, o que for maior; há exclusões e análise excepcional de menores. |
| Avaliação | Funcionamento, impacto, novidade, experiência, código aberto/composição e negócio. |
| Trilhas | Solana, Tempo, Hyperliquid, Zcash, Ethereum L1, Base, Arbitrum e Robinhood Chain. |
| Anúncio global | Previsto até/próximo de 05/12/2026, sujeito a atualização. |

Fonte da tabela: [Regulamento oficial, seções 3, 5–8, 12–14](https://colosseum.com/legal/Crypto%20World%27s%20Fair%20Hackathon%20Rules.pdf). A conversão de fuso é cálculo; o relógio da organização governa o prazo. Para o cronograma interno, concluir a entrega no dia 12/10 em horário comercial brasileiro reduz o risco de depender da madrugada.

### Código existente e trabalho novo

A [FAQ oficial da Colosseum](https://colosseum.com/hackathon) permite desenvolvimento anterior e reutilização de código, exige a declaração desse histórico e informa que a avaliação considera o trabalho executado durante a competição. O histórico do Git e um registro de decisões ajudam a tornar essa distinção verificável. Repositórios abertos são incentivados; a FAQ também admite privados mediante acesso aos avaliadores.

A página brasileira reúne duas mensagens que, isoladas, parecem incompatíveis: permite código anterior, mas o calendário diz que apenas o trabalho feito a partir do início conta. A leitura compatível com a FAQ é **código anterior pode integrar a base; o avanço do período precisa ser identificado**. A página também menciona empresas com até R$ 3 milhões captados, enquanto a FAQ global usa o critério qualitativo de não ter levantado capital significativo. Não adotar R$ 3 milhões como limite oficial global sem confirmação do organizador. [Superteam Brasil](https://hackathon.superteam.com.br/) · [FAQ global](https://colosseum.com/hackathon).

No projeto, registrar dependências de terceiros, autoria, código preexistente, início do desenvolvimento e entregas efetivamente concluídas. Não inventar entrevistas, pilotos, volume transacionado, aprovação institucional ou atividade humana para produzir aparência de validação.

### Multicarteiras não significa multirredes

- **Multicarteiras:** diferentes aplicativos ou endereços podem participar do mesmo produto e da mesma blockchain. Conectar uma carteira é diferente de importar vários endereços apenas para consulta.
- **Multirredes:** leitura ou execução em blockchains distintas. Endereços, ativos, taxas e confirmações precisam manter sua identificação de rede.
- **Agregação:** reunir informações e obrigações em uma interface. Não pressupõe transferir fundos, fazer swap ou executar uma ponte.

A [FAQ global](https://colosseum.com/hackathon) afirma que o evento admite todas as blockchains. As oito redes da tabela correspondem a trilhas com premiação dedicada, não a uma lista fechada de carteiras autorizadas. O [anúncio da edição](https://blog.colosseum.com/expanding-the-arena/) reconhece produtos que combinam tecnologias. Não foi encontrada proibição geral de arquitetura multirrede nos documentos consultados.

Entretanto, isso **não confirma** que uma submissão possa acumular várias trilhas de rede. A página da edição orienta escolher um ecossistema, e a brasileira descreve uma submissão concorrendo à sua trilha e aos prêmios gerais. Declarar Solana como principal e confirmar no formulário oficial como informar integrações secundárias. [Edição oficial](https://colosseum.com/worldsfair) · [Superteam Brasil](https://hackathon.superteam.com.br/).

Para o SafraFlux, compatibilidade inicial com carteiras Solana deve ser demonstrada por conexão e operação verificadas. Suporte a outras redes deve ter rótulos distintos para consulta, assinatura e liquidação. Uma opção visual sem integração funcional não deve ser descrita como rede suportada.

### Aceleração e Trilha Brasil

O [acelerador oficial](https://colosseum.com/accelerator) exige alguma integração Solana e seleção própria; vencer não garante admissão. Seu investimento anunciado é de US$ 250 mil por startup aceita. Há divergência de duração: a página do acelerador informa oito semanas, enquanto a página da edição menciona doze. Isso exige confirmação caso a equipe avance. [Acelerador](https://colosseum.com/accelerator) · [Edição](https://colosseum.com/worldsfair).

A Superteam informa que a trilha brasileira exige projeto Solana e envio separado. A [listagem oficial no Earn](https://superteam.fun/earn/listing/side-track-superteam-brasil/) mostra **5.000 USDG**, distribuição por cinco colocações e anúncio previsto para 10/11/2026. Essa data é da trilha regional, não do resultado global. O texto público recuperado do Earn não expôs um horário final verificável de submissão; confirmar no formulário antes da entrega. [Superteam Brasil](https://hackathon.superteam.com.br/).

## 2. Dez projetos premiados usados como referência

As colocações abaixo se referem à edição indicada. As descrições registram o que o organizador publicou na época. A coluna de aprendizado contém interpretação para o SafraFlux; não afirma que esses projetos executem as funcionalidades propostas para o agro.

| Projeto | Resultado confirmado | O que foi apresentado | Aprendizado para o SafraFlux e limite da comparação |
| --- | --- | --- | --- |
| CargoBill | **1º, Stablecoins — Breakout 2025** | Pagamentos com stablecoins para cadeia de suprimentos. | Comparável mais próximo de pagamentos operacionais. Diferenciar por lote agrícola, obrigações e conciliação; não afirmar originalidade apenas pelo uso de stablecoin. [Resultado](https://blog.colosseum.com/announcing-the-winners-of-the-solana-breakout-hackathon/) |
| Home Harvest | **3º, DePIN — Breakout 2025** | Comunidade ReFi de produtores conectados. | Há precedente explícito de cultivo no ecossistema premiado. O anúncio não comprova alcance comercial ou adequação ao agronegócio brasileiro. [Resultado](https://blog.colosseum.com/announcing-the-winners-of-the-solana-breakout-hackathon/) |
| GLAM | **2º, DeFi & Payments — Renaissance 2024** | Protocolo de gestão de ativos em Solana. | Referência para organização financeira. Tesouraria agrícola exige compromissos, responsáveis e vencimentos; um painel de investimentos é outro problema. [Resultado](https://blog.colosseum.com/announcing-the-winners-of-the-solana-renaissance-hackathon/) |
| Ripe | **4º, DeFi & Payments — Renaissance 2024** | Pagamentos por QR em comerciantes do Sudeste Asiático. | O fluxo de cobrança deve ser compreensível pelo comprador. O prêmio não comprova suporte ao Pix ou operação no Brasil. [Resultado](https://blog.colosseum.com/announcing-the-winners-of-the-solana-renaissance-hackathon/) |
| Autonom | **1º, RWA — Cypherpunk 2025** | Oráculo especializado em ativos do mundo real. | Dados externos confiáveis importam. Hash ou transação confirma registro, não a existência, qualidade ou entrega da mercadoria. [Resultado](https://blog.colosseum.com/announcing-the-winners-of-the-solana-cypherpunk-hackathon/) |
| Cloak | **3º, Stablecoin — Cypherpunk 2025** | Produto de pagamentos privados. | Comercialização agrícola envolve preços e relações sensíveis. Evitar publicar dados pessoais e documentos comerciais em blockchain. Premiação não equivale a auditoria. [Resultado](https://blog.colosseum.com/announcing-the-winners-of-the-solana-cypherpunk-hackathon/) |
| Seer | **1º, Infrastructure — Cypherpunk 2025** | Ferramenta para depurar transações Solana. | Falhas precisam ser diagnosticáveis: rede, assinatura, confirmação e erro devem ter estados claros. A ferramenta é referência de infraestrutura, não concorrente agrícola. [Resultado](https://blog.colosseum.com/announcing-the-winners-of-the-solana-cypherpunk-hackathon/) |
| Nomu | **Top 25 — Frontier 2026; sem ordem de colocação** | Infraestrutura de cadeia física, incluindo produção, qualidade, armazenagem e pagamentos. | O produto deve acompanhar uma operação comercial completa. A descrição oficial é ampla e não demonstra especialização agrícola. [Resultado](https://blog.colosseum.com/announcing-the-winners-of-the-solana-frontier-hackathon/) |
| DashX | **Top 25 — Frontier 2026; sem ordem de colocação** | Infraestrutura de pagamentos internacionais com stablecoins para mercados emergentes. | Existe concorrência especializada em infraestrutura de pagamento. Integrar parceiros pode ser mais viável que construir câmbio e liquidação próprios. [Resultado](https://blog.colosseum.com/announcing-the-winners-of-the-solana-frontier-hackathon/) |
| DeFi Land | **2º, DeFi — Solana Season 2021** | Jogo multirrede com simulação agrícola. | É precedente de linguagem visual agrícola em DeFi. Não usar como evidência de financiamento de lavouras ou de impacto na produção real. [Resultado](https://solana.com/news/announcing-winners-of-the-solana-season-hackathon) |

### Como interpretar os resultados

**Premiado** significa presença na lista oficial de prêmio da edição. **Finalista** exige confirmação específica de classificação; nenhum projeto da tabela recebeu esse rótulo por inferência. **Acelerado** depende de anúncio separado de seleção. **Menção honrosa** é reconhecimento distinto de prêmio: os próprios anúncios de Breakout e Cypherpunk separam essas listas.

O material de divulgação brasileiro destaca rodadas de investimento de Cloak e Bido. Essas referências não foram usadas para estimar faturamento, número de clientes ou chance de vitória. O que sustenta a colocação de Cloak aqui é o anúncio oficial do Cypherpunk. Não foi necessário atribuir uma colocação ao Bido.

Este recorte não é um censo de projetos agro em blockchain. A ausência de um concorrente na tabela não prova que ele não exista. As páginas de projeto da antiga Arena redirecionaram e não puderam ser recuperadas nesta consulta; por isso, não há alegação de inspeção do código nem teste de produto desses times.

## 3. Critérios práticos derivados da pesquisa

1. **Demonstrar um pagamento agrícola de ponta a ponta.** O avaliador deve reconhecer quem paga, quem recebe, qual obrigação está sendo quitada e qual evidência sustenta o status exibido.
2. **Separar saldo de dinheiro disponível.** Saldo em uma carteira não implica disponibilidade para uma obrigação em outra rede ou moeda. Exibir unidade, rede, consulta e limitações.
3. **Tratar documentos como evidência contestável.** Informar emissor, data e responsável pela verificação. Registro criptográfico não substitui inspeção física.
4. **Escolher um comprador do produto.** Cooperativa, revenda e produtor têm rotinas diferentes. Começar por um segmento e entrevistar usuários antes de afirmar aderência.
5. **Medir o ganho operacional.** Tempo de conciliação, pagamentos não identificados e divergências resolvidas são hipóteses de métricas úteis. Ainda não existem resultados medidos deste projeto.
6. **Distinguir entrega de planejamento.** Conexão implementada, saldo consultado, pagamento confirmado e integração futura precisam de estados próprios no README e na interface.
7. **Evitar expansão ornamental.** Cada nova rede deve resolver uma demanda verificável; integração parcial aumenta o risco de confundir ativos e comprovantes.

## 4. Registro da pesquisa e pontos pendentes

| Atividade realizada | Evidência ou resultado |
| --- | --- |
| Identificação da edição | Página brasileira comparada à página da Colosseum e ao anúncio de abertura multiecossistema. |
| Leitura do regulamento | PDF oficial de dez páginas; extração das condições relevantes, datas e critérios. |
| Comparação das regras | Conflitos de comunicação sobre código anterior, capital captado e duração da aceleração registrados acima. |
| Pesquisa de resultados | Anúncios oficiais de Renaissance, Breakout, Cypherpunk, Frontier e Solana Season. |
| Seleção de referências | Dez projetos; premiação e aprendizado separados. |
| Limite do trabalho | Pesquisa documental; sem contato com organizadores, entrevistas, teste dos concorrentes ou inscrição da equipe. |

Antes da submissão: reler o regulamento; confirmar cadastro de cada integrante; conferir a trilha principal e as redes secundárias no formulário; esclarecer o prazo regional; produzir a versão inglesa dos materiais; distinguir todas as entregas novas de dependências e código anterior. Nenhuma inscrição foi feita por esta pesquisa.

## Fontes primárias

Todas consultadas em **2026-09-23**.

- [Superteam Brasil — página indicada pela proponente](https://hackathon.superteam.com.br/)
- [Colosseum — Crypto World's Fair](https://colosseum.com/worldsfair)
- [Colosseum — regulamento oficial em PDF](https://colosseum.com/legal/Crypto%20World%27s%20Fair%20Hackathon%20Rules.pdf)
- [Colosseum — FAQ dos hackathons](https://colosseum.com/hackathon)
- [Colosseum — Expanding the Arena](https://blog.colosseum.com/expanding-the-arena/)
- [Colosseum — acelerador](https://colosseum.com/accelerator)
- [Superteam Earn — Side Track Superteam Brasil](https://superteam.fun/earn/listing/side-track-superteam-brasil/)
- [Colosseum — resultados Renaissance](https://blog.colosseum.com/announcing-the-winners-of-the-solana-renaissance-hackathon/)
- [Colosseum — resultados Breakout](https://blog.colosseum.com/announcing-the-winners-of-the-solana-breakout-hackathon/)
- [Colosseum — resultados Cypherpunk](https://blog.colosseum.com/announcing-the-winners-of-the-solana-cypherpunk-hackathon/)
- [Colosseum — resultados Frontier](https://blog.colosseum.com/announcing-the-winners-of-the-solana-frontier-hackathon/)
- [Solana Foundation — resultados Solana Season](https://solana.com/news/announcing-winners-of-the-solana-season-hackathon)
