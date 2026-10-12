# Integração comercial do Acalma (revisada em 13/10/2026)

Branch `integracao/comercial-2026-10` (a partir do protótipo aprovado `a7b76a4`).
**Nada em produção.** Sem `VITE_ACALMA_MODO=integrado` o app roda em demonstração: sem login,
sem pagamento, dados só no navegador e simulações rotuladas em `/demonstracao/acesso`.

1. `01-ARQUITETURA.md`: Nina verificada, conta compartilhada sem trial, compras, acesso, offline, sincronização, testes.
2. `02-CONTEUDO.md`: inventário, faixa etária, pontos de revisão profissional, aparelho × sincronização.
3. `03-NINA-CONVITE.md`: passagem explícita para a Nina (implementada localmente, não publicada).
4. `04-PUBLICACAO.md`: o que depende de você, decisões, ordem de publicação e recuperação.
5. `05-ROTEIRO-VALIDACAO.md`: roteiro integrado real (compra → e-mail → vínculo → acesso → sincronização → reembolso).

**Não está pronto para vender** enquanto o roteiro 5 não passar com produto e e-mail reais.

A parte de banco e functions está no repositório da Nina, branch local `acalma/integracao-comercial`
(entregue no pacote como bundle e patches; não enviada ao GitHub).
