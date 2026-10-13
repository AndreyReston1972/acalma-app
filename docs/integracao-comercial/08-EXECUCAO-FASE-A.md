# Fase A: execução (13/10/2026) — vendas BLOQUEADAS na Hotmart

## Antes de mudar produção (conferido)
- **Repositórios:**
  - Nina `origin/main` = `0c1444d`, sem commits novos desde o pacote.
  - Acalma `origin/main` = `4ce22f8`.
  - Branches iguais ao pacote revisado.
- **Funções que as migrations substituem:** texto em produção idêntico às cópias testadas de 12/10, comparadas uma a uma (`handle_new_user`, `create_subscription_for_new_user`, `track_signup_started`, guards, `create_trial_once`, `record_trial_consumed`, `reconciliar_compra_pendente`, `conta_comercial`, `emails_internos`). Cópias guardadas para recuperação.
- **Histórico de migrations:** último aplicado `20261006200000`. `20260930130000_conceder_reativacao.sql` pendente (fica fora).
- **Documentos:**
  - termos e privacidade `2026-10-13` sem pendências;
  - a barreira de build aprova os textos finais e continua bloqueando rascunhos (teste).

## Publicado

| # | O quê | Como | Verificação |
|---|---|---|---|
| 1 | `20261012100000_acalma_entrada_sem_trial_nina.sql` | `db query --linked` em transação + `migration repair` só desta versão | transação revertida: cadastro da Nina → trial + SignupStarted; cadastro do Acalma → nada; nenhum resto |
| 2 | `20261012110000_acalma_compras_e_acesso.sql` | idem | tabelas vazias; pausa = false; só `service_role` processa evento; cliente lê só o próprio acesso; anon nada |
| 3 | `20261012120000_acalma_dados_sincronizados.sql` | idem | RLS nas 4 tabelas; sem insert direto do cliente; `acalma_tem_acesso` fechado ao cliente |
| 4 | `20261012130000_acalma_passagem_nina_e_exclusao.sql` | idem | transação revertida: conta do Acalma → `ESCOLHA_EXPLICITA`; conta da Nina → `TRIAL_ALREADY_EXISTS`; marcador de exclusão Acalma = false, Nina = true |
| 5 | `delete-user` | deploy `--no-verify-jwt` (igual à config) | v33 → **v34** (o `secrets set` republica); sem token → 401 |
| 6 | segredo `ACALMA_HOTMART_PRODUTO_IDS=8715752` | `secrets set` | — |
| 7 | `acalma-hotmart` (nova) e `hotmart-webhook-` | deploy `--no-verify-jwt` | `acalma-hotmart` **v1**, `hotmart-webhook-` **v46**; GET → 405; sem hottok ou com hottok errado → 401; nada gravado |

## Não publicado (motivo)

| Passo | Situação |
|---|---|
| Webhook do produto 8715752 na Hotmart | formulário preenchido e **não salvo**: falta a declaração do Termo de Tratamento de Dados Pessoais, que é sua (ver o pedido) |
| "Enviar teste" da Hotmart | depende do webhook salvo |
| Template de e-mail com código | o painel do Supabase pede login no navegador; não faço login por você |
| App da Nina (`main` da Nina) | o push foi **bloqueado pela ferramenta** (classificado como deploy de produção); não contornei |
| Acalma comercial (merge na `main` do Acalma) | depende do template e do teste de e-mail; o merge também é deploy de produção |
| Página de vendas | as trocas estão prontas e conferidas (abaixo); a publicação na Hostinger é sua ou do ChatGPT |

## Recuperação (versões anteriores)

| Peça | Antes | Agora | Como voltar |
|---|---|---|---|
| Migrations | até `20261006200000` | + as 4 do Acalma | **antes da 1ª venda**: rollbacks em ordem inversa (`supabase/rollbacks/`); depois: `docs/acalma/RECUPERACAO.md` |
| `hotmart-webhook-` | v44 (= `0c1444d`) | v46 | redeploy a partir de `0c1444d` |
| `delete-user` | v32 (= `0c1444d`) | v34 | idem |
| `acalma-hotmart` | — | v1 | apagar a função, ou esvaziar o segredo (os eventos ficam `aguardando_configuracao`) |
| Segredo `ACALMA_HOTMART_PRODUTO_IDS` | ausente | 8715752 | `secrets unset` |
| App da Nina | `0c1444d` | (não publicado) | — |
| Acalma | `4ce22f8` | (não publicado) | — |

## Página de vendas: trocas prontas
`lp/conferir_trocas.py` confere e aplica as trocas numa cópia de `nexo-edu.com/acalma.html`. Cada trecho aparece uma única vez na página publicada em 13/10, e Pixel, GA4, consentimento, UTMs e checkout ficam preservados.

1. Perto do preço, depois de "Sem necessidade de assinar a Nina.": parágrafo `class="fine"` com o texto pedido.
2. FAQ "Preciso pagar todo mês?": acrescenta que o acesso vale enquanto o Acalma estiver em operação, com aviso de 90 dias e exportação.
3. FAQ nova depois de "Preciso assinar a Nina?": "Como eu acesso? Funciona sem internet?", com o texto pedido.
4. `ACALMA_CONFIG`: `termsUrl` e `privacyUrl` passam para `https://acalma.nexo-edu.com/termos` e `/privacidade`. **Só depois que o Acalma comercial estiver publicado**: hoje essas rotas não existem na produção antiga.
5. Rodapé: o link "Privacidade" passa a ser o do Acalma (idem).

**Pendente na página, antes de abrir as vendas:** identificação do fornecedor com CPF/CNPJ (Decreto 7.962/2013, art. 2º, I). Ver `07-BASES-DOS-DOCUMENTOS.md`.

## Achado
A configuração "Monitor Vendas NexoEdu — n8n" da Hotmart recebe eventos de **todos os produtos**, então também vai receber as vendas do Acalma. Não foi alterada. Confirme se esse workflow do n8n (que tem token da Meta) deve tratar as vendas do Acalma (ex.: evento de compra para anúncios).

## Continuação (13/10/2026)

### Teste oficial da Hotmart ("Enviar teste de configuração", enviado pela responsável)
- **8 eventos** (aprovada, completa, aguardando pagamento, cancelada, expirada, pedido de reembolso, reembolsada, chargeback), produto "Produto test postback2", transação de teste, comprador fictício `@example.com`. Todos chegaram a `acalma-hotmart` às 22:16 e voltaram **HTTP 200**.
- **Banco:** 0 eventos e 0 compras do Acalma; na Nina, 0 `webhook_logs`, 0 `webhook_errors` e 0 assinaturas alteradas nas 3 h.
- **Logs da função:** só inicializações, nenhuma mensagem de hottok inválido nem de gravação. Isso é coerente com o caminho "hottok válido, produto ≠ 8715752, ignorado", que responde 200 sem gravar.
- **Comprovado:** a Hotmart chega à função; a autenticação pelo hottok funciona; produtos de outro ID são ignorados sem efeito.
- **NÃO comprovado:** o ciclo de compra e acesso do Acalma (o teste não usa o produto 8715752).
- **Monitor do n8n:** NÃO recebeu os testes. No histórico, os 8 eventos aparecem só para a URL do Supabase; as vendas reais anteriores aparecem para as duas URLs.
- **Incidente:** um clique no histórico acionou "Reprocessar" do evento de teste Chargeback (22:18:17), em vez de abrir o detalhe. O reenvio foi o mesmo evento de teste, só para o Acalma-Webhook, com HTTP 200 e nada gravado (conferido no banco depois).

### Template de e-mail ("Magic link or OTP", compartilhado)
- Acrescentado, depois do botão "Entrar na Nina": "Está entrando pelo Acalma? Use este código no app:" + `{{ .Token }}`.
- O link da Nina (`{{ .ConfirmationURL }}`) e o resto do HTML ficaram iguais (25 linhas, eram 23). Conferido depois de recarregar.
- **Configuração real do Auth (lida, não alterada):** código de **8 dígitos** (`MAILER_OTP_LENGTH`) e validade de **24 h** (`MAILER_OTP_EXP = 86400`). Por isso:
  - o Acalma passou a aceitar de 6 a 8 dígitos (`b24394b`);
  - o texto do e-mail não diz quantos dígitos são.
- **Achados, sem alteração:**
  - o painel avisa que a validade de 24 h passa do recomendado (até 1 h);
  - o e-mail da Nina diz "o link é válido por 1 hora", o que diverge da configuração. Mudar a validade afeta os links da Nina; é decisão sua.

### E-mail e acesso: teste real, com build integrado local (`localhost`) apontando para o Supabase de produção
- A conta interna `andrey.reston+android@gmail.com` não existia. O pedido de código pelo Acalma **criou a conta** com `produto_entrada = acalma` e `origem_conta = acalma`, **sem** subscription (sem trial), **sem** SignupStarted e sem compra.
- Código errado (`00000000`): **rejeitado pelo Supabase real**, com a mensagem "Código incorreto, vencido ou já usado".
- **Faltam:** o código certo (lido e digitado pela responsável), a reutilização do código já usado e o link "Entrar na Nina".
