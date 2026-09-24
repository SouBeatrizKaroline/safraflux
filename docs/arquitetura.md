# Arquitetura do SafraFlux

## Fluxo atual

Navegador → autenticação do Sites → Worker → D1. O navegador consulta saldos públicos; o servidor confere recebimentos antes de registrá-los. Nenhuma chave privada é coletada e nenhum repasse é assinado.

A página / apresenta a ferramenta. /app abre o painel. As rotas /signin-with-chatgpt e /signout-with-chatgpt pertencem à plataforma de autenticação, não são formulários de senha implementados pelo projeto. A política de acesso do site continua privada.

## Dados e autorização

O servidor usa o identificador estável encaminhado pelo Sites. Todas as consultas de registros, histórico e cópias filtram por esse titular. Cabeçalhos de identidade só são confiáveis atrás do dispatcher do Sites; expor o Worker diretamente sem uma camada que autentique e remova cabeçalhos enviados pelo cliente quebra essa fronteira de segurança.

- workspaces: estado operacional e revisão por titular.
- events: revisão, tipo de operação, horário e SHA-256 do estado salvo. A API não oferece alteração ou exclusão de eventos.
- snapshots: últimas 20 gravações por conta, para recuperar registros ausentes.
- request_limits: contador por conta e minuto, com limite de 120 requisições.

A operação verifica a revisão antes de gravar. A chave única titular + revisão no histórico, a atualização do estado e a cópia são executadas em um batch transacional. Concorrência gera conflito, preservando a primeira gravação. O digest não é uma assinatura independente e não protege contra um administrador do banco.

O estado tem limite de 2 MB; até 30 carteiras, 500 cobranças, 500 produtores, 500 lotes e 500 rateios. São limites operacionais explícitos, não um dimensionamento para grande volume. O histórico completo fica no banco; a interface mostra os últimos 100 eventos.

## Operações

A API aceita ações específicas, sem endpoint para substituir livremente o estado. Carteiras e cobranças recebem IDs no servidor. Cobranças não aceitam valores recebidos enviados pelo cliente. A conciliação confere finalized, gênese, assinatura, data, referência na instrução SPL, mint, ATA e crédito líquido. Provedores de conciliação são definidos no código para impedir destinos arbitrários de requisição do servidor.

Lotes percorrem cadastrado → beneficiamento → pronto → expedido → entregue. Cancelamento é permitido antes da expedição. Essas etapas são declarações operacionais, sem certificação automática. Produtores podem ser arquivados. Rateios salvos conservam entradas, regra kg-quality-v1, resultados e origem do valor.

Base proporcional aos kg; prêmio proporcional a kg × pontos. Maiores restos preservam exatamente o total até seis casas. O servidor recalcula os resultados; não aceita linhas calculadas pelo cliente como autoridade.

## Recuperação

Cada gravação cria uma cópia, retendo as últimas 20. Recuperar mescla registros ausentes; não reverte alterações atuais, não apaga registros e não transforma comprovantes importados em pagamentos verificados. Exporte JSON regularmente para ter uma cópia independente da infraestrutura. O histórico de eventos não é importado como histórico autêntico.

A migração da versão antiga é uma ação explícita em Configurações. A cópia local original permanece intacta. Preferências de RPC ficam no navegador; dados operacionais ficam no servidor.

## Execução local

npm run dev:test utiliza SQLite real em .local/ e uma identidade explicitamente de teste. O adaptador remove os cabeçalhos de identidade recebidos do cliente e escuta somente loopback. npm run dev não atribui identidade e a API responde 401. Não exponha o servidor de desenvolvimento na internet.

## Limites restantes

Não há espaço compartilhado entre funcionários, papéis de aprovação, anexos privados, integração contábil, câmbio, custódia ou transferência automática. A primeira publicação com banco precisa ser conferida na plataforma; testes locais de autenticação não substituem a autenticação hospedada. Pagamento externo completo foi adiado a pedido da proponente. Revisão independente de segurança e validação comercial permanecem necessárias.
