# Acalma → Nina: ponto de integração e especificação do convite

**Nada disso foi implementado na interface.** Esta é só a especificação, para aprovação.

## Ponto de integração que já existe

- A conta é a mesma (projeto Supabase da Nina). Quem entrou pelo Acalma tem `profiles.produto_entrada = 'acalma'` e **nenhuma** assinatura nem trial da Nina.
- Se essa pessoa abrir a Nina, o fluxo atual do app da Nina chama `create_trial_once`. O teste
  "se a pessoa entrar na Nina depois, o trial nasce normalmente" (PGlite) prova que o trial nasce
  e que a conta passa a contar nas métricas da Nina (`origem_conta` → `espontanea`), respeitando o `trial_ledger`.
- Comprar a Nina pela Hotmart com o mesmo e-mail segue o webhook atual da Nina; o Acalma não interfere.
- **Atenção:** a Nina entra por senha. Quem só tem código do Acalma precisará criar senha
  ("esqueci minha senha") ou usar o magic link legado. Isso precisa ser revisto no login da Nina antes de qualquer convite.

## Regras do convite (propostas)

| Regra | Motivo |
|---|---|
| Nunca em "Agora" nem durante uma orientação | É o momento de crise. |
| Nunca no modo de mostrar o combinado à criança | A tela é da criança. |
| Nunca na tela de segurança nem nas telas de acesso | Não confundir ajuda/pagamento. |
| Só em Conta, ou num cartão discreto em Salvos depois de pelo menos 3 usos em dias diferentes | Momento calmo, pessoa já viu valor. |
| Sem trial automático: o link só abre a Nina | Decisão de trial fica no fluxo da Nina e no `trial_ledger`. |
| Nenhum dado do Acalma vai para a Nina (combinados, registros, anotações, situações) | Separação de dados. |
| Fechar o convite o esconde por 90 dias, guardado só no aparelho | Sem insistência. |
| Texto sem urgência, sem "grátis", sem "para sempre" | Tom e termos. |

Texto sugerido: "Quer conversar sobre o que está acontecendo em casa? A Nina é a assistente da
NexoEdu para famílias. Ela usa a mesma conta." Botão "Conhecer a Nina" (abre em nova aba) e "Agora não".

## Medição

Se houver medição do convite, só a contagem de exibições e cliques, sem identificador da
criança nem conteúdo. A medição precisa de decisão de privacidade antes. Hoje o Acalma não tem analytics.
