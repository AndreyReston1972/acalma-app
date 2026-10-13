/*
 * Termos de uso e Política de privacidade do Acalma, versão 2026-10-13.
 * Escritos pela NexoEdu para corresponder ao que o app faz, com os dados e decisões
 * confirmados pela responsável em 13/10/2026. NÃO passaram por revisão jurídica externa
 * (não declarar que passaram). Bases consultadas: docs/integracao-comercial/07-BASES-DOS-DOCUMENTOS.md.
 * O build comercial (VITE_ACALMA_MODO=integrado) falha se houver [colchetes] ou versão
 * "rascunho" aqui: scripts/verificar-publicacao.mjs.
 */
export interface Documento {
  titulo: string
  versao: string
  secoes: { titulo: string; paragrafos: string[] }[]
}

const FORNECEDORA = 'Vanderleia da Silva, pessoa natural, que usa o nome comercial NexoEdu / Acalma'
const ENDERECO = 'Avenida Borges de Medeiros, nº 4901, Centro, Gramado/RS'
const CANAL = 'comercial@nexo-edu.com'

export const termos: Documento = {
  titulo: 'Termos de uso do Acalma',
  versao: '2026-10-13',
  secoes: [
    {
      titulo: 'Quem oferece',
      paragrafos: [
        `O Acalma é oferecido por ${FORNECEDORA}, com endereço na ${ENDERECO}. Atendimento: ${CANAL}.`,
      ],
    },
    {
      titulo: 'O que é o Acalma',
      paragrafos: [
        'O Acalma oferece orientações práticas para momentos de birra e transições do dia a dia, e permite montar combinados visuais para mostrar à criança. Foi pensado para responsáveis por crianças de 2 a 6 anos.',
        'É um material educativo. Não faz diagnóstico, não substitui acompanhamento de saúde e não é serviço de emergência. Em emergência, ligue 192 (SAMU) ou 190 (Polícia Militar).',
        'Os textos passaram por revisão editorial com base em fontes de saúde públicas e institucionais. Eles não foram validados por psicólogo ou pediatra. Cada criança reage de um jeito, e não há garantia de resultado.',
      ],
    },
    {
      titulo: 'Acesso e pagamento',
      paragrafos: [
        'O acesso é liberado por um pagamento único de R$ 14,90 feito pela Hotmart, sem mensalidade. Ele fica vinculado ao e-mail usado na compra: use o mesmo e-mail para entrar.',
        'Pagamento único quer dizer que não há cobrança recorrente. Não quer dizer acesso perpétuo: o acesso vale enquanto o Acalma for mantido em operação, nas condições da seção "Disponibilidade e encerramento".',
        'Comprar o Acalma não inicia teste nem assinatura da Nina. A Nina é um produto separado e opcional, e o teste dela só começa se você escolher iniciá-lo.',
        'Enquanto uma contestação do pagamento estiver em análise, o acesso continua. Se a compra for reembolsada ou o pagamento for estornado (chargeback), o acesso ao Acalma é encerrado. Uma nova compra libera o acesso novamente.',
        'Se você excluir a conta e criar outra com o mesmo e-mail, a compra pode ser recuperada depois que você confirmar de novo o controle desse e-mail (código enviado a ele).',
      ],
    },
    {
      titulo: 'Arrependimento',
      paragrafos: [
        `Você pode desistir da compra em até 7 dias, como prevê o artigo 49 do Código de Defesa do Consumidor, pela própria Hotmart (a mesma ferramenta usada na compra) ou pelo e-mail ${CANAL}. O valor é devolvido pela Hotmart e o acesso ao Acalma é encerrado.`,
      ],
    },
    {
      titulo: 'Uso sem internet',
      paragrafos: [
        'Depois de entrar com internet, a ajuda e os seus combinados abrem neste aparelho mesmo sem conexão, por até 30 dias desde a última confirmação de acesso feita com internet. Uma tentativa sem conexão não renova esse prazo. Depois dele, o app pede conexão uma vez para confirmar o acesso.',
        'O funcionamento sem internet não é permanente: o acesso precisa ser confirmado periodicamente. Se a confirmação mostrar que a compra foi reembolsada ou estornada, o acesso é encerrado mesmo dentro do prazo.',
        'A tela de ajuda de emergência (192, 190, 188) abre sempre, com ou sem acesso e com ou sem internet.',
        'O navegador pode apagar os dados do site (por limpeza, falta de espaço ou troca de aparelho). Nesse caso, basta entrar de novo com internet: o que já foi sincronizado volta. O que ainda não tinha sido enviado se perde.',
      ],
    },
    {
      titulo: 'Disponibilidade e encerramento',
      paragrafos: [
        'Mantemos o Acalma disponível e atualizado enquanto o produto estiver em operação. Pode haver interrupções para manutenção ou por falhas de serviços de terceiros.',
        `Se decidirmos encerrar o Acalma, avisaremos pelo e-mail da compra e dentro do app com pelo menos 90 dias de antecedência. Durante esse período, o acesso continua e você pode baixar uma cópia dos seus dados. Esse compromisso é uma política comercial nossa e não limita direitos que a lei garanta ao consumidor; dúvidas e pedidos podem ser enviados para ${CANAL}.`,
        'Mesmo sem acesso ativo, você pode baixar uma cópia dos seus dados e excluí-los pela tela de acesso ou pela tela Conta.',
      ],
    },
    {
      titulo: 'Conta',
      paragrafos: [
        'Para entrar, você confirma que leu e aceita estes termos e a política de privacidade. Guardamos a versão aceita e a data.',
        'A conta é a mesma da NexoEdu/Nina, identificada pelo seu e-mail. Você pode sair de um aparelho a qualquer momento e excluir os seus dados do Acalma pela tela Conta.',
      ],
    },
    {
      titulo: 'Lei e foro',
      paragrafos: [
        'Estes termos seguem a lei brasileira. Você pode propor eventual demanda no foro legalmente competente, inclusive no do seu domicílio, quando aplicável.',
      ],
    },
  ],
}

export const privacidade: Documento = {
  titulo: 'Privacidade no Acalma',
  versao: '2026-10-13',
  secoes: [
    {
      titulo: 'Quem cuida dos seus dados',
      paragrafos: [
        `Controladora: ${FORNECEDORA}. Endereço: ${ENDERECO}.`,
        `Canal de atendimento e privacidade: ${CANAL}. É por ele que você exerce seus direitos e fala sobre os seus dados. Não há encarregado de dados formalmente indicado; os pedidos dos titulares são recebidos e respondidos por esse canal.`,
      ],
    },
    {
      titulo: 'O que guardamos',
      paragrafos: [
        'Seu e-mail, para a conta e o acesso.',
        'Dados da compra recebidos da Hotmart: código da transação, situação do pagamento, e-mail da compra e o registro original de cada aviso de pagamento.',
        'O que você decide guardar: combinados (nome opcional e passos), orientações salvas e registros (a resposta "ajudou?" e uma anotação opcional). Evite escrever nomes ou informações de saúde nas anotações.',
        'A versão dos termos e da política que você aceitou, com a data.',
        'Se você escolher, o seu consentimento para receber novidades da NexoEdu por e-mail. É opcional, separado do acesso, e pode ser retirado a qualquer momento na tela Conta.',
        'Não pedimos nome, idade, data de nascimento ou foto da criança.',
      ],
    },
    {
      titulo: 'Para que e com qual base',
      paragrafos: [
        'Conta, acesso, sincronização e atendimento: para prestar o serviço que você contratou (execução de contrato, art. 7º, V, da LGPD).',
        'Registros de compra: para comprovar a compra, atender contestações e cumprir obrigações legais e fiscais (art. 7º, II e VI, e art. 16, I, da LGPD).',
        'Novidades por e-mail: só com o seu consentimento (art. 7º, I, da LGPD), que pode ser retirado a qualquer momento.',
      ],
    },
    {
      titulo: 'Onde fica e com quem',
      paragrafos: [
        'Neste aparelho, para funcionar sem internet, e na sua conta, para não se perder ao trocar de aparelho. A conta fica na infraestrutura Supabase usada pela NexoEdu, na região de São Paulo.',
        'Para funcionar, o Acalma usa fornecedores que tratam dados em nosso nome: Supabase (banco de dados e login), Hotmart (pagamento) e Netlify (hospedagem do app, que recebe dados técnicos de acesso, como endereço IP, e pode processá-los fora do Brasil).',
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
      titulo: 'Por quanto tempo',
      paragrafos: [
        'Combinados, orientações salvas e registros: enquanto você mantiver a conta, ou até você excluí-los pela tela Conta.',
        'Registros de compra (transação, situação, e-mail da compra e avisos da Hotmart): por 5 anos contados do último evento da compra, prazo usado para eventuais pedidos de reparação do consumidor (art. 27 do Código de Defesa do Consumidor) e para obrigações fiscais (arts. 173 e 195 do Código Tributário Nacional). Esses registros ficam separados dos dados do app e, se você excluir a conta, deixam de estar ligados a ela.',
        'Registros de aceite dos termos e de consentimento de marketing: enquanto a conta existir e pelo prazo necessário para comprovar o aceite ou a retirada.',
      ],
    },
    {
      titulo: 'Seus direitos',
      paragrafos: [
        `Você pode baixar uma cópia e excluir os seus dados do Acalma pela tela Conta, mesmo sem compra ativa. Para excluir a conta inteira ou exercer os demais direitos do art. 18 da LGPD (confirmação, acesso, correção, informação sobre compartilhamento, revogação do consentimento), escreva para ${CANAL}.`,
        'Registros do app anterior do Acalma ficam só neste navegador. Você pode baixá-los sem comprar; eles não comprovam compra nem liberam acesso.',
        'Se esta política mudar, a nova versão e a data passam a aparecer aqui, e a versão aceita fica registrada a cada novo acesso com código.',
      ],
    },
  ],
}
