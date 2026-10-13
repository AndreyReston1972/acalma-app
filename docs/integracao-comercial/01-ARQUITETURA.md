# Acalma comercial: arquitetura (revisada em 13/10/2026)

Nada aqui está em produção: migrations não aplicadas, functions não publicadas, segredos e
Netlify intocados, sem merge. A produção do Acalma continua em `4ce22f8`.

## 1. Nina verificada (somente leitura, funções publicadas)

```
auth.users INSERT → handle_new_user → profiles INSERT →
  create_subscription_for_new_user  (trial 7 dias, salvo trial_ledger)
  track_signup_started              (SignupStarted → Meta/GA4)
  reconciliar_compra_pendente       (compra da Nina antes do cadastro)
pós-login do app da Nina: sem subscription → create_trial_once
delete-user: grava o e-mail (HMAC) no trial_ledger em TODA exclusão
```

Contas internas: `conta_comercial()` + `emails_internos()`. As métricas filtram `origem_conta = 'espontanea'`.

## 2. Repositório da Nina: branch local `acalma/integracao-comercial` (não enviada)

| Commit | Conteúdo |
|---|---|
| `28f8c11` `f9e3b4b` `d229e15` `9b6126e` | rodada anterior: 3 migrations, `acalma-hotmart`, desvio no webhook da Nina |
| `8e58bf3` | acesso pago nas gravações, eventos sem perda, aceites, migration 4, atribuição, rollbacks com trava |
| `21b00d0` | `delete-user`: conta só do Acalma não vai para o `trial_ledger` |
| `67e6fc3` | app da Nina: `/conhecer-a-nina`, pós-login, login `?de=acalma` |
| `2d88fb3` | `docs/acalma/RECUPERACAO.md` |

### Migrations (todas aditivas; nenhuma aplicada)

**`20261012100000_acalma_entrada_sem_trial_nina.sql` — entrada sem trial**
- `profiles.produto_entrada` (`nina` | `acalma`): imutável pelo cliente.
- `profiles.nina_teste_escolhido_em`: só a escolha explícita grava.
- Cadastro pelo Acalma: sem trial, sem SignupStarted e fora das métricas da Nina enquanto não houver subscription.

**`20261012110000_acalma_compras_e_acesso.sql` — compras e acesso**
- Eventos da Hotmart **guardados antes de qualquer decisão**.
- Serializados por transação (advisory lock).
- Precedência no mesmo instante; reembolso e chargeback são finais.
- Pausa da liberação (`app_settings.acalma_processamento_pausado`).
- `acalma_reprocessar_eventos()`.
- `acalma_tem_acesso()`: decidido no servidor; uma compra válida basta.
- Disputa mantém o acesso.

**`20261012120000_acalma_dados_sincronizados.sql` — dados**
- `acalma_sincronizar` **só grava com acesso**. Sem acesso, responde `sem_acesso` e não aplica nada: nem criação, nem edição, nem exclusão item a item.
- `acalma_exportar_meus_dados()` e `acalma_excluir_meus_dados()` funcionam sem compra.
- `acalma_aceites` é um registro que só acrescenta:
  - termos e privacidade: explícitos, com versão e data;
  - marketing por e-mail: opcional e revogável. Nenhuma ferramenta de envio lê esta tabela.

**`20261012130000_acalma_passagem_nina_e_exclusao.sql` — passagem para a Nina e exclusão**
- `create_trial_once` devolve `ESCOLHA_EXPLICITA` para conta do Acalma. Vale também para serviço interno e para versões antigas do app.
- `nina_iniciar_teste()`:
  - exige os consentimentos da Nina (`terms`, `privacy`, `guardian_majority`);
  - respeita o `trial_ledger`;
  - um trial por conta (lock + `on conflict`).
- `trial_deve_ser_marcado_na_exclusao()`.

### Functions
- **`acalma-hotmart`:** hottok em tempo constante.
  - Sem a lista de produtos: o evento é **guardado** como `aguardando_configuracao` e a Hotmart recebe 200. Não depende de reenvio.
  - RPC ausente: 500 com `migration_ausente` no log.
- **`hotmart-webhook-`:** produto do Acalma fica no log e a Nina o ignora.
- **`delete-user`:** decide o marcador **antes** de apagar subscriptions. Com erro ou sem migration, marca como antes.

## 3. Por que a regra do `trial_ledger` existia, e o que mudou

Ela veio da Onda ECA/LGPD (commit `0ba5070`): excluir e recriar a conta zerava o trial. Como toda conta da Nina nasce com trial, "excluiu" equivalia a "usou o trial". Uma conta só do Acalma não usou trial nenhum. Regra nova, testada:

| Caso | Marca? | Recriar com o mesmo e-mail |
|---|---|---|
| Só Acalma, nunca iniciou a Nina | não | recupera a compra com nova prova do e-mail; pode escolher o trial |
| Trial da Nina já usado (inclusive escolhido pelo Acalma) | sim | sem novo trial |
| Conta da Nina (trial no cadastro) | sim | sem trial |
| Assinatura da Nina ativa ou encerrada | sim | sem trial |
| Conta da Nina sem subscription (já barrada) | sim | igual a hoje |

Na exclusão, `acalma_compras` fica sem dono (prova da compra). Prazo de retenção: decisão jurídica pendente.

## 4. Atribuição (sem campo nem evento redundante)

| Pergunta | Fonte |
|---|---|
| Conta criada pelo Acalma | `profiles.produto_entrada = 'acalma'` (nunca muda) |
| Compradora do Acalma | `acalma_compras` vinculada, paga alguma vez |
| Trial da Nina iniciado explicitamente | `profiles.nina_teste_escolhido_em` |
| Assinatura paga da Nina | `subscriptions.plan in ('start','pro','max')` |
| Conta da Nina que comprou o Acalma | `produto_entrada = 'nina'` + compra (origem preservada) |

`origem_conta` passa a `espontanea` quando a conta ganha subscription, para entrar nas views da Nina, mas **não** é usada para medir a passagem. As consultas estão em `docs/acalma/consultas-funil.sql` (repositório da Nina; a consulta 1 é testada). Contas internas ficam de fora. Nenhum conteúdo de registro, anotação ou nome vai para analytics.

## 5. App do Acalma: branch `integracao/comercial-2026-10`

**Entrar**
- Aceite explícito (caixa) dos termos e da privacidade.
- Novidades por e-mail: caixa separada e opcional.
- Aviso de conexão periódica.
- Aviso de transição para quem tem dados da versão anterior.
- Mensagens para código errado, vencido ou usado e para o limite de envio.

**Acesso**
- Janela de 30 dias a partir da última confirmação **bem-sucedida**. Falha de rede não renova (testado).
- Revogação confirmada online encerra o acesso.
- A segurança fica sempre aberta.

**Sincronização após revogação**
- A fila **não é descartada**.
- A tela "acesso encerrado" diz quantas alterações ficaram e permite baixar uma cópia (conta + aparelho + não enviadas) e excluir os dados.
- Com uma nova compra, a fila sobe.

**Registros do app anterior**
- `/registros-anteriores`: sem login e sem compra; baixa as chaves `acalma_*` como estão.
- Não liberam acesso (testado).

**Nina**
- Convite só em Conta.
- No modo integrado, aparece apenas com `VITE_NINA_URL` e abre `…/?de=acalma` em outra aba.
- Nenhum token ou sessão vai na URL.

**Barreira de publicação**
- O build com `VITE_ACALMA_MODO=integrado` **falha** enquanto os termos tiverem `[pendente]` ou versão "rascunho".
