export const protocoloSOS = [
  {
    passo: 1,
    titulo: 'Respira',
    duracao: 30,
    instrucao: 'Antes de qualquer coisa, respira fundo. Você não pode acalmar quem você ama se não estiver regulada.',
    dica: 'Inspire pelo nariz contando até 4, segure por 4, expire pela boca contando até 6.',
    icone: '🫁',
  },
  {
    passo: 2,
    titulo: 'Identifica',
    duracao: null,
    instrucao: 'O que está acontecendo? Qual emoção você vê na criança?',
    opcoes: ['Raiva', 'Tristeza', 'Medo', 'Frustração', 'Ansiedade', 'Ciúme', 'Outra'],
    icone: '🔍',
  },
  {
    passo: 3,
    titulo: 'Aplica o protocolo',
    duracao: null,
    instrucao: 'Escolha a resposta certa para este momento:',
    acoes: [
      { label: 'Dar espaço', descricao: 'Fique perto sem falar. Presença sem pressão.' },
      { label: 'Nomear a emoção', descricao: '"Você parece [emoção]. Isso faz sentido."' },
      { label: 'Oferecer toque', descricao: 'Abrace ou ofereça a mão. Pergunte antes se for um pré-adolescente.' },
      { label: 'Redirecionar', descricao: 'Ofereça uma atividade física para liberar a energia.' },
    ],
    icone: '🎯',
  },
  {
    passo: 4,
    titulo: 'Registra',
    duracao: null,
    instrucao: 'Anote o episódio para identificar padrões ao longo do tempo.',
    campos: ['O que aconteceu antes?', 'Como você reagiu?', 'Como terminou?'],
    icone: '📝',
  },
]
