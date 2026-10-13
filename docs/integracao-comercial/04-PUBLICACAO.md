# Publicação e recuperação (revisado em 13/10/2026)

**Não está pronto para vender.** Falta comprovar, com produto, e-mail e dinheiro reais, a compra, o acesso por e-mail e o reembolso (`05-ROTEIRO-VALIDACAO.md`). Até lá, as vendas continuam **bloqueadas** na Hotmart.

## Valores fixos (não secretos)

| Item | Valor | Onde está ou vai |
|---|---|---|
| Produto Hotmart | **8715752**: "Acalma \| Ajuda prática na hora da birra", R$ 14,90, pagamento único | segredo `ACALMA_HOTMART_PRODUTO_IDS` (Supabase, na publicação) e docs |
| Checkout | `https://pay.hotmart.com/L108001786T` | `netlify.toml`, contexto de produção (`VITE_ACALMA_CHECKOUT_URL`); página `nexo-edu.com/acalma.html` (já publicada por você) |
| Nina | `https://app.nexo-edu.com` | `netlify.toml`, produção (`VITE_NINA_URL`) |
| Acalma | `https://acalma.nexo-edu.com` | site Netlify `acalma-nexoedu` |
| Projeto Supabase (Nina) | `https://eizkmbqnvhxwvepiyxeg.supabase.co` | `VITE_NEXO_SUPABASE_URL` no Netlify, na publicação |
| Webhook a cadastrar na Hotmart | `https://eizkmbqnvhxwvepiyxeg.supabase.co/functions/v1/acalma-hotmart` (só o produto 8715752; mesmo hottok da conta) | painel da Hotmart |

Conferências feitas sem comprar (13/10):
- **Checkout:** enquanto as vendas estão bloqueadas, mostra só "as vendas deste produto estão temporariamente encerradas" (erro 049). **Nome, preço e pagamento único não puderam ser vistos** e serão conferidos no passo B1, antes da compra de teste.
- **`nexo-edu.com/acalma.html`:**
  - aponta para esse checkout;
  - diz "R$14,90 · Pagamento único · Sem mensalidade";
  - diz que não exige a Nina;
  - não diz "vitalício".
- **Falta na página:** avisar antes da compra que o acesso fica no e-mail da compra e que uma conexão a cada 30 dias confirma o acesso. Texto sugerido (você publica): *"O acesso fica no e-mail usado na compra. Funciona sem internet depois de entrar; uma conexão a cada 30 dias confirma o seu acesso."*

## Dados jurídicos e de suporte encontrados (para você confirmar)

Encontrados nos Termos e na Política de Privacidade da Nina publicados (vigência de 25/09/2026). Nada foi copiado para o Acalma: os termos do Acalma continuam com `[pendentes]` e o build comercial continua bloqueado até você confirmar.

| Campo | Encontrado | Situação |
|---|---|---|
| Fornecedora e controladora | Vanderleia da Silva, pessoa natural (nenhum CNPJ nos documentos) | confirmar se vale também para o Acalma |
| Nome comercial | NexoEdu / Nina AI | confirmar o nome para o Acalma |
| Endereço | Av. Borges de Medeiros, nº 4901, Centro, Gramado/RS | confirmar |
| Atendimento e privacidade | comercial@nexo-edu.com | confirmar como suporte do Acalma (`VITE_ACALMA_SUPORTE_EMAIL`) |
| Encarregado de dados (DPO) | não nomeado nos documentos | decidir |
| Foro | "foro legalmente competente, inclusive o do domicílio do consumidor" (Nina, 30.3) | confirmar |

Pendentes de decisão, sem valor inventado:
- faixa etária comercial;
- política de encerramento do serviço;
- retenção das compras após exclusão;
- os 8 pontos de revisão de conteúdo (nenhum validado).

## Sequência de implantação

### Fase A: produção configurada, vendas bloqueadas, sem dinheiro
1. Você confirma os dados jurídicos e de suporte; eu preencho os termos e a privacidade do Acalma. Só assim o build comercial deixa de ser bloqueado.
2. Migrations, nesta ordem (fluxo normal de migrations, nunca `supabase config push`):
   1. `20261012100000_acalma_entrada_sem_trial_nina.sql`
   2. `20261012110000_acalma_compras_e_acesso.sql`
   3. `20261012120000_acalma_dados_sincronizados.sql`
   4. `20261012130000_acalma_passagem_nina_e_exclusao.sql`

   (Não confundir com `20260930130000_conceder_reativacao.sql`, que fica fora.) Depois, conferir só leitura que um cadastro normal da Nina ainda cria trial.
3. `delete-user` (funciona com ou sem a migration 4).
4. Segredo `ACALMA_HOTMART_PRODUTO_IDS=8715752` + deploy de `acalma-hotmart` (`--no-verify-jwt`) e `hotmart-webhook-`.
5. Webhook na Hotmart (URL acima, só 8715752) + **evento de teste da própria Hotmart**. Prova a conectividade e o hottok. Se o produto do teste não for o 8715752, a resposta é "ignorado" e nada é gravado (esperado).
6. Template "Magic Link" do Supabase Auth com `{{ .Token }}` (o link da Nina continua).
7. App da Nina (sempre **depois** da migration 4).
8. Netlify: `VITE_ACALMA_MODO=integrado`, `VITE_NEXO_SUPABASE_URL`, `VITE_NEXO_SUPABASE_ANON_KEY` (chave pública) e `VITE_ACALMA_SUPORTE_EMAIL`, com escopo de produção. Depois, merge de `integracao/comercial-2026-10`.
9. Roteiro B do `05-ROTEIRO-VALIDACAO.md`: e-mail real com código, conta sem compra, Nina sem trial, segurança e offline.

### Fase B: janela de teste com dinheiro (cada operação autorizada à parte)

**Momento exato de liberar as vendas:** só depois de A1–A9 concluídos e conferidos, imediatamente antes da compra de teste. Operações:

| # | Operação | Quem | Bloqueio de vendas |
|---|---|---|---|
| B1 | Liberar as vendas do 8715752; conferir no checkout o nome, o preço R$ 14,90 e o pagamento único | você | liberado |
| B2 | Compra de teste com e-mail interno | você (autorização 1) | liberado |
| B3 | **Bloquear de novo** assim que a compra de teste aparecer como aprovada | você | bloqueado |
| B4 | Conferências pós-compra (roteiro C) | eu, só leitura | bloqueado |
| B5 | Reembolso da compra de teste pelo painel da Hotmart | você (autorização 2) | bloqueado |
| B6 | Conferências pós-reembolso | eu | bloqueado |
| B7 | Opcional: recompra para provar que o acesso volta (liberar → comprar → bloquear) | você (autorização 3) | liberado só durante a compra |
| B8 | Opcional: reembolso da recompra, ou manter como venda | você (autorização 4) | — |

### Fase C: lançamento
Com o roteiro completo aprovado, você libera as vendas definitivamente. Só a partir daí o Acalma está pronto para vender.

## Recuperação

O procedimento completo está em `docs/acalma/RECUPERACAO.md` (repositório da Nina; cópia no pacote): estados do evento, conciliação e pausa.

| | Antes da 1ª venda | Depois de existirem clientes |
|---|---|---|
| Banco | rollbacks em ordem inversa | **não** reverter: os rollbacks se recusam (testado). Corrigir com nova migration. |
| Liberação errada | idem | pausa do processamento (**adia também reembolsos**), correção, reprocessamento, conciliação até zerar pendências |
| Novas vendas | — | bloquear o produto 8715752 na Hotmart |
| Evento não gravado (função ou banco fora) | — | a Hotmart recebeu erro; nova tentativa dela ou reenvio manual após conciliação (`conciliacao.sql`) |
| Frontend | deploy anterior | deploy **comercial** anterior, nunca o app gratuito |
| Nina | versão anterior | versão anterior; a trava do trial fica no banco |
