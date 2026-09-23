# SafraFlux

Conciliação de recebimentos em cripto por lote agrícola, com Solana como rede principal.

## O problema que estamos investigando

Uma cooperativa pode vender um lote que reúne a produção de várias famílias, receber pagamentos em mais de uma carteira e precisar explicar quanto cabe a cada produtor. O registro na blockchain informa movimentações; sozinho, ele não identifica contrato, lote, qualidade ou repasse devido.

SafraFlux está sendo desenvolvido para unir essas informações em uma rotina de trabalho: acompanhar carteiras, criar cobranças identificadas por lote, verificar recebimentos e preparar a memória de cálculo do rateio.

**Status em 23/09/2026:** pesquisa e implementação inicial. Não há clientes, entrevistas, pilotos ou parcerias confirmados. Este documento será atualizado conforme os componentes forem implementados e testados.

## Recorte inicial

- Público a validar: cooperativas e pequenas exportadoras de café especial.
- Ativo inicial para cobrança: USDC na Solana.
- Multicarteiras: acompanhar mais de um endereço e permitir conexão por carteiras compatíveis.
- Outras redes: priorizar consulta em redes aceitas no hackathon, sem presumir que uma carteira ou stablecoin funciona igualmente em todas elas.
- Não emitir token agrícola, oferecer crédito ou prometer rendimento.

## Pesquisa em andamento

1. Conferir as regras oficiais do Crypto World's Fair/Colosseum e da Trilha Brasil.
2. Estudar projetos premiados e separar inspiração de funções já existentes no mercado.
3. Comparar concorrentes e selecionar uma diferença relevante para o usuário.
4. Construir uma ferramenta verificável, com limitações explícitas.

Fontes de partida: [Superteam Brasil](https://hackathon.superteam.com.br/), [Colosseum](https://colosseum.com/worldsfair), [Cecafé — exportações em 2025](https://www.cecafe.com.br/publicacoes/noticias/cecafe-exportacao-cafe-2025-20260119/).

## Histórico

As entregas são registradas nos commits e em `docs/diario-de-desenvolvimento.md`. A pesquisa terá fontes, data de consulta, hipóteses e lacunas de validação. Nenhuma estimativa será apresentada como resultado comercial.
