import type { Caminho, Situacao, SituacaoId } from './tipos'

/*
 * Conteúdo v2 do protótipo: CANDIDATO À REVISÃO EDITORIAL E PROFISSIONAL.
 * Não é conteúdo validado. "desligar-tela" e "ir-embora" são as referências
 * mais trabalhadas; as demais são breves e específicas.
 *
 * Correções editoriais desta versão (ver docs/prototipo/LEIA-ME.md):
 * - sem orientação de contenção física;
 * - o "não" pode ser reconsiderado;
 * - "ir embora" fala da saída que ainda vai acontecer e não aponta para a
 *   rotina doméstica de sair de casa.
 */
export const situacoes: Situacao[] = [
  {
    id: 'desligar-tela',
    titulo: 'Desligar a tela',
    cena: 'tela',
    agora: 'Desligue e deixe a tela desligada. Fique perto, abaixe-se na altura da criança e fale pouco.',
    frase: 'Você queria continuar assistindo. A tela acabou agora. Eu fico aqui com você.',
    depois: 'Quando o choro baixar, ofereça uma escolha pequena: “Você leva o tablet para a gaveta ou eu levo?”',
    caminhos: [
      {
        id: 'ainda-dificil',
        rotulo: 'Ainda está difícil',
        orientacao:
          'Guarde o aparelho fora da vista e diminua o barulho em volta. Fique perto, em silêncio, e repita só a frase curta quando a criança olhar para você.',
        frase: 'A tela acabou. Eu estou aqui.',
      },
      {
        id: 'pede-mais-um',
        rotulo: 'Pede “só mais um”',
        orientacao:
          'Responda uma vez, sem negociar no meio do choro. Se vocês costumam ter tela em outro momento, diga quando é, sem prometer o que não vai cumprir.',
        frase: 'Agora não tem mais um. A tela volta em outro dia.',
      },
      {
        id: 'nao-quer-ajuda',
        rotulo: 'Não quer minha ajuda',
        orientacao:
          'Dê espaço sem sair de perto: sente-se a alguns passos e faça algo calmo com as mãos. Deixe claro que você continua disponível.',
        frase: 'Tudo bem. Vou ficar aqui. Quando quiser, eu chego perto.',
      },
    ],
    modeloParaProximaVez: 'encerrar-tela',
    estado: 'rascunho',
  },
  {
    id: 'ouvir-nao',
    titulo: 'Ouvir um “não”',
    cena: 'nao',
    agora: 'Se o não continua valendo, diga uma vez, com calma, e pare de explicar.',
    frase: 'Você queria muito. Agora a resposta é não. Pode ficar com raiva, eu continuo aqui.',
    depois: 'Mostre o que é possível no lugar: “Biscoito agora não. Você pode escolher entre a fruta e o pão.”',
    caminhos: [
      {
        id: 'em-publico',
        rotulo: 'Estamos em público',
        orientacao:
          'Abaixe-se e fale só para a criança ouvir. Se der, vá para um canto mais calmo. Você não precisa explicar a decisão para quem está olhando.',
        frase: 'Eu sei que você queria. Estou aqui com você.',
      },
      {
        id: 'quero-rever',
        rotulo: 'Quero rever o não',
        orientacao:
          'Mudar de ideia é possível. Faça isso com calma e conte o motivo, para ficar claro que foi uma decisão sua, pensada de novo.',
        frase: 'Eu pensei de novo e mudei de ideia.',
      },
    ],
    estado: 'rascunho',
  },
  {
    id: 'ir-embora',
    titulo: 'Ir embora',
    cena: 'parque',
    agora: 'Diga que é hora de ir e comece a se preparar junto: pegue as coisas e ofereça a mão.',
    frase: 'Está difícil ir embora. Você queria ficar mais. Agora a gente vai junto.',
    depois: 'Dê uma tarefa para a saída: carregar algo leve, escolher por qual lado ir ou se despedir do lugar.',
    caminhos: [
      {
        id: 'quer-ficar-mais',
        rotulo: 'Pede para ficar mais',
        orientacao:
          'Se der para vocês, ofereça um final concreto e curto, como uma última descida no escorregador. Combine antes e, depois, vá.',
        frase: 'Mais uma descida e depois a gente vai.',
      },
      {
        id: 'nao-quer-andar',
        rotulo: 'Não quer andar',
        orientacao:
          'Ofereça duas formas de ir, se as duas forem possíveis para você: de mão dada ou no colo. Se precisar carregar, diga antes o que vai fazer.',
        frase: 'A gente vai agora. Você vai de mão dada ou no colo?',
      },
      {
        id: 'em-publico',
        rotulo: 'Estamos em público',
        orientacao:
          'Junte suas coisas primeiro e vá para um ponto com menos gente. Fale baixo e perto. O que os outros acham pode esperar.',
        frase: 'Vamos para um lugar mais calmo. Eu vou junto com você.',
      },
    ],
    estado: 'rascunho',
  },
  {
    id: 'banho-roupa',
    titulo: 'Banho ou troca de roupa',
    cena: 'toalha',
    agora: 'Diminua a pressa visível. Peça só a próxima ação, não o banho inteiro.',
    frase: 'Agora é só tirar a camiseta. Você tira ou eu ajudo?',
    depois: 'Dê uma escolha dentro do que precisa acontecer: qual toalha, qual pijama, qual brinquedo vai junto.',
    caminhos: [
      {
        id: 'nao-quer-entrar',
        rotulo: 'Não quer entrar no banho',
        orientacao: 'Divida em partes pequenas e comece pela mais fácil, como lavar as mãos ou molhar só os pés.',
        frase: 'Primeiro só os pés. Depois a gente vê o resto.',
      },
      {
        id: 'algo-incomoda',
        rotulo: 'Parece que algo incomoda',
        orientacao:
          'Pergunte o que está ruim e ajuste o que der: a água mais morna, um pano para os olhos, uma roupa mais macia.',
        frase: 'Tem alguma coisa incomodando? Me mostra onde.',
      },
    ],
    modeloParaProximaVez: 'hora-do-banho',
    estado: 'rascunho',
  },
  {
    id: 'guardar-brinquedos',
    titulo: 'Guardar brinquedos',
    cena: 'guardar-brinquedos',
    agora: 'Transforme o pedido grande em um pedaço. Aponte uma coisa só para guardar.',
    frase: 'Agora só os blocos vão para a cesta. Eu guardo um, você guarda outro.',
    depois: 'Guardem juntos por pouco tempo. Depois, diga o que vem em seguida: “Quando a cesta encher, a gente vai lavar as mãos.”',
    caminhos: [
      {
        id: 'estava-no-meio',
        rotulo: 'Estava no meio da brincadeira',
        orientacao:
          'Reconheça o que estava acontecendo e ofereça um jeito de guardar sem desmanchar tudo, como deixar a construção num canto para depois.',
        frase: 'Sua torre fica aqui no canto. Os outros blocos vão para a cesta.',
      },
      {
        id: 'ainda-dificil',
        rotulo: 'Ainda está difícil',
        orientacao: 'Diminua o pedido: só uma cesta, só uma cor, só o que está no chão. Guardar uma parte hoje já é guardar.',
        frase: 'Só os carrinhos. O resto eu guardo.',
      },
    ],
    estado: 'rascunho',
  },
  {
    id: 'outra-situacao',
    titulo: 'Outra situação',
    cena: 'cantinho',
    agora: 'Primeiro a segurança: afaste o que pode machucar e fique por perto.',
    frase: 'Está difícil agora. Eu estou aqui e não vou deixar ninguém se machucar.',
    depois: 'Fale pouco até o choro baixar. Depois, diga em uma frase o que vai acontecer agora.',
    caminhos: [
      {
        id: 'ainda-dificil',
        rotulo: 'Ainda está difícil',
        orientacao: 'Fale menos ainda. Fique perto, numa altura mais baixa, e espere. Às vezes, o que ajuda é atravessar esse tempo junto.',
        frase: 'Estou aqui. Pode demorar.',
      },
      {
        id: 'nao-quer-ajuda',
        rotulo: 'Não quer minha ajuda',
        orientacao: 'Fique no mesmo ambiente, fazendo algo calmo, e avise onde você está. Ofereça água ou colo depois, se a criança aceitar.',
        frase: 'Vou ficar aqui na cadeira. Quando quiser, me chama.',
      },
    ],
    estado: 'rascunho',
  },
]

export function buscarSituacao(id: string | undefined): Situacao | undefined {
  return situacoes.find((s) => s.id === id)
}

export function buscarCaminho(situacao: Situacao | undefined, caminhoId: string | null | undefined): Caminho | undefined {
  if (!situacao || !caminhoId) return undefined
  return situacao.caminhos.find((c) => c.id === caminhoId)
}

export function ehSituacaoId(id: string): id is SituacaoId {
  return situacoes.some((s) => s.id === id)
}
