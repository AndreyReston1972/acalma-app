# Roteiro de validação (revisado em 13/10/2026)

Produto 8715752 · checkout `https://pay.hotmart.com/L108001786T` (vendas **bloqueadas** até a fase B do `04-PUBLICACAO.md`).

Só depois das seções B e C completas o Acalma pode ser declarado pronto para vender.

## A. Já comprovado (local, sem produção e sem dinheiro)

| O quê | Como | Resultado |
|---|---|---|
| Regras de compra, acesso, ordem de eventos, pausa, reprocessamento, aceites, passagem para a Nina, exclusão × trial, funil, conciliação, rollbacks | PGlite (Postgres 17 em WASM, uma conexão) | 64/64 |
| **Concorrência real**: eventos simultâneos da mesma transação; o mesmo evento duas vezes ao mesmo tempo; aprovação × reembolso; dois cliques simultâneos no trial; rajada com 8 conexões | **PostgreSQL 17.10 real**, conexões independentes, com bloqueio observado em `pg_stat_activity` | 6/6, duas execuções |
| Webhook: hottok, produto, persistência, nunca 200 sem gravar (exceção de rede e resposta vazia viram 500) | Deno | 11/11 |
| `delete-user`: marcador do trial | Deno | 8/8 |
| App do Acalma: entrada, aceite, acesso, sincronização, revogação sem descartar dados, exportação, transição, convite da Nina só em Conta | Vitest | ver relatório |
| Telas e offline | Chrome headless, local e preview | sem problemas |

**Limites:**
- O PostgreSQL real foi um servidor local temporário, não o Supabase. O comportamento de locks é o mesmo do Postgres, mas o caminho PostgREST/edge function não entrou.
- O JWT foi simulado; o e-mail com código real não foi testado.

## B. Depende de produção configurada (sem dinheiro; fase A do 04)

| # | Passo | Conferir (só leitura) |
|---|---|---|
| B1 | Evento de teste da Hotmart para o webhook do Acalma | HTTP 200; produto ≠ 8715752 → "ignorado" (nada gravado); se for 8715752, 1 linha em `acalma_eventos_hotmart` |
| B2 | Entrar no Acalma com e-mail interno **sem compra** | e-mail **real** com 6 dígitos chega; "não encontramos uma compra"; o botão de compra abre o checkout certo |
| B3 | Código errado; código vencido (esperar o prazo); código já usado | as três vezes "incorreto, vencido ou já usado"; não entra |
| B4 | Na mesma conta: `subscriptions` e `marketing_events` | **nenhuma** linha (sem trial nem SignupStarted da Nina) |
| B5 | Abrir a Nina pelo convite (`?de=acalma`) e entrar pelo link | cai em "Conhecer a Nina"; **sem** trial até tocar no botão |
| B6 | Tela de segurança sem login e sem rede | abre |
| B7 | `/registros-anteriores` em um navegador com dados antigos | abre sem login; o arquivo baixa |

## C. Exige compra, e-mail e reembolso reais (fase B do 04; cada operação com sua autorização)

| # | Passo | Conferir |
|---|---|---|
| C1 | Compra com e-mail interno **antes** de entrar no Acalma | `acalma_eventos_hotmart` (`criada_aprovada`); `acalma_compras` sem `user_id` |
| C2 | Entrar pelo código | abre direto na ajuda; `vinculo_metodo = email_otp`; aceites gravados; nenhuma subscription |
| C3 | Combinado + anotação no aparelho A; entrar no B | aparece no B |
| C4 | Edição simultânea A/B sem rede, depois reconectar | um vira "(cópia)"; nada some |
| C5 | Modo avião em A, fechar e abrir | abre pela confirmação recente |
| C6 | "Iniciar meus 7 dias" duas vezes | 1 trial; `nina_teste_escolhido_em` preenchido; `produto_entrada` continua `acalma` |
| C7 | **Reembolso** pelo painel da Hotmart | evento `atualizada_reembolsada` |
| C8 | A com rede | "acesso encerrado"; segurança abre; baixar cópia funciona |
| C9 | B sem rede, criar algo, depois conectar | acesso encerrado ao conectar; a alteração fica como "não enviada" |
| C10 | Opcional: **recompra** | nova transação aprovada; a anterior segue reembolsada; a fila do B sobe |
| C11 | `conciliacao.sql` C6 com o relatório da Hotmart do período | tudo `ok` |

## D. Custos e efeitos financeiros (nenhuma operação autorizada por outra)

| Operação | Valor | Efeito | Autorização |
|---|---|---|---|
| Compra de teste | R$ 14,90 pagos por quem compra | vira uma venda real do produto; a Hotmart retém as taxas do seu contrato (valores não informados aqui: conferir no painel) | 1: só a compra |
| Reembolso | devolve R$ 14,90 a quem comprou | encerra o acesso do Acalma; se as taxas da Hotmart são devolvidas ao produtor depende do contrato e do prazo (conferir) | 2: só o reembolso |
| Recompra (opcional) | +R$ 14,90 | nova venda; prova que o acesso volta | 3 |
| Reembolso da recompra (opcional) | devolve R$ 14,90 | — | 4 |

**A confirmar com a Hotmart, sem suposição minha:**
- se o produtor pode comprar o próprio produto com o próprio cartão; se não puder, a alternativa é uma pessoa de confiança usando um **e-mail interno** (`emails_internos()`), para ficar fora das métricas;
- se as vendas precisam estar liberadas para o reembolso ser feito.

## E. Depende de você

Lista única no relatório da rodada. Resumo:
- confirmar os dados jurídicos e de suporte encontrados;
- decisões pendentes;
- texto da página de vendas;
- autorizações das fases A e B.
