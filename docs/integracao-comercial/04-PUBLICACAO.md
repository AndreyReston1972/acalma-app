# Publicação, pendências e decisões (12/10/2026)

## Pendências externas (sem valores)

| # | Item | Quem | Onde |
|---|---|---|---|
| E1 | Criar o produto do Acalma (R$ 14,90, pagamento único) e anotar **ID do produto** e **URL do checkout**. Não reaproveitar ofertas da Nina. | Você (login na Hotmart) | Hotmart |
| E2 | Webhook da Hotmart para `…/functions/v1/acalma-hotmart`, só com o produto do Acalma, mesmo hottok já usado | Você | Hotmart |
| E3 | Segredo `ACALMA_HOTMART_PRODUTO_IDS` (ID e/ou ucode do E1) | Eu, com aprovação | Supabase da Nina |
| E4 | Template de e-mail "Magic Link" do Supabase Auth com `{{ .Token }}` (código de 6 dígitos). Afeta o e-mail do magic link legado da Nina: o link continua, o código é acrescentado. | Eu, com aprovação | Supabase Auth |
| E5 | Variáveis do Netlify, **escopo só produção**: `VITE_ACALMA_MODO=integrado`, `VITE_NEXO_SUPABASE_URL`, `VITE_NEXO_SUPABASE_ANON_KEY` (chave pública), `VITE_ACALMA_CHECKOUT_URL`, `VITE_ACALMA_SUPORTE_EMAIL`. Previews continuam em demonstração. | Você ou eu com aprovação | Netlify |
| E6 | Dados jurídicos (razão social, CNPJ, foro), canal de suporte e revisão dos termos/privacidade | Você + jurídico | `src/content/documentos.ts` |
| E7 | Revisão profissional do conteúdo (lista em 02-CONTEUDO.md) | Você + profissional | — |
| E8 | Se quiser excluir a conta NexoEdu pelo Acalma: CORS do `delete-user` para o domínio do Acalma. **Hoje o Acalma só exclui os dados do Acalma.** | Decisão | Supabase |
| E9 | Limite de envio de e-mails do Supabase Auth/SMTP para o volume de códigos | Conferir | Supabase |

## Decisões de negócio

1. **Quem já usa o Acalma gratuito.** Com o modo integrado, o app passa a pedir conta e compra.
   Os registros antigos ficam no aparelho e podem ser importados depois de entrar, mas quem não
   comprar perde o uso. Não há como identificar esses usuários (o Supabase antigo tem 0 linhas).
   Opções: (a) cortar na publicação; (b) avisar antes por uma versão intermediária com faixa
   informativa; (c) cupom na Hotmart divulgado nessa faixa. **Recomendo (b), por 2 a 4 semanas.**
2. **Janela offline:** proposta de 30 dias.
3. **Disputa (`PURCHASE_PROTEST`) mantém o acesso** até virar reembolso ou chargeback. Alternativa: suspender.
4. **Aceite dos termos implícito ao entrar** ("Ao continuar, você concorda…"), registrado com versão e data em `acalma_aceites`.
5. **Trial da Nina para quem veio do Acalma:** hoje nasce quando a pessoa entra na Nina (`create_trial_once`). Manter?
6. **`delete-user` da Nina** grava o e-mail no `trial_ledger` mesmo para quem só tem Acalma. Essa pessoa nunca terá trial da Nina. Aceitar ou ajustar?
7. **Compra após exclusão da conta:** a compra fica sem dono e é religada se a pessoa voltar com o mesmo e-mail (o acesso volta). Proposta: manter.
8. **Faixa etária:** 2 a 6 anos (proposta).
9. **Disponibilidade e encerramento:** o que acontece se o Acalma for descontinuado (prazo de aviso, exportação). Os termos têm o espaço reservado.
10. **Barra do Netlify (Drawer) nos previews:** chama `app.netlify.com`, Segment e Bugsnag. Só em preview; desligar exige mudar a configuração do Netlify.

## Ordem de publicação (depois da aprovação)

Cada passo é reversível sozinho e não quebra o anterior.

1. **E1, E6 e E7 resolvidos.**
2. **Migrations na Nina**, em ordem (`100000`, `110000`, `120000`), pelo fluxo normal de migrations. Nunca `supabase config push`.
   Conferir em seguida, só leitura: cadastro normal da Nina ainda cria trial (teste com a conta interna de homologação).
3. **Segredo E3.** Antes dele, `acalma-hotmart` responde 503 e a Nina manda produto do Acalma para a fila manual (seguro).
4. **Deploy das functions:** `acalma-hotmart --no-verify-jwt` e `hotmart-webhook-` (com o desvio do Acalma). Rodar de novo os testes Deno antes.
5. **E2 (webhook na Hotmart)** + postback de teste da própria Hotmart: conferir 1 linha em `acalma_eventos_hotmart` e nenhuma mudança em `subscriptions`.
6. **E4 (template com código).** Testar com o e-mail interno: o código chega e o magic link da Nina continua funcionando.
7. **Teste ponta a ponta antes do público:** build local em modo integrado apontando para produção, com o seu e-mail de teste e uma compra de teste da Hotmart (se você autorizar). Confere: sem trial da Nina, sem SignupStarted, acesso ativo, sincronização em dois aparelhos.
8. **Decisão 1** (versão intermediária, se escolhida).
9. **E5 (variáveis do Netlify)** e **merge** de `integracao/comercial-2026-10` na main. O Netlify publica.
10. Conferir a versão servida, a atualização de um app já instalado e o offline em aparelho real (S25 + TalkBack).

## Rollback seguro

| Camada | Como voltar | Efeito |
|---|---|---|
| Frontend | Netlify → Deploys → publicar o deploy de `4ce22f8` (ou `git revert` do merge). **Testado:** o app antigo assume na 2ª abertura, chaves `acalma_*` intactas, 1 SW. | Dados criados na versão nova ficam no aparelho (`acalma.conta.v1.*`) e no servidor, invisíveis ao app antigo. |
| Variáveis Netlify | Remover `VITE_ACALMA_MODO` e refazer o deploy | O app volta à demonstração (não serve como produção, só como pausa técnica). |
| Webhook | Desligar o webhook do Acalma na Hotmart, ou esvaziar `ACALMA_HOTMART_PRODUTO_IDS` | Sem segredo: 503 (a Hotmart reenvia depois) e a Nina manda para a fila manual. Nenhum evento se perde. |
| Functions | Republicar a versão anterior de `hotmart-webhook-` (v44 = `origin/main`) e apagar `acalma-hotmart` | Nina volta ao comportamento de hoje. |
| Banco | `supabase/rollbacks/*.rollback.sql` em ordem inversa (3 → 2 → 1). **Testado no PGlite.** O 1 restaura as funções exatas de produção. O 2 e o 3 apagam tabelas: **exportar antes**. | Contas criadas pelo Acalma continuam existindo, sem trial. O script converte `origem_conta 'acalma'` em `espontanea`, então elas **passam a contar no funil da Nina** como cadastros sem assinatura. Se houver muitas, marcar antes para filtrar nas métricas. |

Supabase antigo do Acalma: não tocar. Não apagar usuários.
