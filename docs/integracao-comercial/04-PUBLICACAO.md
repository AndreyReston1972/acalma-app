# Publicação e recuperação (revisado em 13/10/2026)

**Não está pronto para vender.** Falta a validação integrada real (roteiro em `05-ROTEIRO-VALIDACAO.md`), e ela depende do produto na Hotmart.

## O que depende de você

| # | Item |
|---|---|
| E1 | Criar o produto do Acalma na Hotmart (R$ 14,90, pagamento único) e informar o **ID** e a **URL do checkout**. O login na Hotmart é seu. |
| E2 | Na Hotmart, cadastrar o webhook `…/functions/v1/acalma-hotmart` só para esse produto (mesmo hottok). |
| E3 | Dados jurídicos (razão social, CNPJ, controlador e encarregado), canal de suporte e prazos. Sem isso, o build comercial é bloqueado de propósito. |
| E4 | Decisões finais: faixa etária comercial, política de encerramento do serviço e retenção das compras após exclusão. |
| E5 | Revisão profissional dos 8 pontos (02-CONTEUDO.md). |
| E6 | Endereço público da Nina para o convite (`VITE_NINA_URL`). |
| E7 | Autorizar cada passo de produção abaixo. |

## O que eu faço depois de cada autorização (sem expor valores)

- Segredo `ACALMA_HOTMART_PRODUTO_IDS`.
- Template "Magic Link" do Supabase Auth com `{{ .Token }}`. O link da Nina continua; o código é acrescentado.
- Variáveis do Netlify com **escopo só de produção**: `VITE_ACALMA_MODO=integrado`, `VITE_NEXO_SUPABASE_URL`, `VITE_NEXO_SUPABASE_ANON_KEY` (pública), `VITE_ACALMA_CHECKOUT_URL`, `VITE_ACALMA_SUPORTE_EMAIL`, `VITE_NINA_URL`. Os previews continuam em demonstração.
- Conferir o limite de envio de e-mails do Auth/SMTP.

## Decisões adotadas nesta revisão

| Decisão | Onde está |
|---|---|
| Janela offline de 30 dias desde a última confirmação bem-sucedida; falha de rede não renova | `config.ts`, `acesso.ts`, Termos, teste |
| Disputa mantém o acesso até reembolso ou chargeback | `acalma_status_da_acesso`, Termos |
| Compra recuperável após recriar a conta com o mesmo e-mail, com nova prova do e-mail | `acalma_vincular_compras` (exige otp/link), teste |
| Aceite dos termos com ação explícita, versão e data | Entrar, `acalma_aceites` |
| Marketing separado, opcional e revogável | Entrar, Conta, `acalma_definir_marketing` |
| Visitar a Nina não inicia trial | migration 130000, 03-NINA-CONVITE.md |
| Sem atraso automático do lançamento pela versão gratuita | aviso de transição + exportação sem compra |

## Ordem de publicação

1. E1–E5 resolvidos. Os termos sem `[pendentes]` liberam o build comercial.
2. **Migrations** na Nina, nesta ordem: `100000` → `110000` → `120000` → `130000`. Usar o fluxo normal de migrations; nunca `supabase config push`. Conferir, só leitura, que o cadastro normal da Nina ainda cria trial (conta interna).
3. **`delete-user`** (já funciona com ou sem a migration 130000).
4. **Segredo** `ACALMA_HOTMART_PRODUTO_IDS` + **deploy** de `acalma-hotmart` (`--no-verify-jwt`) e `hotmart-webhook-`.
5. **Webhook na Hotmart** + postback de teste: 1 linha em `acalma_eventos_hotmart`, nada em `subscriptions`.
6. **Template de e-mail** com código.
7. **App da Nina** (depois da migration 130000; antes dela, o app novo trataria um motivo que o banco ainda não devolve).
8. **Roteiro integrado real** (05-ROTEIRO-VALIDACAO.md), com o seu e-mail e compra de teste autorizada por você.
9. **Variáveis do Netlify + merge** de `integracao/comercial-2026-10`.
10. Conferência em aparelho: S25 com TalkBack, atualização do app instalado e offline.

## Recuperação

O procedimento completo, com as dependências entre peças, está em `docs/acalma/RECUPERACAO.md` (repositório da Nina; cópia no pacote). Resumo:

| | Antes da 1ª venda | Depois de existirem clientes |
|---|---|---|
| Banco | rollbacks em ordem inversa | **não** reverter; os rollbacks de compras, dados e procedência **se recusam** (testado). Corrigir com nova migration. |
| Liberação errada | idem | `acalma_processamento_pausado = true`: eventos guardados, nada aplicado; corrigir; `acalma_reprocessar_eventos` |
| Novas vendas | — | pausar o produto na Hotmart + tirar `VITE_ACALMA_CHECKOUT_URL`; quem comprou segue com acesso |
| Function | versão anterior | versão anterior; eventos de período com 500 → reenvio pelo painel da Hotmart (idempotente) |
| Frontend | deploy anterior | **deploy comercial anterior**, nunca o app gratuito |
| Nina | versão anterior | versão anterior do app; a trava do trial fica no banco |

A Hotmart não reenvia indefinidamente. Por isso todo evento autenticado é gravado antes de qualquer decisão, mesmo sem configuração ou com a pausa ligada.
