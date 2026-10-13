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

## Publicação (13/10/2026, madrugada) — vendas continuam BLOQUEADAS
- **Nina:** `main` `0c1444d4…` → `cc91e348f29503ebdf06cb50f6e3fc42add5a92d` (fast-forward, sem force). Antes do push, conferi que as 3 funções publicadas (`acalma-hotmart`, `hotmart-webhook-`, `delete-user`) e os `_shared` são **idênticos, arquivo por arquivo,** a esse commit. As 4 migrations aplicadas são iguais às do commit. O commit `cd43876` (minimização, não autorizada) ficou fora.
  - Netlify publicou `index-DBPFTEeu.js`.
  - Conferido em produção: `?de=acalma` mostra o aviso e o botão de link; o login normal está igual; `/conhecer-a-nina` sem sessão volta para `/?de=acalma`.
- **Acalma:** `main` `4ce22f88…` → `1446ef3ca1b773b3a7445bf54f5ee4e03cbe5150` (fast-forward).
  - Netlify publicou `index-Co9W-1ey.js` (modo integrado, Supabase da NexoEdu, checkout).
  - Conferido: `/` → Entrar; segurança, termos, privacidade e registros anteriores abrem sem login, sem rascunho; nenhuma chamada fora do próprio domínio sem login.
  - Efeito: quem usava a versão gratuita passa a ver o login e, com as vendas bloqueadas, ainda não consegue comprar.
- **Aprovação:** os dois pushes, fixados no commit, foram aceitos pelo classificador e não precisaram de retry manual. O procedimento oficial, se fosse preciso, é `/permissions` → **Recently denied** → `r`, ou a aprovação dita na conversa nomeando a ação. O retry da negação antiga **não** deveria ser usado: ela publicava a branch "como estivesse" (hoje incluiria `cd43876`).

## Testes de e-mail com contas reais (banco, só leitura)
| Conta | Login | Aceites do Acalma | Compra / acesso pago | Trial Nina | SignupStarted |
|---|---|---|---|---|---|
| `+android` (criada pelo Acalma às 00:40) | sim, 00:42 | termos e privacidade `2026-10-13` | nenhum | nenhum | nenhum |
| e-mail novo (criado às 00:44, `produto_entrada = acalma`) | sim, 00:44 | nenhum (entrou pelo link da Nina, não pelo código) | nenhum | nenhum | nenhum |

- Código errado: rejeitado pelo Supabase real.
- A recusa de código vencido ou reutilizado foi feita pela responsável. O banco não registra tentativas recusadas.
- **Destino real do link "Entrar na Nina" no e-mail pedido pelo Acalma:** o Acalma não passa `emailRedirectTo`, então o link vai para a **Site URL** = `https://app.nexo-edu.com` (redirects permitidos: `https://app.nexo-edu.com/**` e `/auth/nova-senha`). A conta criada às 00:44 entrou sem trial: no app antigo da Nina, `create_trial_once` já devolvia `ESCOLHA_EXPLICITA`.
- **Atenção:** o e-mail novo não está em `emails_internos()`. Se for seu, vai contar como conta de origem Acalma no funil. Para tirá-lo, é preciso uma migration que o inclua na lista (não feita).

## Monitor n8n "Monitor de Vendas - Hotmart v3" (id `gaFlkQYrcpyP319M`, publicado), lido sem alterar
Fluxo: Webhook → `PURCHASE_APPROVED`?
- **sim** → "É Nina AI?" (`body.product.name` contém "Nina") → sim: MailerLite (grupo Nina) + Telegram + planilha; não: Telegram "Venda Aprovada" + planilha "Bot Andrey / Vendas".
- **não** → `SUBSCRIPTION_CANCELLATION`? → MailerLite remove do grupo Nina + Telegram; `PURCHASE_REFUNDED`? → Telegram; `SUBSCRIPTION_REACTIVATED`? → Telegram; outros → Telegram.

**Para o produto 8715752:**

| Efeito | Acontece? |
|---|---|
| Trial, acesso, `subscriptions` | **não**: o workflow não escreve no Supabase |
| MailerLite / campanhas da Nina | **não**: o nome do Acalma não contém "Nina", e o Acalma (pagamento único) não gera `SUBSCRIPTION_CANCELLATION` |
| Meta / CAPI | **não há** nó de Meta neste workflow |
| Alertas | **sim**, internos: Telegram ("Venda Aprovada", "Reembolso" ou "Outros Eventos") |
| Métricas | **sim**: aprovação vira linha na planilha "Bot Andrey / Vendas" (Data, Produto, Comprador, Email, Valor, Evento) |

**Achado (não alterado):** o webhook da Hotmart está na versão 2.0.0, onde os campos ficam em `body.data.*`, mas o workflow lê `body.product`, `body.buyer` e `body.purchase`.
- Evidência: na aprovação real da Nina de 01/10 (execução 1882), "É Nina AI?" deu **falso**, e a venda foi para Telegram e planilha, sem MailerLite.
- Ou seja, hoje a planilha provavelmente grava Produto/Comprador/Email/Valor vazios, e uma venda do Acalma ficaria indistinguível de uma da Nina ali.

**Ajuste mínimo proposto (não aplicado):** trocar, nos nós da planilha e do "É Nina AI?", `body.product.name` por `body.data.product.name` (e o mesmo para `buyer` e `purchase`). Isso corrige também a Nina.
- **Efeito colateral a decidir:** com a leitura certa, aprovações da Nina passariam a cadastrar no MailerLite por este caminho, o que hoje não acontece. Convém conferir antes se isso duplica a sincronização do MailerLite já existente.
- **Alternativa mínima, só para o Acalma:** acrescentar uma coluna `produto_id` (`body.data.product.id`) na planilha.

## Minimização (`20261013100000_acalma_minimizacao_compras.sql`, `cd43876`) — continua NÃO autorizada, e precisa de revisão
| Pergunta | Como está | Avaliação |
|---|---|---|
| Acesso de compras válidas depois de 5 anos | apaga `acalma_compras` 5 anos depois do último evento, **qualquer status** | **NÃO preserva**: quem comprou perderia o acesso após 5 anos. Defeito. |
| Recuperação / vínculo | depende de `acalma_compras.email_comprador`, que seria apagado em 5 anos | **NÃO preserva** depois de 5 anos |
| Eventos pendentes / em disputa | não minimiza eventos `pausado` / `aguardando_configuracao`; **minimiza** o payload de compra `pendente` ou `em_disputa` após 180 dias | **parcial**: disputa longa perderia o payload completo |
| Duplicatas reiniciando o prazo | duplicata do mesmo id não é gravada; reenvio com id novo e mesmo `creation_date` não muda o máximo; evento sem data usa `recebido_em` e **pode** reiniciar | **parcial** |

**Correção proposta (não implementada):**
- **compra que dá acesso** (`aprovada`, `em_disputa`): o registro mínimo **não expira** enquanto o serviço existir;
- **compra que não dá mais acesso** (`reembolsada`, `chargeback`, `cancelada`, `pendente` vencida): 5 anos contados de `acalma_compras.status_em` (o momento do estado efetivo, que duplicata não muda), e não do último evento recebido;
- **payload completo**: minimizar 180 dias depois de `status_em`, só quando o status é final (`aprovada` há 180 dias, `reembolsada`, `chargeback`, `cancelada`); nunca em `pendente` ou `em_disputa`.

O texto da privacidade **publicada** diz "registro mínimo até 5 anos depois do último evento", o que contradiz o acesso vitalício-enquanto-em-operação. Ele precisa ser corrigido junto com a migration, antes da 1ª venda.

## Validade do link / código (24 h real × "1 hora" no e-mail)
| Opção | Mudança | Impacto |
|---|---|---|
| **A (recomendada)** | `MAILER_OTP_EXP` 86400 → 3600 (Auth → Sign In / Providers → Email) | alinha com o texto e com a recomendação do painel. **Na Nina:** links de login sem senha e de "Esqueci minha senha" passam a valer 1 h (hoje valem 24 h, embora o e-mail diga 1 h). Quem abrir depois pede outro. **No Acalma:** o código vale 1 h. |
| B | trocar no e-mail "O link é válido por 1 hora" por "24 horas" | nenhuma mudança de comportamento; mantém validade acima do recomendado |

Nenhuma das duas foi aplicada. A configuração é compartilhada; a decisão é sua.
