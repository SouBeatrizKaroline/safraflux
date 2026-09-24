# Segurança e limites operacionais

## Reportar um problema

Use a comunicação privada de vulnerabilidades do GitHub quando habilitada em **Security → Report a vulnerability**. Se ela não estiver disponível, abra uma issue pedindo um canal privado, sem publicar credenciais, dados pessoais, endereços de clientes ou instruções de exploração.

## Modelo desta versão

- Aplicação estática, sem backend, conta de usuário, cofre, chave privada ou assinatura de transferências.
- O estado é local ao navegador. Não é um livro contábil auditável nem uma base autoritativa de uma organização.
- Quem tem acesso ao dispositivo/armazenamento pode alterar os registros. Não há proteção contra adulteração local nem autenticação dos cadastros comerciais.
- A verificação consulta um RPC. Um provedor malicioso pode fornecer dados falsos. A conferência do identificador da rede evita enganos de configuração, mas não substitui uma fonte confiável.
- Considere esta versão para avaliação técnica. Não há auditoria independente ou homologação comercial.

## Controles implementados

1. Validação de formato de endereços; identificador da rede EVM e hash de gênese Solana.
2. Lista explícita de contratos USDC publicada pela Circle; tokens arbitrários e USDC.e não são incluídos.
3. Confirmação Solana `finalized`, transação bem-sucedida, assinatura consultada, data e referência.
4. A referência precisa ser não assinante, somente leitura e parte da própria instrução SPL Transfer/TransferChecked.
5. Destino precisa ser a conta associada do destinatário para o mint correto; o crédito líquido deve corresponder às transferências identificadas.
6. Mesma assinatura não pode ser conciliada duas vezes na mesma rede dentro do estado carregado da aplicação.
7. Valores e rateios usam inteiros; nenhuma taxa ou ganho é inventado quando o provedor falha.
8. Conteúdo de formulário é escapado ao renderizar; exportação CSV trata separadores, aspas e prefixos de fórmulas.

## Limitações que afetam a operação

- Não usar várias abas/dispositivos como sistema concorrente de registro. Não há coordenação transacional ou unicidade distribuída; um backend será necessário antes de um piloto com equipe.
- Valores persistidos podem ficar desatualizados. Confira o horário e atualize a consulta antes de decidir.
- A conciliação aceita transferências SPL diretas; roteadores, instruções internas/CPI, swaps, tokens 2022 e transações com movimentos adicionais no destino não são suportados.
- Tolerância de cinco minutos na data protege contra pequenas diferenças no relógio do dispositivo. A referência aleatória é a principal ligação à cobrança.
- Pagamento por QR/link não escolhe a rede no aplicativo da carteira. O destinatário deve informar a rede; o pagador deve confirmá-la.
- Não publicar dados pessoais, documentos de contrato ou coordenadas de propriedades na blockchain. O protótipo usa apenas códigos comerciais.
- URLs RPC personalizadas ficam no armazenamento local e são utilizadas pelo navegador. Não colocar segredos de servidor ou credenciais de custódia nessas URLs.

Antes de uso comercial: backend com autenticação e papéis, trilha imutável de alterações, deduplicação transacional, backups/recuperação, múltiplas fontes RPC, testes com carteiras reais, avaliação jurídica e revisão independente de segurança.
