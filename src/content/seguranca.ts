/*
 * Apoio de segurança, v2.
 *
 * FONTES OFICIAIS (consultadas em 12/10/2026):
 * - 192, SAMU: Ministério da Saúde, gov.br/saude/pt-br/composicao/saes/samu-192
 *   Serviço público e gratuito, 24 horas, para urgência e emergência de saúde
 *   (inclui intoxicação, queimaduras graves, acidentes, tentativa de suicídio).
 * - 190, Polícia Militar: Governo do Paraná, serviço "Acionar emergência
 *   policial - 190". Gratuito em todo o território nacional, 24 horas; para
 *   crime em andamento, risco à integridade física e situações que exigem
 *   intervenção imediata.
 * - 188, CVV: cvv.org.br. Apoio emocional e prevenção do suicídio, gratuito,
 *   24 horas, por telefone, chat e e-mail. NÃO é serviço de emergência.
 *
 * PENDENTE: revisão jurídica e profissional antes de produção.
 */
export interface Contato {
  numero: string
  servico: string
  quando: string
  detalhe: string
}

export const seguranca = {
  titulo: 'Ajuda além do Acalma',
  introducao: 'Você não precisa ter certeza de que é grave para pedir ajuda.',
  emergencia: [
    {
      numero: '192',
      servico: 'SAMU',
      quando: 'Alguém se machucou ou a saúde está em risco',
      detalhe: 'Urgência médica. Gratuito, 24 horas.',
    },
    {
      numero: '190',
      servico: 'Polícia Militar',
      quando: 'Há violência ou alguém corre perigo',
      detalhe: 'Emergência policial. Gratuito, 24 horas.',
    },
  ] as Contato[],
  apoio: {
    numero: '188',
    servico: 'CVV',
    quando: 'Você precisa conversar com alguém',
    detalhe: 'Apoio emocional e prevenção do suicídio. Gratuito, 24 horas, também por chat em cvv.org.br.',
  } as Contato,
  avisoApoio: 'O CVV não é atendimento de emergência. Se houver risco à vida agora, ligue 192.',
  fechamento: 'Quando todos estiverem em segurança, as orientações continuam aqui.',
} as const
