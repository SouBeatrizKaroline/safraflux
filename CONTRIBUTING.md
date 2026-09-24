# Contribuir com o SafraFlux

Abra uma issue descrevendo o problema, quem ele afeta e um exemplo reproduzível. Para pesquisa, inclua fonte primária, período dos dados e o que a fonte efetivamente demonstra. Hipóteses e resultados precisam ficar separados.

Para código:

1. Use Node.js 24 LTS e instale com `npm ci`.
2. Crie uma branch com uma mudança delimitada.
3. Execute `npm test` e `npm run build`.
4. Explique no pull request o comportamento antes/depois e a validação feita.
5. Atualize o README quando o escopo implementado mudar.

Mudanças em conciliação precisam de casos negativos: rede/mint/destinatário errados, referência alheia, transação pendente ou falha, duplicação e pagamentos parciais. Mudanças em rateio devem preservar a soma exata.

Não inclua seeds, chaves privadas, dados de clientes ou resultados fictícios apresentados como reais. Código e documentos originais seguem MIT; conteúdo de fontes externas continua sujeito às licenças e aos direitos de seus titulares.
