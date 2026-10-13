# Acalma → Nina: passagem explícita (13/10/2026)

**Decisão:** visitar a Nina não inicia o trial para quem veio do Acalma.

Está implementado localmente nos dois repositórios, sem publicar.

## Fluxo

1. **Acalma, tela Conta:** o cartão "Conhecer a Nina" é o único ponto de convite.
   - No modo integrado, aparece só com `VITE_NINA_URL` e abre `<nina>/?de=acalma` em outra aba.
   - Não aparece em Agora, na orientação, em "mostrar à criança" nem na segurança (testado rota a rota).
2. **Nina, login com `?de=acalma`:**
   - Um aviso orienta a entrar pelo **link no e-mail** (`signInWithOtp` com `shouldCreateUser: false`, já existente na Nina). Não é preciso criar senha nem usar "Esqueci minha senha".
   - O login por senha de quem já usa a Nina fica igual.
   - A URL só traz o marcador `de=acalma`. Nenhum token ou sessão atravessa os domínios.
3. **Pós-login da Nina:**
   - `create_trial_once` devolve `ESCOLHA_EXPLICITA` para conta do Acalma.
   - O app leva a `/conhecer-a-nina`, que é um portão: link guardado não passa por cima.
   - Versões antigas do app, em cache, não conseguem iniciar o trial: o bloqueio está no banco.
4. **`/conhecer-a-nina`:** a proposta, com os consentimentos da Nina (termos, privacidade, maioridade), gravados com `source = 'conhecer_nina'`.
   - Botão **"Iniciar meus 7 dias na Nina"** (`nina_iniciar_teste`). O resultado:
     - `TRIAL_CREATED` → onboarding;
     - `TRIAL_ALREADY_USED` → planos (quem já teve trial não ganha outro);
     - `TRIAL_ALREADY_EXISTS` → acesso existente (quem já assina entra direto).
   - Cliques repetidos ou duas abas: um trial só. A tela tem trava de envio e o banco tem lock + `on conflict`.
   - "Agora não? Pode fechar esta página. Nada foi iniciado."
5. Nenhum dado do Acalma vai para a Nina: combinados, registros, anotações e situações ficam no Acalma.

## O que a Nina muda (revisar antes de publicar)

| Arquivo | Mudança |
|---|---|
| `src/lib/pos-login.ts` | trata `ESCOLHA_EXPLICITA` → `/conhecer-a-nina` |
| `src/lib/destino-pretendido.ts` | `/conhecer-a-nina` é portão |
| `src/lib/consent.ts` | `flushPendingConsents(…, source)`, com padrão `signup` (sem mudança para o cadastro) |
| `src/pages/ConhecerNina.tsx` (nova), `src/App.tsx` | rota |
| `src/pages/Login.tsx` | aviso e botão de link em destaque **só com `?de=acalma`** |
| `supabase/functions/delete-user` | decisão do marcador antes de apagar subscriptions |
| migration `20261012130000_acalma_passagem_nina_e_exclusao.sql` | `create_trial_once` com a trava, `nina_iniciar_teste`, `nina_conceder_trial`, `trial_deve_ser_marcado_na_exclusao` |

O cadastro normal da Nina continua igual. Os testes PGlite "Nina preservada" e "conta da Nina sem subscription: `create_trial_once` como em produção" passam. Mudança comum aos dois caminhos: duas chamadas simultâneas de trial não falham mais com chave duplicada; a segunda espera e devolve `TRIAL_ALREADY_EXISTS`. Isso foi comprovado em PostgreSQL 17 real, com duas conexões (`concorrencia.pg.test.ts`).

## Pendente

- `VITE_NINA_URL = https://app.nexo-edu.com`: já está no `netlify.toml`, só no contexto de produção.
- Texto final da proposta, para revisão de marketing. Hoje ele diz o que é verdade no código: 7 dias, nada cobrado ao fim, e para continuar a pessoa escolhe um plano.
- Template do e-mail de link da Nina: o mesmo do código do Acalma (ver 04-PUBLICACAO.md).
