# Roteiro de validação integrada real (para quando existir o produto na Hotmart)

O JWT simulado dos testes **não substitui** este roteiro. Ele exige produto real, e-mail real e a autorização de uma compra de teste. Nada aqui foi executado.

**Pré-requisitos:**
- passos 2 a 7 da publicação feitos;
- um e-mail de teste seu (de preferência um alias interno, para ficar fora das métricas);
- dois aparelhos (S25 + outro navegador).

| # | Passo | Conferir | Onde olhar (só leitura) |
|---|---|---|---|
| 1 | Comprar o Acalma na Hotmart com o e-mail de teste, **antes** de ter conta | aviso aprovado chega | 1 linha em `acalma_eventos_hotmart` (`criada_aprovada`); `acalma_compras` sem `user_id` |
| 2 | Abrir o Acalma, marcar o aceite e pedir o código | e-mail **real** com 6 dígitos chega; o remetente e o texto estão certos | caixa de entrada |
| 3 | Digitar um código errado, depois um vencido (esperar o prazo), depois reutilizar um já usado | as três vezes: "incorreto, vencido ou já usado"; não entra | tela |
| 4 | Digitar o código certo | abre direto na ajuda | `acalma_compras.user_id` preenchido, `vinculo_metodo = email_otp`; `acalma_aceites` com termos e privacidade; **nenhuma** linha em `subscriptions`; **nenhum** SignupStarted |
| 5 | Criar um combinado e uma anotação no aparelho A | aparece no aparelho B após entrar (código no B) | `acalma_combinados` / `acalma_registros` |
| 6 | Editar o mesmo combinado nos dois aparelhos sem rede, depois reconectar | um vira "(cópia)"; nada some | tela dos dois |
| 7 | Modo avião no A, fechar e abrir | abre pela confirmação recente | tela |
| 8 | Abrir a Nina pelo convite em Conta (B) e entrar pelo link | cai em "Conhecer a Nina"; **sem** trial até tocar no botão | `subscriptions` vazia para a conta |
| 9 | Tocar duas vezes em "Iniciar meus 7 dias" | 1 trial; onboarding | 1 linha em `subscriptions`; `nina_teste_escolhido_em` preenchido; `produto_entrada` continua `acalma` |
| 10 | Reembolsar a compra de teste na Hotmart | o aviso chega | evento `atualizada_reembolsada` |
| 11 | No A **com rede**: abrir | "Este acesso foi encerrado"; segurança abre; baixar cópia funciona | tela + arquivo |
| 12 | No B **sem rede** dentro da janela: criar algo; depois conectar | o acesso é encerrado ao conectar; a alteração não sobe e aparece como "não enviada" | `acalma_sincronizar` não grava (`sem_acesso`) |
| 13 | Comprar de novo (recompra) | o acesso volta; a fila do B sobe | nova transação `aprovada`; a anterior segue `reembolsada` |
| 14 | Excluir a conta pela Nina (se o CORS permitir) ou pelo suporte | a compra fica sem dono; o trial **fica** marcado (porque o trial foi iniciado no passo 9) | `acalma_compras.user_id` nulo; `trial_ledger` |
| 15 | Postback de evento repetido e fora de ordem pela ferramenta da Hotmart | sem duplicar; o estado final não retrocede | `acalma_eventos_hotmart.resultado` |

Só depois de 1 a 15 passarem dá para dizer "pronto para vender".
