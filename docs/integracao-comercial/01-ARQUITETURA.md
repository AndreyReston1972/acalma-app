# Acalma comercial: arquitetura (rodada de 12/10/2026)

Nada aqui está em produção. Migrations não aplicadas, functions não publicadas,
segredos não alterados, nenhum merge. Produção do Acalma continua em `4ce22f8`.

## 1. O que foi verificado na Nina (somente leitura, funções publicadas, não só migrations)

Consulta em `begin read only … rollback` no projeto da Nina e download das edge functions
publicadas. Não foram lidas conversas, memórias ou dados de crianças.

Fluxo de cadastro em produção hoje:

```
auth.users INSERT
  └─ handle_new_user ............ cria profiles (origem_conta = 'espontanea' ou interna)
       └─ profiles INSERT dispara:
            ├─ create_subscription_for_new_user .. trial de 7 dias, salvo se o HMAC do e-mail
            │                                       estiver em trial_ledger
            ├─ track_signup_started ............... marketing_events SignupStarted (Meta/GA4)
            └─ reconciliar_compra_pendente ........ chama hotmart-webhook- via net.http_post
```

- MailerLite só entra após o onboarding da Nina e com consentimento `email_marketing`.
- 17 views de métrica filtram `origem_conta = 'espontanea'`.
- `hotmart-webhook-` (v44, igual à `origin/main`): produto desconhecido vai para fila manual com alerta, sem tocar em `subscriptions`.
- `delete-user` (v32, igual à main) grava o e-mail no `trial_ledger` mesmo sem assinatura.
- Login da Nina: senha (e magic link legado com `shouldCreateUser: false`).
- Nenhum evento de produto do Acalma chegou à conta Hotmart até hoje (só o produto da Nina e postbacks de teste).

## 2. Como o Acalma entra sem iniciar nada da Nina

Repositório da Nina, worktree `C:\Users\andre\nina-acalma-integracao`, branch
`acalma/integracao-comercial` (local, **não enviada ao GitHub**; vai no pacote como bundle/patch).

| Commit | Conteúdo |
|---|---|
| `28f8c11` | 3 migrations + 3 rollbacks + testes PGlite |
| `f9e3b4b` | edge function `acalma-hotmart` + testes Deno |
| `d229e15` | `hotmart-webhook-` ignora (com log) produtos do Acalma |
| `9b6126e` | correção de comentário |

### Migration 1: `20261012100000_acalma_entrada_sem_trial_nina.sql`
- `profiles.produto_entrada` (`nina` padrão | `acalma`) e `origem_conta` aceita `'acalma'`.
- `handle_new_user`: se o cadastro veio do Acalma (`produto_entrada = 'acalma'` nos metadados do signup), marca o profile como `acalma`.
- `create_subscription_for_new_user` e `track_signup_started` **saem cedo** para `acalma`: sem trial, sem SignupStarted.
- Origem `'acalma'` deixa a conta fora das 17 views de funil da Nina.
- Gatilho `acalma_conta_passa_a_nina`: quando surgir uma assinatura da Nina para essa conta (compra real), a origem passa a `espontanea`.
- Guardas: o cliente não consegue gravar nem alterar `produto_entrada` depois do cadastro.

**Por que o metadado do signup é aceitável aqui:** ele só pode **tirar** privilégio
(sem trial). Não concede acesso pago a nada e, uma vez gravado, não volta a ser lido.
Um usuário da Nina não consegue "reiniciar" o trial por ele: o profile já existe e
`produto_entrada` é imutável pelo cliente.

### Migration 2: `20261012110000_acalma_compras_e_acesso.sql`
- `acalma_eventos_hotmart`: cada aviso da Hotmart guardado íntegro (payload original, id único). É a trilha de auditoria.
- `acalma_compras`: uma linha por transação; status `pendente | aprovada | em_disputa | cancelada | reembolsada | chargeback`.
- `acalma_processar_evento_hotmart(...)`: só `service_role`. Idempotente.
  - Duplicado: ignorado.
  - Fora de ordem: evento mais antigo não sobrescreve um mais novo.
  - Mesmo instante: vence a precedência chargeback > reembolso > disputa > aprovada > pendente > cancelada.
  - Reembolso e chargeback são finais; recompra é outra transação.
- `acalma_vincular_compras()`: liga ao usuário as compras com o mesmo e-mail **só se a sessão provou o e-mail** (`amr` = otp, magiclink ou recovery). Como a Nina tem autoconfirmação de e-mail, "e-mail confirmado" não prova nada; o código de 6 dígitos prova.
- `acalma_meu_acesso()`: `ativo`, `pendente`, `nao_vinculada`, `confirme_o_email`, `revogado`, `nenhum`, `sem_sessao`. Não consulta a Nina.
- Acesso nunca vem do retorno do checkout nem de metadado do cliente: só de evento autenticado (hottok) processado no servidor.

### Migration 3: `20261012120000_acalma_dados_sincronizados.sql`
- `acalma_combinados` (versionados), `acalma_favoritos`, `acalma_registros` (com `origem` e `legado`), `acalma_aceites`.
- RLS: cada usuário só lê o que é seu; escrita só pela RPC `acalma_sincronizar`.
- Exclusão da conta (`auth.users`) apaga em cascata; `acalma_compras.user_id` vira nulo e a compra fica para auditoria.
- `acalma_excluir_meus_dados()` apaga só os dados do Acalma (não a conta NexoEdu).

### Edge function `acalma-hotmart`
- Autentica o hottok com comparação em tempo constante (`_shared/secrets.ts`).
- Só aceita produtos listados em `ACALMA_HOTMART_PRODUTO_IDS`. Lista vazia → 503 (falha fechada: a Hotmart reenvia depois).
- Outro produto → 200 ignorado. Erro de banco → 500 (Hotmart reenvia). Logs sem e-mail.

### `hotmart-webhook-` (Nina)
- Produto listado em `ACALMA_HOTMART_PRODUTO_IDS` → registra "produto do Acalma" e encerra **sem** tocar em `subscriptions`. Sem o segredo, segue o comportamento atual (fila manual com alerta).

## 3. Testes (ambientes isolados)

| Camada | Ferramenta | Resultado |
|---|---|---|
| Banco (3 migrations + rollback) | PGlite (Postgres 17 em WASM), cópia exata das funções de produção + stubs de `auth` | 33/33 |
| `acalma-hotmart` | Deno 2.9.7 | 8/8 |
| `hotmart-webhook-` | Deno | 59 ok + 1 falha **preexistente** (`handler.test.ts:737`, "CONTRATO ENCERRADO…", falha igual na `origin/main` sem alteração) |
| Frontend Acalma | Vitest + jsdom, servidor falso com as regras da RPC | 63/63 |
| Offline real | Chrome headless, build de produção local | rotas centrais, combinado e fontes abrem sem rede |
| Atualização 4ce22f8 → nova | mesma origem, SW instalado com dados | nova versão na 2ª abertura; caches antigos removidos; chaves `acalma_*` intactas |
| Rollback nova → 4ce22f8 | mesma origem | versão antiga na 2ª abertura; chaves intactas; 1 SW |
| Telas novas 360/390/412 px | Chrome headless | 0 rolagem horizontal, 0 alvo < 48 px, texto 130% ok, só localhost |

Testes cobrem a Nina normal: cadastro comum continua criando trial, SignupStarted e reconciliação;
e-mail no `trial_ledger` continua sem trial; cliente não consegue forjar `produto_entrada` em
update nem em insert.

**Limitações**
- Sem Docker: não houve `supabase start`. PGlite não roda pg_net, pg_cron, Vault nem GoTrue; o JWT foi simulado.
- O e-mail real com código (template do Supabase Auth) não foi testado.
- Nenhum evento real da Hotmart (não há produto do Acalma ainda).
- `deno check` acusa tipos do edge-runtime em `npm:openai`: problema de ambiente que afeta também as functions da Nina; passa com `nodeModulesDir: auto`.
- Sem aparelho físico nesta rodada e sem TalkBack. A aprovação visual no S25 foi da rodada anterior.

## 4. Acesso, sessão e offline

Proposta (decisão de negócio): **janela offline de 30 dias** (`JANELA_OFFLINE_DIAS`).

| Situação | Comportamento |
|---|---|
| Primeira ativação | Exige rede: código por e-mail → vincular compras → `acalma_meu_acesso`. |
| Abrir sem rede, confirmação < 30 dias | Abre direto na ajuda. |
| Abrir sem rede, confirmação > 30 dias | "Conecte-se uma vez para continuar". A tela de segurança (192/190/188) continua aberta. |
| Sessão expirada sem rede | Mesma regra da janela (a confirmação guardada é por conta, não pela validade do token). |
| Com rede | Revalida a cada abertura; reembolso/chargeback encerram o acesso mesmo com confirmação guardada. |
| Erro de rede ao revalidar | Usa a confirmação guardada se estiver na janela; senão, tela de erro com "Tentar de novo". |
| Atualização do app | SW novo assume na abertura seguinte; nunca cacheia API; apaga `supabase-cache` e `google-fonts` antigos. |
| Limpeza do navegador | Perde sessão e cópia local; dados sincronizados voltam ao entrar de novo. |
| Sair | Pergunta se apaga a cópia deste aparelho. Dados de outra conta nunca aparecem (espaço por usuário). |
| Troca de conta | Cada conta tem seu espaço `acalma.conta.v1.<id>`; a demonstração tem outro. |

Acesso **sem** compra: só a tela de segurança, termos e privacidade.

## 5. Dados e sincronização

- Fila de operações local (coalescida), envio com atraso de 1,5 s, ao voltar a rede e ao voltar ao app.
- Combinados: versão por item. Edição concorrente não sobrescreve: a versão do servidor fica e a deste aparelho vira "(cópia)", com aviso.
- Exclusão aqui × edição lá: a edição vence e o aviso explica.
- Favoritos: último a mudar vence (`alterado_em`).
- Registros: imutáveis; exclusão por marca (o texto é apagado no servidor).
- Leitura incremental com sobreposição de 5 min.
- Sem analytics de anotações. Nenhum texto do usuário vai para ferramentas de medição.
- Chaves antigas `acalma_*` preservadas. Importação dos registros do app anterior só se a pessoa pedir, marcada como `app-anterior`.
- Dados da demonstração nunca vão para a conta.
- O Supabase antigo do Acalma (`wcpfuzlwojkzomttpstx`) não foi tocado.
