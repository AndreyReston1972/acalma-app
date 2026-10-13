# Conteúdo do Acalma: inventário e revisão (revisado em 13/10/2026)

A biblioteca **não foi ampliada** nesta rodada. Todo o conteúdo está com `estado: 'rascunho'`.
Nenhum texto do app afirma validação por especialistas.

## Inventário

### Agora (6 situações, `src/content/situacoes.ts`)
Cada situação tem: o que fazer agora, uma frase pronta, o que fazer depois e caminhos "se precisar de mais".

| Situação | Caminhos | Modelo sugerido "para a próxima vez" |
|---|---|---|
| Desligar a tela | Ainda está difícil · Pede "só mais um" · Não quer minha ajuda | Encerrar a tela |
| Ouvir um "não" | Estamos em público · Quero rever o não | — |
| Ir embora | Pede para ficar mais · Não quer andar · Estamos em público | — (sem atalho: sair do parque ou de uma visita não é a rotina "Sair de casa"; o catálogo não tem modelo adequado) |
| Banho ou troca de roupa | Não quer entrar no banho · Parece que algo incomoda | Hora do banho |
| Guardar brinquedos | Estava no meio da brincadeira · Ainda está difícil | — |
| Outra situação | Ainda está difícil · Não quer minha ajuda | — |

### Preparar (`src/content/combinados.ts`)
- 3 modelos: Sair de casa (3 passos), Encerrar a tela (3), Hora do banho (4).
- 10 ações ilustradas: guardar brinquedos, calçar, sair, guardar o aparelho, brincar, separar a roupa, tomar banho, vestir, lavar as mãos, ler uma história.
- Combinado: 2 a 5 passos, nome opcional até 30 caracteres.

### Segurança (`src/content/seguranca.ts`)
192 SAMU, 190 Polícia Militar, 188 CVV (com o aviso de que o CVV não é emergência). Fontes oficiais
anotadas no arquivo (consulta em 12/10/2026). Acessível sem login, sem compra e sem rede.

### Documentos (`src/content/documentos.ts`)
Rascunhos de termos de uso e privacidade, escritos para corresponder ao que o app faz.
Trechos entre colchetes (razão social, CNPJ, canal de suporte, foro, prazos) aguardam o jurídico.
A tela mostra "Rascunho em revisão jurídica".

### Correção desta revisão
O inventário anterior listava por engano "Ir embora → Sair de casa". **No código, o atalho já não existia** (foi removido no refinamento, ver `docs/prototipo/LEIA-ME.md`). O erro era só deste documento. Agora a correção está presa por teste (`src/test/comercial.test.tsx`: os dados e a tela de "Ir embora" não oferecem modelo) e conferida no navegador a 360, 390 e 412 px ("Ir embora com modelo: false"). A biblioteca não foi ampliada.

Preservado: ajuda em até dois toques (Início → situação), orientação curta e concreta, modelos prontos e editáveis antes de salvar. Nada de pontuação, culpa ou sequência obrigatória.

## Faixa etária (decidida em 13/10/2026: público inicial de 2 a 6 anos)

**2 a 6 anos** (pré-escola), adotado pela responsável. Justificativa: as situações (tela, sair, banho, brinquedos, ouvir
"não") e o formato visual do combinado (figuras, até 5 passos) servem a crianças que ainda não
leem. Acima de 7 anos o combinado ilustrado tende a soar infantil; abaixo de 2, a frase pronta
e a escolha entre duas opções têm pouco efeito.
O app não pede idade, nome, data de nascimento nem foto da criança, e a faixa deve aparecer
só na comunicação comercial e nos termos. **Decisão de negócio + revisão profissional.**

## Pontos para revisão profissional (psicologia infantil / pediatria)

Revisão editorial e de evidências feita em 13/10/2026, com fontes institucionais: ver `06-REVISAO-CONTEUDO.md`. **Validação profissional NÃO realizada**; o app não diz que houve.

1. **"Parece que algo incomoda" (banho):** sugere ajustes sensoriais. Precisa de orientação de
   quando procurar avaliação, sem rotular (nada de "isso é sensorial/TEA").
2. **"Não quer andar" e "Estamos em público" (ir embora):** conferir se as sugestões de pegar no
   colo ou ir para um lugar calmo são seguras e respeitosas.
3. **"Quero rever o não":** validar a mensagem de que voltar atrás com calma não "ensina birra".
4. **"Pede só mais um":** já passou por correção editorial; confirmar o limite proposto.
5. **Frases prontas:** checar linguagem para a faixa de 2 a 6 anos (vocabulário, tamanho).
6. **"Outra situação":** é genérica de propósito; confirmar que não promete resolver qualquer crise.
7. **Tela de segurança:** quando sugerir 192 × 190 × 188 e a frase "Você não precisa ter certeza de que é grave para pedir ajuda".
8. **Registros "ajudou?":** sem pontuação nem tendência por criança; confirmar que a ausência de métrica é intencional e adequada.

## Ligação situação → modelo

Verificado em teste automatizado e em navegador (360/390/412 px):
- A orientação mostra "Para a próxima vez: Montar o combinado …" quando há modelo.
- O editor abre com o modelo carregado e o título "Para: <situação>".
- A pessoa edita (troca, reordena, remove, adiciona passos, nomeia) **antes** de salvar; nada é salvo sozinho.
- Fechar sem salvar volta para a mesma orientação ("Fechar sem salvar e voltar a Desligar a tela").

## Aparelho × sincronização (texto para a pessoa)

> **Neste aparelho:** o Acalma funciona sem internet depois da primeira entrada. Uma conexão a
> cada 30 dias confirma o seu acesso; uma tentativa sem internet não conta. O que você salva fica
> guardado aqui primeiro.
>
> **Na sua conta:** quando há internet, combinados, orientações salvas e registros vão para a sua
> conta NexoEdu. Assim aparecem em outro celular em que você entrar com o mesmo e-mail.
>
> **Ao sair:** você escolhe se apaga a cópia deste aparelho. O que já foi para a conta continua lá.
>
> **Excluir dados do Acalma:** apaga combinados, orientações salvas e registros da conta e deste
> aparelho. Sua compra e sua conta continuam. Dá para baixar uma cópia antes, mesmo sem compra ativa.
>
> **Limites do armazenamento do navegador:** limpar os dados do site, usar outro navegador ou o
> modo anônimo, ou o sistema liberar espaço apaga a cópia deste aparelho. O que já foi para a conta
> volta ao entrar; o que não foi enviado se perde. A versão anterior do Acalma guardava tudo só no
> navegador: não temos cópia desses registros e não há como identificar todos os usuários antigos.
>
> Não pedimos dados da criança. Evite escrever nomes ou informações de saúde nas anotações.
