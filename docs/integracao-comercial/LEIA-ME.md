# Integração comercial do Acalma (rodada de 12/10/2026)

Branch `integracao/comercial-2026-10` (a partir do protótipo aprovado `a7b76a4`).
**Nada em produção.** Sem `VITE_ACALMA_MODO=integrado` o app roda em demonstração: sem login,
sem pagamento, dados só no navegador e simulações rotuladas em `/demonstracao/acesso`.

1. `01-ARQUITETURA.md`: Nina verificada, conta compartilhada sem trial, compras, acesso, offline, sincronização, testes.
2. `02-CONTEUDO.md`: inventário, faixa etária, pontos de revisão profissional, aparelho × sincronização.
3. `03-NINA-CONVITE.md`: ponto de integração e regras do convite (não implementado).
4. `04-PUBLICACAO.md`: pendências externas, decisões, ordem de publicação e rollback.

A parte de banco e functions está no repositório da Nina, branch local `acalma/integracao-comercial`
(entregue no pacote como bundle e patches; não enviada ao GitHub).
