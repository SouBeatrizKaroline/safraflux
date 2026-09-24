# Segurança

## Reportar uma vulnerabilidade

Use Security → Report a vulnerability no GitHub. Não publique credenciais, dados de clientes ou instruções de exploração em issues públicas.

## Fronteiras de confiança

O site privado usa autenticação do Sites/ChatGPT. O Worker confia no identificador de usuário inserido pelo dispatcher da plataforma; não deve ser publicado diretamente em outro endereço sem uma camada de autenticação equivalente que remova cabeçalhos forjados. Não existem senhas ou chaves de carteira no banco do SafraFlux.

Dados são separados por conta. Todas as leituras, gravações, consultas de histórico e recuperações usam o titular autenticado. O projeto ainda não implementa organizações compartilhadas ou papéis de funcionários.

## Controles implementados

- API recusa identidade ausente, métodos não suportados e operações desconhecidas.
- Escritas exigem origem exata, JSON e cabeçalho próprio; não há CORS permissivo.
- Limite de corpo por streaming, tamanho de registros e frequência por conta.
- Consultas SQL parametrizadas e transação para estado, revisão, histórico e cópia.
- Conflitos de revisão impedem sobrescrita silenciosa entre sessões.
- Valores de comprovantes enviados pelo cliente não são aceitos. Conferência de rede acontece no servidor com provedores fixos.
- Importação valida dados, preserva registros atuais e exige nova conferência dos pagamentos.
- Conteúdo é escapado na interface; CSV protege contra prefixos de fórmulas.
- Política de conteúdo sem scripts inline, nosniff, no-referrer, no-store e restrição de câmera, microfone e geolocalização.
- Cópias automáticas das últimas 20 gravações; exportação independente em JSON.

## Riscos e limites

Um RPC malicioso ainda pode mentir. A consulta não é uma prova criptográfica independente. Não há consenso entre múltiplos provedores. A política de conexão permite HTTPS para RPCs personalizados no navegador; URLs personalizadas nunca são usadas pelo servidor para conciliação.

O histórico é protegido pela API, não contra administradores da infraestrutura. Cópias no mesmo banco não protegem contra perda da infraestrutura inteira: mantenha exportações externas privadas. O JSON pode conter nomes e dados da operação; não o envie a repositórios públicos.

Não houve auditoria independente, pentest externo ou homologação regulatória. Os testes automatizados cobrem casos definidos e não provam ausência de vulnerabilidades. A conexão com extensões e o pagamento completo permanecem pendentes. Não há custódia, repasse automático ou certificação de entrega.

## Referências

- [OWASP: segurança de APIs REST](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html)
- [OWASP: prevenção de CSRF](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [OWASP: prevenção de SSRF](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)

Aplicação dos controles não equivale a certificação OWASP.
