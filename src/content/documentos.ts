/*
 * RASCUNHOS de termos e privacidade, escritos para corresponder ao que o app faz.
 * NÃO são documentos jurídicos revisados. Trechos entre [colchetes] são decisões
 * pendentes (empresa, prazos, canais). Revisão jurídica obrigatória antes do lançamento.
 */
export interface Documento {
  titulo: string
  versao: string
  secoes: { titulo: string; paragrafos: string[] }[]
}

export const termos: Documento = {
  titulo: 'Termos de uso do Acalma',
  versao: '2026-10-rascunho',
  secoes: [
    {
      titulo: 'O que é o Acalma',
      paragrafos: [
        'O Acalma oferece orientações práticas para momentos de birra e transições do dia a dia, e permite montar combinados visuais para mostrar à criança.',
        'É um material educativo. Não faz diagnóstico, não substitui acompanhamento de saúde e não é serviço de emergência. Em emergência, ligue 192 (SAMU) ou 190 (Polícia Militar).',
        'Os textos do Acalma estão em revisão editorial e profissional. [Registrar aqui a revisão quando ela acontecer.]',
      ],
    },
    {
      titulo: 'Acesso e pagamento',
      paragrafos: [
        'O acesso é liberado por um pagamento único de R$ 14,90 feito pela Hotmart, sem mensalidade. Ele fica vinculado ao e-mail usado na compra.',
        'Comprar o Acalma não inicia teste nem assinatura da Nina. A Nina é um produto separado e opcional.',
        'Se a compra for reembolsada ou contestada, o acesso ao Acalma é encerrado. Uma nova compra libera o acesso novamente.',
      ],
    },
    {
      titulo: 'Uso sem internet',
      paragrafos: [
        'Depois de entrar com internet, a ajuda e os seus combinados abrem neste aparelho mesmo sem conexão, por até [30] dias desde a última confirmação. Depois disso, o app pede conexão uma vez para confirmar o acesso.',
        'O navegador pode apagar os dados do site (por limpeza, falta de espaço ou troca de aparelho). Nesse caso, basta entrar de novo com internet: o que já foi sincronizado volta.',
      ],
    },
    {
      titulo: 'Disponibilidade',
      paragrafos: [
        'Mantemos o Acalma disponível e atualizado enquanto o produto estiver em operação. [Definir: prazo mínimo de aviso antes de um eventual encerramento e como os dados poderão ser exportados.]',
      ],
    },
    {
      titulo: 'Conta',
      paragrafos: [
        'A conta é a mesma da NexoEdu/Nina, identificada pelo seu e-mail. Você pode sair de um aparelho a qualquer momento e excluir os seus dados do Acalma pela tela Conta.',
        '[Responsável: razão social, CNPJ e contato da NexoEdu — pendente.]',
      ],
    },
  ],
}

export const privacidade: Documento = {
  titulo: 'Privacidade no Acalma',
  versao: '2026-10-rascunho',
  secoes: [
    {
      titulo: 'O que guardamos',
      paragrafos: [
        'Seu e-mail, para a conta e o acesso.',
        'Dados da compra recebidos da Hotmart: código da transação, situação do pagamento, e-mail da compra e o registro original de cada aviso de pagamento.',
        'O que você decide guardar: combinados (nome opcional e passos), orientações salvas e registros (a resposta "ajudou?" e uma anotação opcional). Evite escrever nomes ou informações de saúde nas anotações.',
        'A versão dos termos e da política que você aceitou, com a data.',
        'Não pedimos nome, idade, data de nascimento ou foto da criança.',
      ],
    },
    {
      titulo: 'Onde fica',
      paragrafos: [
        'Neste aparelho, para funcionar sem internet, e na sua conta, para não se perder ao trocar de aparelho. A conta fica na infraestrutura Supabase usada pela NexoEdu, na região de São Paulo.',
      ],
    },
    {
      titulo: 'O que não fazemos',
      paragrafos: [
        'Não usamos inteligência artificial para responder no Acalma.',
        'Não enviamos nomes, anotações ou o conteúdo dos registros para ferramentas de análise ou publicidade.',
        'A Nina não recebe automaticamente seus registros ou combinados.',
      ],
    },
    {
      titulo: 'Seus direitos',
      paragrafos: [
        'Você pode ver e excluir os seus dados do Acalma pela tela Conta. Para excluir a conta inteira ou exercer outros direitos previstos na LGPD, fale com [canal a definir].',
        'Os dados de compra podem ser mantidos pelo prazo exigido por lei [prazo a confirmar com o jurídico], mesmo após a exclusão da conta, sem vínculo com o seu uso do app.',
        '[Controlador e encarregado de dados: pendente.]',
      ],
    },
  ],
}
