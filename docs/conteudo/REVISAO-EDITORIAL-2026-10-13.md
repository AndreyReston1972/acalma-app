# Revisão editorial e de experiência do conteúdo (13/10/2026)

Branch `conteudo/revisao-editorial-2026-10`, a partir da versão publicada (`804d414`). **Não publicada.** Avaliação no deploy preview.

**Natureza desta revisão:** editorial, feita pela equipe, apoiada em fontes institucionais.
- **Não** é parecer clínico.
- **Não** houve validação por psicólogo, pediatra ou outro profissional.
- As frases do app são **adaptação editorial nossa**; nenhuma delas é citação das fontes.

## O que mudou

**Estrutura de cada situação:**
1. o que fazer agora;
2. uma frase fácil de falar;
3. "depois", ligado à situação;
4. caminhos com alternativas reais;
5. **nova:** "Para a próxima vez", uma preparação simples fora da crise, em todas as seis situações.

**Navegação e telas:**
- O atalho para montar o combinado aparece dentro desse bloco quando há modelo (Desligar a tela, Banho).
- A primeira orientação continua a dois toques.
- **Nova entrada secundária: "Eu também perdi a paciência"** (lista de situações e rodapé da orientação). Abre um apoio breve ao adulto, com a mesma estrutura visual da orientação, e leva à tela de segurança existente.
  - Não aparece na Home.
  - Não é etapa obrigatória.
  - Não tem oferta da Nina.
  - Fica atrás do mesmo controle de acesso das outras orientações. O acesso não foi alterado.
- "Use as palavras que combinam com vocês." aparece discretamente junto a cada frase sugerida.

**Combinados:**
- O modelo "Encerrar a tela" passou a **Guardar o aparelho → Brincar**. "Lavar as mãos" continua no catálogo.
- "Sair de casa" e "Hora do banho" foram mantidos.
- Novo texto junto aos modelos: "Mostre antes de começar. Escolha passos que cabem na rotina de vocês."

**Compatibilidade dos dados:**
- Ids de situações, caminhos, ações e modelos preservados.
- Favoritos e registros continuam apontando para os mesmos ids.
- Combinados salvos guardam os próprios passos: **mudar o modelo não altera combinados já criados** (coberto por teste).

**Fora do escopo, sem mudança:** autenticação, acesso, pagamentos, trial, banco, migrations, segredos, métricas, integrações, offline (o conteúdo vai no mesmo pacote do app e fica disponível offline como antes).

## Fontes e relação com cada orientação

| Fonte | Princípio sustentado pela fonte | Nossa adaptação no app | Depende de avaliação individual |
|---|---|---|---|
| **NHS**, "Temper tantrums"<br>nhs.uk/baby/babys-development/behaviour/temper-tantrums | manter a calma; não ceder só para encerrar a birra; não usar doces ou agrados para parar; distrair; cansaço e fome como causas; em público, ignorar os olhares; procurar o serviço de saúde se houver preocupação séria | "Se o não continua valendo, diga uma vez…"; "não volte a negociar durante o protesto"; "a atenção é para ela, não para os olhares"; checagem de fome, sono e dor em "Outra situação"; sem recompensa improvisada | quando a birra é frequente ou intensa demais (serviço de saúde) |
| **AAP / HealthyChildren.org**, "Top Tips for Surviving Tantrums" | escolhas pequenas e dirigidas; antecipar gatilhos (fome, cansaço); distração e mudança de ambiente; consistência; não ignorar comportamentos que machucam; fazer pausas e usar a rede de apoio; pediatra se houver preocupação | "duas opções que você aceita" (só escolhas verdadeiras); "diminua o que está em volta"; "deixe à vista uma próxima atividade"; "se alguém pode se machucar, aja agora ou peça ajuda"; pedir que outro adulto assuma | limites de cada criança e família |
| **AAP / HealthyChildren.org**, "What's the Best Way to Discipline My Child?" | preparar a criança para as próximas atividades; o adulto fazer a própria pausa num lugar seguro quando perde o controle; depois de conduzir mal, se acalmar, pedir desculpas e dizer como fará diferente | todos os blocos "Para a próxima vez" (avisar antes como termina e o que vem depois); apoio ao adulto: "só se afaste com a criança num lugar seguro", "volte e conserte a forma como falou", frase "Eu gritei…" | — |
| **CDC**, "Tips for Giving Directions" (parenting-toddlers) | uma instrução por vez; duas opções simples | "peça só a próxima etapa, não o banho inteiro"; "um brinquedo só, entregue na mão"; frases curtas | — |
| **AAP / HealthyChildren.org**, "Nursemaid's Elbow" | puxar, levantar ou balançar pela mão ou punho pode deslocar o cotovelo; levantar pelo tronco; mais comum abaixo de 4 anos | "Nunca puxe nem levante pelas mãos, punhos ou braços: isso pode machucar o cotovelo" | dor no braço depois de um puxão: avaliação médica |
| **SBP**, #MenosTelas #MaisSaúde (2024) | referência de tempo de tela por idade | o app **não** prescreve tempo de tela: só menciona o próximo horário se a família já o tem | regra de tela de cada família |
| **Ministério da Saúde**, SAMU 192; **190**; **CVV 188** | quando acionar cada serviço | tela de segurança (sem mudança nesta rodada) | — |

**Correção do registro anterior:** "risco até 6–7 anos" para o cotovelo não está na página da AAP consultada (ela diz "mais comum abaixo de 4 anos"). Fica só o que a fonte sustenta.

**Sem fonte direta, decisão editorial nossa:**
- não exigir olhar, abraço, resposta ou respiração da criança;
- "Use as palavras que combinam com vocês";
- tirar foto da construção antes de desmontar;
- anotar quando a situação se repete (usa o registro que o app já tem);
- apresentar o combinado antes, não durante a crise ou o banho.

## Pontos 1, 2, 3 e 5: resultado desta revisão (editorial, não clínico)

| # | Ponto | O que mudou | O que continua dependendo de avaliação individual |
|---|---|---|---|
| 1 | "Parece que algo incomoda" (banho) | Conferir **uma coisa por vez** (temperatura, barulho, água no rosto, sabonete, tecido, etiqueta), sem presumir água mais quente ou fria. Sem forçar exposição ao desconforto. A criança pode mostrar ou apontar; o adulto pode observar. Dor ou incômodo recorrente: pediatra. Orientação profissional já existente vem primeiro. | crianças com diferenças sensoriais: a orientação individual de quem acompanha a criança prevalece |
| 2 | "Não quer andar" e "Estamos em público" | Considerar cansaço, dor ou desconforto antes de presumir recusa. Pausa em local seguro e ajuda de outro adulto. Mão dada ou colo só se as duas forem possíveis e seguras. Aviso de não puxar pelas mãos, punhos ou braços mantido. Perigo: sair do risco e pedir ajuda. **Retirado:** "segure pelo corpo" e qualquer instrução de carregar uma criança que resiste. Em público: "se for possível e seguro", sempre junto com a criança. | carregar ou segurar uma criança que resiste: não é ensinado no app |
| 3 | "Quero rever o não" | Removido "para não parecer que o choro decidiu". Agora: se o limite continua necessário, mantenha; se percebeu que se enganou ou entendeu melhor o pedido, corrija e explique em uma frase. Sem exigir que a criança pare de chorar para o adulto reconhecer o erro. Frase: "Eu entendi melhor. Podemos fazer assim…" | quando a flexibilidade ajuda e quando reforça a birra, em cada família |
| 5 | Frases prontas (2 a 6 anos) | Mais curtas e naturais ("A tela terminou. Estou aqui.", "Estou aqui. Vou ajudar."). Retiradas: "Agora não tem mais um", "Pode demorar", "Primeiro só os pés. Depois a gente vê o resto". Aviso discreto de que são sugestões. Sem configuração por idade. | adequação de vocabulário por idade e para crianças com atraso de linguagem ou outras condições de desenvolvimento: **o conteúdo não se apresenta como adequado a qualquer condição** |

## Trechos removidos ou simplificados por não se sustentarem com segurança

- **"segure pelo corpo, não pelos braços" (Não quer andar):** podia ser lido como técnica para carregar criança que resiste. Fica só o aviso de não puxar e a alternativa de pausa ou ajuda.
- **"para não parecer que o choro decidiu":** atribuía intenção à criança e condicionava a correção do adulto.
- **"Quando a cesta encher":** não define o fim da tarefa.
- **"Pode demorar":** não diferenciava esperar em segurança de precisar agir.
- **"Biscoito agora não… fruta e pão" (Ouvir um não):** exemplo alimentar trocado por objetos neutros.
- **"Lavar as mãos" no modelo "Encerrar a tela":** não é etapa necessária para encerrar a tela.
