# Pesquisa de mercado — SafraFlux

**Data de corte:** 23 de setembro de 2026.  
**Estágio:** pesquisa documental e hipótese de produto. Entrevistas realizadas: **0**. Clientes, receita, contratos de piloto e parcerias confirmados: **0**.

## 1. Decisão recomendada

Começar pelo financeiro de cooperativas e pequenas exportadoras de café: vincular um contrato/lote a uma cobrança em stablecoin, conferir os recebimentos em carteiras Solana e produzir um demonstrativo de divisão do valor por produtor. O prêmio de qualidade deve aparecer separado do preço-base, com regra de cálculo e documento de origem.

O nome de trabalho é **SafraFlux**. A promessa a testar é simples: **“Do recebimento do lote ao demonstrativo de cada produtor, com os valores conferidos.”**

O recorte é mais defensável que lançar outra carteira ou uma moeda do agro. AgriDex já combina agricultura e liquidação com stablecoins; Request Finance já oferece cobrança, pagamentos e controles financeiros. A oportunidade é resolver uma tarefa operacional estreita — conciliar recebimentos parciais, ligar cada entrada ao lote e explicar o rateio — com integração ao processo que a cooperativa já usa. A existência dessa lacuna em clientes brasileiros ainda precisa ser validada. [AgriDex](https://agridex.com/), [Request Finance](https://www.requestfinance.com/).

**Não há alegação de pioneirismo.** A contribuição proposta é a combinação de vínculo por lote, conferência dos recebimentos, divisão transparente de preço-base e prêmio e compatibilidade com diferentes carteiras. Nenhuma dessas características isoladamente constitui exclusividade comprovada.

## 2. Método e limites

Foram consultadas fontes institucionais brasileiras, páginas oficiais de produtos, documentação técnica e um comunicado de fornecedor diretamente envolvido em integração. Os dados setoriais descrevem o mercado agro; não demonstram adoção de stablecoins, intenção de compra ou disposição a pagar pelo SafraFlux.

As afirmações deste estudo têm quatro classificações:

| Classe | Como ler |
| --- | --- |
| Fato documental | Informação atribuída à fonte e ao período de referência |
| Declaração do fornecedor | Oferta ou resultado descrito pelo próprio concorrente, sem auditoria independente nesta pesquisa |
| Inferência | Interpretação para decidir o recorte do produto |
| Hipótese | Premissa que só entrevistas, documentos operacionais ou pilotos poderão confirmar |

Não foram feitas entrevistas, testes comerciais, cotações de prestadores, auditorias de concorrentes, verificação de contratos de exportação ou parecer jurídico. O funcionamento do protótipo é documentado no README do repositório; a especificação comercial abaixo não deve ser confundida com funcionalidades já entregues.

## 3. Evidências de mercado

| Evidência | Referência temporal e fonte | O que sustenta | O que não sustenta |
| --- | --- | --- | --- |
| Exportações do agronegócio brasileiro: US$ 169,2 bilhões, equivalentes a 48,5% das exportações do país | Ano civil 2025; MAPA, publicado em 08/01/2026 | Relevância de fluxos internacionais no agro | TAM de software, volume em cripto ou economia realizável |
| Café brasileiro: 40,049 milhões de sacas de 60 kg, US$ 15,586 bilhões e 121 destinos | Ano civil 2025; Cecafé, publicado em 19/01/2026 | Cadeia exportadora com muitos corredores internacionais | Tamanho específico dos cafés especiais ou número de contas que comprariam o produto |
| 1.254 cooperativas agropecuárias e 1.132.303 cooperados | Ano-base 2025; AnuárioCoop 2026, OCB | Uma base institucional possível para expansão futura | Número de cooperativas de café, exportadoras ou prontas para stablecoins |
| 5.073.324 estabelecimentos agropecuários; 3.897.408 classificados como agricultura familiar | Censo Agropecuário 2017; IBGE, publicação de 25/10/2019 | Estrutura histórica fragmentada da produção | Contagem atual de produtores nem mercado pagante do SafraFlux |

Fontes: [MAPA — exportações em 2025](https://www.gov.br/agricultura/pt-br/assuntos/noticias/agronegocio-brasileiro-fecha-2025-com-recorde-em-exportacoes-de-us-169-bilhoes-e-superavit-de-us-149-07-bilhoes), [Cecafé — ano civil 2025](https://www.cecafe.com.br/publicacoes/noticias/cecafe-exportacao-cafe-2025-20260119/), [OCB — ramo agropecuário, base 2025](https://www.somoscooperativismo.coop.br/anuariocoop/ramo-agropecuario), [IBGE — Censo Agro 2017](https://agenciadenoticias.ibge.gov.br/agencia-sala-de-imprensa/2013-agencia-de-noticias/releases/25789-censo-agro-2017-populacao-ocupada-nos-estabelecimentos-agropecuarios-cai-8-8).

**Leitura:** café é um recorte inicial plausível porque permite trabalhar com contratos, lotes e compradores externos identificáveis. Isso é uma escolha de produto; os dados acima não provam que o problema de conciliação seja prioritário para esse público. O estudo usa o ano civil de 2025 para a comparação setorial e não mistura seus valores com os de ano-safra.

## 4. Três oportunidades comparadas

As notas abaixo são julgamento de projeto, de 1 a 5; quanto maior, melhor. Não são resultados de pesquisa com usuários. Pesos: utilidade operacional 30%, viabilidade de MVP 25%, diferenciação 20%, menor dependência regulatória/operacional 15%, adequação Solana 10%.

| Oportunidade | Utilidade | MVP | Diferenciação | Dependências | Solana | Nota ponderada |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| **A. Recebimento e conciliação por lote, com demonstrativo por produtor** | 4 | 5 | 3 | 4 | 5 | **4,15/5** |
| B. Tokenização de safra/recebíveis para antecipação de capital | 5 | 2 | 2 | 1 | 4 | 2,95/5 |
| C. Painel genérico de tesouraria agro com várias carteiras | 3 | 5 | 1 | 4 | 4 | 3,35/5 |

### A. Conciliação por lote e rateio — escolhida

**Comprador hipotético:** responsável financeiro de cooperativa ou exportadora que já possui comprador externo e consegue receber stablecoins por um arranjo lícito. **Usuários:** financeiro, responsável pelo contrato, contador e produtor que consulta o demonstrativo. **Dor a investigar:** tempo gasto para reconciliar transferências com lotes, recebimentos parciais e valores devidos a cada participante.

A blockchain oferece um registro compartilhado das transferências. O software adiciona o contexto comercial que não existe em um saldo de carteira: lote, contrato, moeda, contraparte e regra de divisão. A parte física continua exigindo documentação e verificação fora da rede.

**Principal objeção:** para clientes que recebem apenas em reais ou cujo banco já entrega uma conciliação suficiente, o produto pode acrescentar complexidade. Nesse caso, não há razão para impor cripto. O piloto só deve avançar quando houver demanda operacional por esse meio de recebimento.

### B. Antecipação/tokenização de safra — adiada

Tem apelo porque aproxima capital e produção. Exige, porém, comprovar lastro, titularidade, gravames, qualidade, custódia do produto, cobrança, perdas e elegibilidade dos investidores. Agrotoken/Justoken e Nagro já trabalham em áreas próximas de garantias e crédito. Um protótipo de carteira não resolve esses requisitos. [Justoken](https://www.justoken.com/), [Nagro](https://nagro.com.br/).

Também cresce a exposição regulatória: a CVM avalia a essência econômica dos direitos associados aos tokens, inclusive recebíveis. A decisão é não emitir token próprio, não prometer rendimento nem vender frações de safra nesta versão. [CVM — Parecer 40](https://www.gov.br/cvm/pt-br/assuntos/noticias/2022/cvm-divulga-parecer-de-orientacao-sobre-criptoativos-e-o-mercado-de-valores-mobiliarios).

### C. Tesouraria multiwallet genérica — componente, não tese principal

Consolidar saldos e transações pode ser útil, mas o diferencial agro fica fraco. Soluções financeiras horizontais já oferecem parte relevante dessa experiência. Usar o painel de carteiras como entrada para o fluxo por lote é mais coerente do que apresentá-lo como inovação suficiente.

## 5. Mapa competitivo

O quadro descreve ofertas públicas observadas; “não confirmado” significa ausência de evidência nesta pesquisa, e não ausência da funcionalidade no concorrente.

| Referência | Oferta documentada | Relação com SafraFlux | Implicação |
| --- | --- | --- | --- |
| **AgriDex** | Marketplace agrícola e liquidação internacional; comunicado da Utila descreve infraestrutura de carteiras em Solana para pagamentos em stablecoins | Concorrente mais próximo de agro + pagamentos on-chain, inclusive café | “Agro na Solana” já existe. Especializar no financeiro brasileiro e no demonstrativo por produtor; confirmar lacunas em demonstração comercial |
| **Agrotoken / Justoken** | O endereço Agrotoken redireciona a Justoken. Oferta atual inclui tokenização, garantias digitais para crédito e rastreabilidade | Referência em ativos reais e infraestrutura institucional | Não disputar originação de crédito ou alegar que um token comprova estoque |
| **GrainChain** | Conjunto de produtos para transações, estoque, pré-colheita e logística | Concorrente de processo agro, mais abrangente | Integração com sistemas operacionais é mais plausível que substituição de toda a cadeia |
| **Request Finance** | Conta empresarial, contas a pagar/receber, aprovações, pagamentos e controles com stablecoins; preço anunciado a partir de US$ 50/mês | Forte substituto horizontal | Cobrança e painel de saldo são recursos básicos; o valor precisa estar na conciliação agro |
| **Huma Finance / PayFi** | Financiamento de pagamentos; documentação distingue produto em Solana e oferta institucional | Infraestrutura adjacente, com liquidez e risco de crédito | Possível integração futura depende de elegibilidade e contratos; não existe parceria ou integração confirmada |
| **Nagro** | Crédito voltado ao produtor rural | Substituto quando o problema real é capital de giro | Se entrevistas apontarem falta de crédito como prioridade, o recorte atual pode não ser suficiente |
| **Agrofy** | Referência histórica de marketplace agro; comunicado da Case IH documenta parceria em 2023 | Benchmark de comercialização e aquisição de usuários | Situação comercial atual no Brasil não confirmada por fonte primária nesta pesquisa; não pressupor operação ativa ou integração |
| **Banco + ERP + planilha** | Alternativa operacional a levantar diretamente com cada entrevistado | Principal substituto a vencer no piloto | Comparar tempo, erros, custo total e capacidade de auditoria, não apenas taxa da rede |

Fontes oficiais e de partes diretamente envolvidas: [AgriDex](https://agridex.com/), [Utila — integração com AgriDex](https://utila.io/blog/agridex-stablecoin-payments-solana), [Agrotoken → Justoken](https://www.agrotoken.com/), [GrainChain — produtores](https://www.grainchain.com/components/pages/farmers.html), [Request Finance](https://www.requestfinance.com/), [preços Request Finance](https://www.requestfinance.com/pricing), [Huma — documentação](https://docs.huma.finance/about-huma/what-is-huma), [Huma — redes e modalidades](https://docs.huma.finance/products/huma-2.0/faqs), [Nagro](https://nagro.com.br/), [Case IH — Agrofy, 24/04/2023](https://media.cnh.com/latin-america-portuguese/case-ih/case-ih-realiza-parceria-agrofy/s/5fc2fe67-4fa3-42bd-ae20-dce62fd7f75e).

Os volumes, economias e depoimentos publicados pelos fornecedores não foram auditados e não são usados para projetar resultados do SafraFlux. Preços e disponibilidade podem mudar; a referência de US$ 50 é observação da página na data de corte, não cotação para clientes brasileiros.

## 6. Produto proposto e diferencial verificável

### Fluxo principal

1. A organização cadastra contrato, lote, valor esperado, moeda, destinatário e regra de divisão.
2. Vincula a cobrança a uma referência própria; uma chave pública conectada não comprova a identidade jurídica do comprador nem a propriedade do café.
3. O comprador recebe instruções de pagamento com rede e ativo inequívocos.
4. O sistema consulta as transações e valida destinatário, ativo, valor, estado da transação e referência, quando suportada.
5. Recebimentos parciais, excedentes ou divergentes ficam identificados; aprovação manual tem responsável e justificativa.
6. O demonstrativo separa preço-base, prêmio documentado, despesas contratadas e valor atribuível a cada produtor.
7. O financeiro exporta a conciliação para seu processo contábil. Um rateio calculado não significa que um repasse foi executado.

### Exemplo de uso — inteiramente ilustrativo

Um lote tem recebimento esperado de 10.000 USDC, dos quais 500 USDC correspondem a prêmio documentado. Duas transferências válidas, de 6.000 e 4.000 USDC, compõem a entrada. O financeiro precisa distinguir “recebido”, “valor atribuído ao produtor” e “efetivamente repassado”. A porcentagem destinada a cada produtor vem do contrato; o sistema não presume que todos tenham a mesma participação nem que o prêmio siga o rateio do valor-base.

Esses números são dados de exemplo, sem cliente, safra ou transação comercial real. O objetivo é testar a explicação do dinheiro, inclusive arredondamentos, e não estimar tíquete médio.

### Multiwallet tem escopo preciso

Solana é a rede, e não uma carteira. “Multiwallet” significa compatibilidade com diferentes aplicativos de carteira e acompanhamento de mais de um endereço autorizado. Isso não equivale automaticamente a multichain. O MVP deve priorizar carteiras compatíveis com Solana; outras redes só entram após confirmação das regras do hackathon e de uma necessidade validada. Não exigir bridge, swap ou depósito conjunto para executar o fluxo inicial.

### O que precisa ser demonstrado para sustentar a inovação

- Uma transação não pode ser contabilizada duas vezes, inclusive em lotes diferentes.
- Um recebimento parcial não pode aparecer como quitação total.
- A origem do prêmio e a regra de divisão precisam ser explicáveis.
- Alterações em dados comerciais precisam manter histórico.
- Token, rede e endereço devem ser validados; o símbolo de um ativo sozinho não basta.
- O usuário deve conseguir exportar o vínculo entre contrato, lote e assinatura da transação.

O registro on-chain comprova apenas os fatos verificáveis na rede. Não prova entrega, qualidade, certificação, ausência de desmatamento ou legitimidade do contrato. Um arquivo anexado também não equivale a auditoria independente.

## 7. Dimensionamento: contexto, cenários e incógnitas

**TAM de software para cooperativas/exportadoras de café:** ainda não apurado. Não há, nesta pesquisa, lista deduplicada de organizações elegíveis nem taxa de adoção de stablecoins. O valor exportado de café não é receita potencial do SafraFlux.

Para orientar a descoberta, usa-se um modelo de assinatura por organização. Todos os preços e filtros seguintes são hipóteses, não projeções validadas.

| Camada | Fórmula de cenário | Resultado anual | Limite de interpretação |
| --- | --- | ---: | --- |
| TAM expandido de referência, todas as cooperativas agro | 1.254 organizações × R$ 900/mês × 12 | R$ 13.543.200 | Apenas teto aritmético sob adoção integral e preço uniforme; inclui muitas organizações fora do público inicial |
| SAM de trabalho | 40 organizações qualificadas × R$ 900/mês × 12 | R$ 432.000 | As 40 são meta hipotética de qualificação, não contagem encontrada em mercado |
| SOM operacional em 12 meses | 6 clientes pagantes × R$ 900/mês × 12 | R$ 64.800 | Receita anualizada se todos permanecessem 12 meses; não faturamento esperado no primeiro ano |

O SOM parte da capacidade comercial hipotética: qualificar 40 contas, obter 12 conversas aprofundadas, executar 6 pilotos e converter até 6 contratos. Conversões não estão demonstradas; converter todos os pilotos é uma premissa otimista. Um cenário com 3 contratos gera R$ 32.400 de receita anualizada. Com zero conversões, a receita é zero.

**Sensibilidade do preço, mantendo as mesmas contas:**

| Mensalidade hipotética | 40 contas — receita anualizada | 6 contas — receita anualizada |
| ---: | ---: | ---: |
| R$ 300 | R$ 144.000 | R$ 21.600 |
| R$ 900 | R$ 432.000 | R$ 64.800 |
| R$ 1.500 | R$ 720.000 | R$ 108.000 |

Próximo passo para transformar cenário em estimativa: construir cadastro de cooperativas e exportadoras, deduplicar matriz/filial/grupo, confirmar atuação em café, exportação própria, número de lotes e existência de contraparte apta a pagar em stablecoins. Contar organizações pagantes, não todos os produtores representados.

## 8. Receita, custos e economia para o cliente

### Hipótese de receita

Cobrar assinatura por organização, com quantidade de lotes/usuários e suporte definidos. Testar R$ 300, R$ 900 e R$ 1.500 mensais por meio de propostas de valor equivalentes e entrevistas de preço. Integração e migração podem exigir implantação cobrada separadamente, depois de conhecer o esforço.

A primeira versão não depende de token próprio, valorização de criptoativo, venda de dados pessoais ou comissão sobre crédito. Uma assinatura de software não resolve, por si só, a classificação regulatória de atividades eventualmente prestadas.

### Custos que precisam de cotação

| Categoria | Direcionador |
| --- | --- |
| RPC/indexação de blockchain | Endereços, frequência de consulta, histórico e disponibilidade |
| Hospedagem, banco de dados e backups | Usuários, documentos, trilha de alterações, recuperação |
| Suporte e integração | Horas por organização, importação de dados, treinamento |
| Segurança | Revisão de código, dependências, monitoramento e resposta a incidentes |
| Jurídico, contabilidade e privacidade | Modelo operacional, corredores internacionais, contratos e tratamento de dados |
| Prestador de conversão e controles de contraparte | Cobertura geográfica, spread, volume, exigências de cadastro e análise |
| Rede | Assinaturas, prioridade, criação de contas e transações efetivamente enviadas |

Não foram obtidas cotações. Taxa de rede não representa custo total: conversão, spread, suporte, tributação, cadastro e operação podem dominar o orçamento.

**Exercício de viabilidade, não orçamento:** mensalidade de R$ 900 menos custo variável de R$ 200 deixa contribuição de R$ 700 por conta antes de tributos, aquisição e demais despesas. Com custo fixo hipotético de R$ 8.000/mês, seriam necessárias 12 contas; com R$ 30.000/mês, 43 contas. A meta inicial de 6 clientes, portanto, não demonstraria sustentabilidade nessas premissas. O custo de equipe deve ser incluído ao elaborar o orçamento real.

### Como medir valor sem prometer economia

Registrar minutos gastos por recebimento, retrabalho, divergências, atrasos e custo total do processo atual. No piloto, repetir a medição com os mesmos tipos de operação. O produto só pode alegar redução após observar o resultado. Não usar percentuais de economia publicados por concorrentes como desempenho próprio.

## 9. Distribuição e adoção

O canal inicial proposto é venda consultiva a poucas organizações, com participação de seus contadores e compradores. Associações setoriais e redes de cooperativas são caminhos de acesso a pesquisar; não existem parcerias com OCB, Cecafé, bancos, corretoras ou qualquer concorrente citado.

Começar com conciliação paralela de documentos anonimizados permite medir utilidade sem alterar imediatamente o meio de pagamento. Depois, um piloto em ambiente de teste verifica carteira e regras de conciliação. Transações comerciais reais só entram quando responsáveis, prestadores, contratos e controles forem definidos.

O principal risco de aquisição é a dependência de dois lados: o financeiro precisa da ferramenta e ao menos uma contraparte precisa ter uma razão concreta para pagar dessa forma. Marketing voltado apenas ao produtor não resolve essa dependência. O produto deve preservar um caminho de exportação dos dados e convivência com ERP/contabilidade.

## 10. Fronteira regulatória e operacional

O Banco Central publicou as Resoluções BCB 519, 520 e 521 em 10/11/2025. As regras de autorização e prestação de serviços de ativos virtuais entraram em vigor em 02/02/2026; a norma 521 trata de atividades no mercado de câmbio e capitais internacionais, com obrigações de informações a partir de 04/05/2026. Isso torna inadequado apresentar pagamentos internacionais em stablecoin como área sem regulação. [BCB — explicação oficial](https://www.bcb.gov.br/detalhenoticia/20918/nota?s=08), [Resolução 520](https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?numero=520&tipo=Resolu%C3%A7%C3%A3o+BCB), [Resolução 521](https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?numero=521&tipo=Resolu%C3%A7%C3%A3o+BCB).

O desenho inicial proposto é software de organização e conciliação com carteiras controladas pelos usuários. Isso reduz algumas dependências de custódia, mas não constitui conclusão de dispensa regulatória. O enquadramento depende das atividades efetivas, contratos, fluxo de fundos e atuação dos parceiros. Antes de operação comercial, revisar normas vigentes, eventuais alterações e condições aplicáveis ao prestador escolhido.

Para tokenização, a CVM considera direitos econômicos e características da oferta; tokens de recebíveis podem estar sujeitos às regras de valores mobiliários. A pesquisa não recomenda lançar crédito, token de investimento ou remuneração automática no MVP. [CVM — tokens de recebíveis](https://www.gov.br/cvm/pt-br/assuntos/noticias/2023/cvm-orienta-sobre-caracterizacao-de-tokens-de-recebiveis-e-de-tokens-de-renda-fixa-como-valores-mobiliarios).

Questões de implantação que permanecem abertas: tratamento contábil/fiscal, identificação das partes, conversão para reais, documentação de exportação, privacidade de contratos e produtores, retenção de dados e responsabilidade em disputas. Dados pessoais, documentos comerciais e coordenadas sensíveis não devem ser publicados em uma rede pública como parte da demonstração.

## 11. Plano de validação — 14 entrevistas ainda não realizadas

| Grupo | Quantidade planejada | Pergunta decisiva |
| --- | ---: | --- |
| Financeiro de cooperativas/exportadoras | 4 | A conciliação de lote e rateio exige trabalho recorrente suficiente para justificar compra? |
| Produtores participantes dessas cadeias | 3 | O demonstrativo esclarece preço, prêmio e descontos que hoje geram dúvidas? |
| Compradores/importadores | 3 | Existe interesse concreto em pagar nesse ativo/rede e qual obstáculo impede isso? |
| Contadores com experiência em exportação/agro | 2 | Que informação é necessária para transformar o registro em evidência útil? |
| Profissional de prestador de pagamentos e especialista jurídico | 2 | Qual arranjo operacional é viável para o corredor proposto? |
| **Total** | **14** | **Nenhuma entrevista realizada até a data de corte** |

### Roteiro, sem induzir a resposta

1. Descreva o último recebimento de exportação e como foi ligado ao lote.
2. Quais documentos e sistemas foram usados? Quem precisou conferir?
3. Quanto tempo levou? Houve divergência, pagamento parcial ou retrabalho?
4. Como o valor de cada produtor e o prêmio de qualidade são calculados e comunicados?
5. Qual problema teria prioridade de orçamento neste trimestre?
6. Já houve solicitação de pagamento em stablecoin? Se houve, qual foi o desfecho?
7. Quais requisitos impediriam um piloto? Quem aprovaria a contratação?
8. Depois de mostrar o fluxo, peça que a pessoa execute uma tarefa e explique o resultado.
9. Compare o preço proposto com o custo observado do processo; evite “você usaria?” como único sinal.
10. Solicite, quando autorizado, documentos anonimizados e compromisso concreto de próximo passo.

### Critérios de avanço propostos

- Ao menos 3 organizações confirmam dor recorrente com evidência operacional.
- Pelo menos 10 recebimentos históricos anonimizados permitem testar conciliação, incluindo exceções.
- Dois interessados aceitam um piloto com escopo, responsável e critério de sucesso definidos.
- O piloto reduz em 50% o tempo mediano de conferência na amostra, sem falsa quitação ou dupla contagem; meta a testar, não resultado alcançado.
- O contador consegue usar a exportação do demonstrativo e o responsável compreende seus limites.
- Há corredor operacional e prestador admissível para pagamento real, se essa etapa for proposta.

**Critérios de revisão ou abandono:** ausência de demanda por stablecoin; custo total superior ao processo atual sem benefício de controle; necessidade de substituir todo o ERP; usuário valoriza somente crédito; integração exige esforço que a mensalidade não cobre; ou solução concorrente já resolve o problema com implantação aceitável.

## 12. Registro da decisão e próximos artefatos

| Decisão | Motivo | Evidência ainda necessária |
| --- | --- | --- |
| Começar com café e organizações intermediárias | Recorte de contrato/lote permite demonstração compreensível | Confirmar prioridade do problema e acesso a compradores |
| Priorizar conciliação e demonstrativo | Permite uma entrega verificável sem inventar lastro | Documentos e fluxo real de 3 organizações |
| Solana primeiro, múltiplas carteiras | Alinhamento ao ecossistema e menor escopo inicial | Compatibilidade efetivamente testada e regras do evento |
| Não criar token próprio | Evita depender de especulação e de emissão desnecessária | Nenhuma emissão é necessária ao fluxo proposto |
| Assinatura como hipótese inicial | Receita vinculada ao uso do software | Disposição a pagar e custo de servir |
| Adiar crédito e tokenização | Dependências excedem o MVP | Estrutura jurídica, parceiros, garantias e gestão de risco |

Esta pesquisa sustenta uma direção de descoberta e um MVP delimitado. A validação comercial continua em aberto. As próximas evidências úteis são contas qualificadas, entrevistas, documentos anonimizados, comparação com concorrentes em demonstração e métricas de um piloto.
