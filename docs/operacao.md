# Operação e recuperação

1. Entre pela apresentação e abra a operação. A hospedagem atual exige uma conta autorizada no site privado.
2. Cadastre produtores por código e lotes por produto, safra e quantidade. Evite dados pessoais desnecessários.
3. Registre a etapa do lote. O histórico registra a gravação; a etapa é uma declaração de quem opera o sistema.
4. Crie a cobrança a partir do lote quando o comprador utilizar USDC em Solana. Consulte saldos sem precisar conectar uma extensão.
5. Calcule o rateio com valor declarado ou recebido verificado. Salve a memória; valores declarados continuam identificados como sem comprovação.
6. Consulte rateios salvos em Operação agrícola. Exporte CSV para revisão externa.
7. Exporte JSON em Configurações. Guarde a cópia fora do site e não a publique no GitHub.

## Se ocorrer um conflito

Outra sessão gravou antes. A ação não sobrescreve os dados. Copie o rascunho se necessário, use Atualizar dados do servidor e repita a ação sobre a versão atual. Recarregar a página também busca a versão atual, mas descarta campos ainda não salvos.

## Se faltar um registro

Consulte as cópias automáticas. Recuperar reúne os registros ausentes da cópia com os atuais. Não é reversão de etapas e não apaga o presente. Conflitos em cobranças são recusados. Pagamentos recuperados de arquivo exigem nova consulta à rede.

## Se o serviço estiver indisponível

Não há confirmação falsa de salvamento. Preserve o texto do formulário e tente novamente quando o serviço voltar. Não repita pagamentos; a aplicação não envia transferências. O histórico permite conferir se uma ação foi gravada antes de uma interrupção de conexão.

## Administração

Migrações ficam em drizzle/ e são aplicadas antes da publicação do servidor. Migrações aplicadas nunca devem ser editadas. O backend depende da identidade do dispatcher do Sites e do binding DB. Acesso público, convites e equipes exigem configuração explícita; não trocar a política privada durante publicação rotineira.
