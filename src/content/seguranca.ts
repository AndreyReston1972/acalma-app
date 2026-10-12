/*
 * Apoio de segurança.
 *
 * ORIGEM: a frase de segurança já usada pela Nina ("Se alguém estiver em
 * perigo, ligue 190 ou 192. Se você estiver pensando em se machucar, o CVV
 * atende 24 horas pelo 188."), presente no projeto nina-creative-spark.
 * Nada além disso foi acrescentado: nenhum protocolo, nenhum outro contato.
 *
 * PENDENTE: revisão jurídica/profissional antes de produção.
 */
export const seguranca = {
  titulo: 'Se alguém pode se machucar',
  introducao: 'Se for mais do que uma birra, a segurança vem antes de qualquer orientação.',
  contatos: [
    { numero: '190', rotulo: 'Ligar 190', descricao: 'Se alguém estiver em perigo' },
    { numero: '192', rotulo: 'Ligar 192', descricao: 'Se alguém estiver em perigo' },
    { numero: '188', rotulo: 'Ligar 188 (CVV)', descricao: 'Se você estiver pensando em se machucar. Atende 24 horas.' },
  ],
  fechamento: 'Quando todos estiverem em segurança, as orientações continuam aqui.',
} as const
