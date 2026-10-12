import type { Situacao, SituacaoId } from './tipos'

/*
 * Conteúdo do protótipo: CANDIDATO À REVISÃO EDITORIAL E PROFISSIONAL.
 * Não é conteúdo validado. "desligar-tela" é a referência completa; as
 * demais são versões breves e específicas para revisar.
 */
export const situacoes: Situacao[] = [
  {
    id: 'desligar-tela',
    titulo: 'Desligar a tela',
    ilustracao: 'tela',
    agora:
      'Mantenha a tela desligada. Fique perto, abaixe-se na altura da criança e fale pouco.',
    frase: 'Você queria continuar assistindo. A tela acabou agora. Eu fico aqui com você.',
    depois:
      'Quando o choro baixar, ofereça uma escolha pequena: “Você leva o tablet para a gaveta ou eu levo?”',
    seContinuarDificil: [
      'Guarde o aparelho fora da vista. Ver a tela de novo costuma reacender o pedido.',
      'Repita a mesma frase curta, no mesmo tom. Explicar muito no meio do choro raramente ajuda.',
      'Se a criança bater ou jogar objetos, segure a mão com firmeza e diga: “Não vou deixar você bater.” Afaste o que pode quebrar.',
      'Se você precisar de um respiro, tudo bem se afastar um passo, desde que a criança esteja em um lugar seguro e ao alcance da sua vista.',
    ],
    prepararDaProximaVez: 'encerrar-tela',
    estado: 'rascunho',
  },
  {
    id: 'ouvir-nao',
    titulo: 'Ouvir um “não”',
    ilustracao: 'nao',
    agora: 'Mantenha o “não”. Diga o motivo uma vez, em poucas palavras, e pare de explicar.',
    frase: 'Você queria muito. A resposta é não. Pode ficar com raiva, eu continuo aqui.',
    depois:
      'Mostre o que é possível no lugar: “Biscoito agora não. Você pode escolher entre a fruta e o pão.”',
    seContinuarDificil: [
      'A criança não precisa concordar para o limite continuar. Discordar faz parte.',
      'Se for em público, vá para um canto mais calmo, se der, e fale baixo. Os olhares de fora não precisam de explicação.',
      'Se perceber que poderia ter dito sim, mude a decisão depois que a calma voltar, e conte o motivo.',
    ],
    estado: 'rascunho',
  },
  {
    id: 'ir-embora',
    titulo: 'Ir embora',
    ilustracao: 'porta',
    agora: 'Diga que é hora de ir e comece a se mover junto: pegue as coisas e ofereça a mão.',
    frase: 'Foi difícil sair. Você queria ficar mais. Agora a gente vai junto.',
    depois:
      'Dê uma tarefa para a saída: carregar algo leve, escolher por qual lado ir ou se despedir do lugar.',
    seContinuarDificil: [
      'Despedir-se ajuda algumas crianças: “Tchau, escorregador. Até outro dia.”',
      'Se a criança não anda, carregar com calma é uma opção. Diga o que está fazendo, sem bronca.',
      'Quando der, avise antes de ir, e não só na hora de sair.',
    ],
    prepararDaProximaVez: 'sair',
    estado: 'rascunho',
  },
  {
    id: 'banho-roupa',
    titulo: 'Banho ou troca de roupa',
    ilustracao: 'toalha',
    agora: 'Diminua a pressa visível. Peça só a próxima ação, não o banho inteiro.',
    frase: 'Agora é só tirar a camiseta. Você tira ou eu ajudo?',
    depois: 'Dê uma escolha dentro do que precisa acontecer: qual toalha, qual pijama, qual brinquedo vai junto.',
    seContinuarDificil: [
      'Pergunte se algo incomoda, como a água, o cabelo molhado ou a roupa, e ajuste o que der.',
      'Em um dia difícil, um banho mais curto também serve. Não precisa vencer todas as etapas hoje.',
      'Falar o que vem em seguida, um passo por vez, costuma ajudar mais do que lembrar de tudo.',
    ],
    prepararDaProximaVez: 'banho',
    estado: 'rascunho',
  },
  {
    id: 'guardar-brinquedos',
    titulo: 'Guardar brinquedos',
    ilustracao: 'cesta',
    agora: 'Transforme o pedido grande em um pedaço. Aponte uma coisa só para guardar.',
    frase: 'Agora só os blocos vão para a cesta. Eu guardo um, você guarda outro.',
    depois: 'Guardem juntos por pouco tempo. Depois, diga o que vem em seguida: “Quando a cesta encher, a gente vai lavar as mãos.”',
    seContinuarDificil: [
      'Se a birra começou porque a brincadeira acabou, reconheça antes de pedir: “Você estava no meio da torre.”',
      'Guardar uma parte hoje já é guardar. Dá para reduzir a quantidade.',
      'Evite ameaçar jogar os brinquedos fora: é difícil cumprir e aumenta a tensão.',
    ],
    prepararDaProximaVez: 'sair',
    estado: 'rascunho',
  },
  {
    id: 'outra-situacao',
    titulo: 'Outra situação',
    ilustracao: 'outra',
    agora: 'Primeiro a segurança: afaste o que pode machucar e fique por perto.',
    frase: 'Está difícil agora. Eu estou aqui e não vou deixar ninguém se machucar.',
    depois: 'Fale pouco até o choro baixar. Depois, diga em uma frase o que vai acontecer agora.',
    seContinuarDificil: [
      'Mantenha o limite que você já disse, com a mesma frase curta.',
      'Ofereça água, colo ou um lugar mais quieto, se a criança aceitar.',
      'Se as birras estão muito frequentes ou intensas e isso preocupa você, vale conversar com o pediatra ou com quem acompanha a criança.',
    ],
    estado: 'rascunho',
  },
]

export function buscarSituacao(id: string | undefined): Situacao | undefined {
  return situacoes.find((s) => s.id === id)
}

export function ehSituacaoId(id: string): id is SituacaoId {
  return situacoes.some((s) => s.id === id)
}
