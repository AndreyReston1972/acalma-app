import type { Caminho, Situacao, SituacaoId } from './tipos'

/*
 * Conteúdo v3. Revisão EDITORIAL e de experiência em 13/10/2026, apoiada em fontes institucionais
 * (docs/conteudo/REVISAO-EDITORIAL-2026-10-13.md, com a relação entre cada fonte e cada orientação).
 * NÃO houve validação por psicólogo, pediatra ou outro profissional: as frases são adaptação
 * editorial nossa, não citação das fontes.
 *
 * Cada situação entrega: o que fazer agora (ação curta), uma frase fácil de falar, um "depois"
 * ligado à situação, caminhos que são alternativas reais e uma preparação para a próxima vez.
 * Ids de situações e caminhos são estáveis: favoritos e registros salvos apontam para eles.
 * Sem contenção física, ameaça, recompensa improvisada, escolha falsa ou exigência de olhar,
 * abraço, resposta ou respiração da criança.
 */
export const situacoes: Situacao[] = [
  {
    id: 'desligar-tela',
    titulo: 'Desligar a tela',
    cena: 'tela',
    agora: 'Se chegou a hora de encerrar, desligue a tela e fique por perto. Fale pouco.',
    frase: 'Você queria continuar. A tela terminou. Estou aqui.',
    depois: 'Quando o choro baixar, diga o que vem agora, em uma frase: “Agora vamos brincar com os blocos.”',
    caminhos: [
      {
        id: 'ainda-dificil',
        rotulo: 'Ainda está difícil',
        orientacao:
          'Diminua o que está em volta: guarde o aparelho, baixe o som, apague uma luz forte. Deixe à vista uma próxima atividade, sem pedir que a criança escolha ou participe agora.',
        frase: 'Vou deixar os blocos aqui. Quando você quiser.',
      },
      {
        id: 'pede-mais-um',
        rotulo: 'Pede “só mais um”',
        orientacao:
          'Responda uma vez, com calma, e não volte a negociar durante o protesto. Se já existe um próximo horário de tela, pode dizer qual é. Se não existe, não precisa decidir isso agora.',
        frase: 'Você queria outro vídeo. Agora terminamos.',
      },
      {
        id: 'nao-quer-ajuda',
        rotulo: 'Não quer minha ajuda',
        orientacao:
          'Respeite se a criança não quer que você chegue perto. Fique onde consiga ver e ouvir, fazendo algo calmo. De tempos em tempos, aproxime-se um pouco, sem esperar que ela peça.',
        frase: 'Tudo bem. Vou ficar aqui perto.',
      },
    ],
    proximaVez:
      'Antes de ligar, conte como a tela vai terminar e o que vem depois: “Quando acabar este episódio, a gente desliga e vai brincar.” Se usar um combinado, mostre antes da hora de desligar, não no meio do choro.',
    modeloParaProximaVez: 'encerrar-tela',
    estado: 'rascunho',
  },
  {
    id: 'ouvir-nao',
    titulo: 'Ouvir um “não”',
    cena: 'nao',
    agora: 'Se o não continua valendo, diga uma vez, com calma, e pare de explicar.',
    frase: 'Você queria muito. Agora não dá. Estou aqui.',
    depois: 'Mostre o que é possível, com duas opções que você aceita: “A bola agora não. Pode ser o quebra-cabeça ou os lápis.”',
    caminhos: [
      {
        id: 'em-publico',
        rotulo: 'Estamos em público',
        orientacao:
          'Abaixe-se e fale só para a criança ouvir. Se for possível e seguro, vão juntos para um canto mais calmo. Você não precisa explicar a decisão para quem está olhando.',
        frase: 'Eu sei que você queria. Estou com você.',
      },
      {
        id: 'quero-rever',
        rotulo: 'Quero rever o não',
        orientacao:
          'Se o limite continua necessário, mantenha. Se você percebeu que se enganou ou entendeu melhor o pedido, pode corrigir a decisão e explicar o motivo em uma frase.',
        frase: 'Eu entendi melhor. Podemos fazer assim…',
      },
    ],
    proximaVez:
      'Se um pedido costuma se repetir em certo lugar, decida antes o que é possível e avise na chegada: “Hoje a gente veio só olhar.”',
    estado: 'rascunho',
  },
  {
    id: 'ir-embora',
    titulo: 'Ir embora',
    cena: 'parque',
    agora: 'Diga que é hora de ir e comecem a se preparar juntos: pegue as coisas e ofereça a mão.',
    frase: 'Você queria ficar. Agora vamos embora juntos.',
    depois: 'Dê uma tarefa para a saída: carregar algo leve, abrir caminho até o portão ou dar tchau para o lugar.',
    caminhos: [
      {
        id: 'quer-ficar-mais',
        rotulo: 'Pede para ficar mais',
        orientacao:
          'Um último brinquedo funciona quando é combinado antes de começar a saída, se houver tempo: “Mais uma descida e vamos.” Se essa última vez já aconteceu, não ofereça outra a cada protesto. Se precisam sair agora, diga isso em poucas palavras.',
        frase: 'A última já foi. Agora vamos.',
      },
      {
        id: 'nao-quer-andar',
        rotulo: 'Não quer andar',
        orientacao:
          'Veja primeiro se é cansaço, dor ou desconforto. Sem perigo por perto, façam uma pausa num lugar seguro e, se der, peça ajuda a outro adulto. Ofereça mão dada ou colo só se as duas formas forem possíveis e seguras. Nunca puxe nem levante pelas mãos, punhos ou braços: isso pode machucar o cotovelo. Se houver perigo, como carros, a prioridade é sair dali e pedir ajuda.',
        frase: 'Está difícil andar? Vamos parar um pouco aqui.',
      },
      {
        id: 'em-publico',
        rotulo: 'Estamos em público',
        orientacao:
          'Se for possível e seguro, junte suas coisas e vá com a criança para um ponto com menos gente. Fale baixo e perto. A atenção é para ela, não para os olhares.',
        frase: 'Vamos para um lugar mais calmo. Eu vou com você.',
      },
    ],
    proximaVez:
      'Antes do passeio, conte como vai ser o fim: “Quando eu avisar, a gente dá tchau e volta para casa.” Lá, avise de novo um pouco antes da hora.',
    estado: 'rascunho',
  },
  {
    id: 'banho-roupa',
    titulo: 'Banho ou troca de roupa',
    cena: 'toalha',
    agora: 'Diminua a pressa. Peça só a próxima etapa, não o banho inteiro.',
    frase: 'Agora é só tirar a camiseta. Você tira ou eu ajudo?',
    depois: 'Ofereça uma escolha dentro do que precisa acontecer: qual toalha, qual pijama, qual brinquedo vai junto.',
    caminhos: [
      {
        id: 'nao-quer-entrar',
        rotulo: 'Não quer entrar no banho',
        orientacao:
          'Divida em partes pequenas e comece pela mais fácil, como molhar os pés ou as mãos. Avise cada passo antes de fazer e fique junto o tempo todo.',
        frase: 'Vamos começar pelos pés. Depois eu aviso o próximo passo.',
      },
      {
        id: 'algo-incomoda',
        rotulo: 'Parece que algo incomoda',
        orientacao:
          'Confira uma coisa por vez: temperatura, barulho, água no rosto, sabonete, tecido ou etiqueta. Ajuste o que der, sem insistir no que incomoda. A criança pode mostrar ou apontar, e você pode observar. Se dor ou incômodo se repetem e atrapalham a rotina, converse com o pediatra. Se vocês já têm orientação de um profissional, ela vem primeiro.',
        frase: 'Tem algo incomodando? Pode me mostrar.',
      },
    ],
    proximaVez:
      'Deixe a roupa separada e mostre o combinado antes de entrar no banheiro, não durante o banho: lá dentro, a atenção fica na criança.',
    modeloParaProximaVez: 'hora-do-banho',
    estado: 'rascunho',
  },
  {
    id: 'guardar-brinquedos',
    titulo: 'Guardar brinquedos',
    cena: 'guardar-brinquedos',
    agora: 'Transforme o pedido grande em uma parte pequena e guarde junto.',
    frase: 'Vamos guardar estes três. Eu começo com este.',
    depois: 'Diga o que vem quando terminar: “Depois destes brinquedos, vamos jantar.”',
    caminhos: [
      {
        id: 'estava-no-meio',
        rotulo: 'Estava no meio da brincadeira',
        orientacao:
          'Reconheça a brincadeira. Se houver espaço e for seguro, a construção pode ficar num canto até mais tarde. Se não der, tirem uma foto antes de desmontar.',
        frase: 'Sua torre pode ficar neste canto. Os outros blocos vão para a cesta.',
      },
      {
        id: 'ainda-dificil',
        rotulo: 'Ainda está difícil',
        orientacao:
          'Diminua de verdade: um brinquedo só, entregue na mão. Se o choro está forte, pare a tarefa por agora e voltem a ela mais tarde.',
        frase: 'Coloca este carrinho aqui comigo.',
      },
    ],
    proximaVez:
      'Avise um pouco antes que a brincadeira vai terminar e deixe o lugar de cada coisa fácil de ver, como uma cesta ou caixa sem tampa.',
    estado: 'rascunho',
  },
  {
    id: 'outra-situacao',
    titulo: 'Outra situação',
    cena: 'cantinho',
    agora: 'Primeiro a segurança: afaste o que pode machucar e fique por perto. Fale pouco.',
    frase: 'Estou aqui. Vou ajudar.',
    depois: 'Quando o choro baixar, diga em uma frase o que vai acontecer agora.',
    caminhos: [
      {
        id: 'ainda-dificil',
        rotulo: 'Ainda está difícil',
        orientacao:
          'Veja se há algo por trás: fome, sono, dor, desconforto, barulho ou gente demais. Se todos estão seguros, esperar junto é uma opção. Se alguém está se machucando ou pode se machucar, aja agora ou peça ajuda.',
        frase: 'Algo está incomodando? Eu vou ajudar.',
      },
      {
        id: 'nao-quer-ajuda',
        rotulo: 'Não quer minha ajuda',
        orientacao:
          'Fique no mesmo ambiente, de onde consiga ver a criança, fazendo algo calmo. Não insista no toque. Ofereça água ou colo de tempos em tempos: ela não precisa pedir para receber apoio.',
        frase: 'Estou aqui na cadeira. Se quiser, eu chego perto.',
      },
    ],
    proximaVez:
      'Se a situação se repete, anote quando acontece: hora, lugar e o que veio antes. Isso ajuda a perceber o que dá para preparar.',
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
