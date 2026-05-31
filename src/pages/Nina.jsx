import { useState } from 'react'

/* ── Dados dos planos — substitua os links Hotmart ── */
const PLANOS = [
  {
    id: 'start',
    nome: 'Start',
    emoji: '🌱',
    preco: 'R$47',
    periodo: '/mês',
    descricao: 'Para começar com apoio estruturado',
    destaque: false,
    corBorda: '#5A8A72',
    corBtn: '#5A8A72',
    hotmart: 'https://pay.hotmart.com/S104232110T?off=y21n7znw',
    itens: [
      'Nina via WhatsApp — 10 mensagens/mês',
      'Respostas em até 24h',
      'Guias em PDF exclusivos',
      'Acesso total ao app Acalma',
    ],
  },
  {
    id: 'pro',
    nome: 'Pro',
    emoji: '🌿',
    preco: 'R$97',
    periodo: '/mês',
    descricao: 'O preferido das mães do programa',
    destaque: true,
    badge: 'Mais popular',
    corBorda: '#3D6B55',
    corBtn: '#3D6B55',
    hotmart: 'https://pay.hotmart.com/D104243487N?off=ye6e69lq&couponCode=ACALMA49',
    itens: [
      'Nina via WhatsApp — ilimitado',
      'Respostas em até 3h (dias úteis)',
      'Plano personalizado para seu filho',
      'Grupo VIP de mães',
      'Análise mensal de padrões',
      'Acesso total ao app Acalma',
    ],
  },
  {
    id: 'max',
    nome: 'Max',
    emoji: '🌳',
    preco: 'R$197',
    periodo: '/mês',
    descricao: 'Acompanhamento completo e intensivo',
    destaque: false,
    badge: 'Premium',
    corBorda: '#7C5CBF',
    corBtn: '#7C5CBF',
    hotmart: 'https://pay.hotmart.com/R104244018V?off=lc11luf8',
    itens: [
      'Tudo do plano Pro',
      '1 sessão ao vivo/mês (45 min)',
      'Plano estruturado de 90 dias',
      'Suporte prioritário — até 1h',
      'Acesso beta a novos recursos',
    ],
  },
]

const FAQ = [
  {
    pergunta: 'O app Acalma já está incluído nos planos?',
    resposta: 'Sim. Todos os planos incluem acesso completo ao app Acalma, que você já possui. Os planos Nina adicionam o suporte personalizado via WhatsApp.',
  },
  {
    pergunta: 'Nina é uma IA ou uma pessoa especialista?',
    resposta: 'Nina é uma IA treinada especificamente em psicologia positiva, desenvolvimento infantil e parentalidade consciente. Ela não substitui acompanhamento clínico, mas oferece suporte prático e acessível no dia a dia.',
  },
  {
    pergunta: 'Posso cancelar quando quiser?',
    resposta: 'Sim. Todos os planos são mensais e podem ser cancelados a qualquer momento diretamente pela sua conta Hotmart, sem burocracia.',
  },
  {
    pergunta: 'O que acontece com meu acesso ao app se eu cancelar?',
    resposta: 'O app Acalma é seu para sempre — você pagou R$67 uma vez e o acesso é vitalício. Cancelar o plano Nina apenas encerra o suporte via WhatsApp.',
  },
]

/* ── Componente FAQ item ── */
function FaqItem({ pergunta, resposta }) {
  const [aberto, setAberto] = useState(false)
  return (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      <button
        onClick={() => setAberto(p => !p)}
        className="w-full flex items-center justify-between px-4 py-4 text-left gap-3"
      >
        <span className="text-sm font-medium text-gray-800 leading-snug">{pergunta}</span>
        <span
          className="text-gray-400 flex-shrink-0 transition-transform duration-300 text-sm"
          style={{ transform: aberto ? 'rotate(180deg)' : 'none' }}
        >
          ▼
        </span>
      </button>
      <div style={{ maxHeight: aberto ? '300px' : '0', overflow: 'hidden', transition: 'max-height 0.3s ease' }}>
        <p className="px-4 pb-4 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
          {resposta}
        </p>
      </div>
    </div>
  )
}

/* ── Card de plano ── */
function CardPlano({ plano }) {
  return (
    <div
      className="bg-white rounded-3xl overflow-hidden transition-shadow"
      style={{
        border: `2px solid ${plano.destaque ? plano.corBorda : '#E5E7EB'}`,
        boxShadow: plano.destaque ? `0 8px 24px ${plano.corBorda}25` : '0 1px 6px rgba(0,0,0,0.07)',
      }}
    >
      {/* Badge */}
      {plano.badge && (
        <div
          className="text-center py-2 text-xs font-semibold uppercase tracking-widest text-white"
          style={{ background: plano.corBorda }}
        >
          ✨ {plano.badge}
        </div>
      )}

      <div className="px-5 pt-5 pb-6">
        {/* Header do plano */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">{plano.emoji}</span>
          <span className="font-lora text-xl text-gray-800">{plano.nome}</span>
        </div>
        <p className="text-xs text-gray-400 mb-4">{plano.descricao}</p>

        {/* Preço */}
        <div className="flex items-end gap-1 mb-5">
          <span className="font-lora text-3xl font-bold" style={{ color: plano.corBorda }}>
            {plano.preco}
          </span>
          <span className="text-sm text-gray-400 mb-1">{plano.periodo}</span>
        </div>

        {/* Itens */}
        <div className="flex flex-col gap-2.5 mb-6">
          {plano.itens.map((item, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div
                className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                style={{ background: `${plano.corBorda}20` }}
              >
                <span className="text-[10px] font-bold" style={{ color: plano.corBorda }}>✓</span>
              </div>
              <p className="text-sm text-gray-700 leading-snug">{item}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <a
          href={plano.hotmart}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-4 rounded-2xl text-center text-white font-semibold text-sm transition-all active:scale-95"
          style={{
            background: plano.destaque
              ? plano.corBtn
              : 'transparent',
            color: plano.destaque ? 'white' : plano.corBtn,
            border: `2px solid ${plano.corBtn}`,
            boxShadow: plano.destaque ? `0 4px 16px ${plano.corBtn}40` : 'none',
          }}
        >
          Assinar plano {plano.nome} →
        </a>
      </div>
    </div>
  )
}

/* ── Componente principal ── */
export default function Nina() {
  return (
    <div className="min-h-svh pb-28" style={{ background: 'var(--fundo)' }}>

      {/* ── Hero ── */}
      <div
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #1A3020 0%, #2C5040 60%, var(--verde) 100%)',
          borderRadius: '0 0 28px 28px',
          paddingTop: 'calc(env(safe-area-inset-top) + 16px)',
          paddingLeft: 20,
          paddingRight: 20,
          paddingBottom: 24,
        }}
      >
        <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, background: 'rgba(255,255,255,0.07)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -20, left: -20, width: 90, height: 90, background: 'rgba(255,255,255,0.04)', borderRadius: '50%', pointerEvents: 'none' }} />

        {/* Avatar */}
        <div
          className="flex items-center justify-center mb-5"
          style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.25)' }}
        >
          <span style={{ fontSize: 28 }}>✨</span>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 4 }}>NexoEdu</p>
        <h1 className="font-lora text-white mb-2" style={{ fontSize: 22, fontWeight: 600 }}>Conheça a Nina</h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, lineHeight: 1.6, maxWidth: 280 }}>
          Sua parceira de parentalidade consciente, disponível via WhatsApp quando você mais precisa.
        </p>
      </div>

      <div className="px-5 mt-6 flex flex-col gap-6">

        {/* ── Como funciona ── */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Como funciona</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { emoji: '📱', titulo: 'Você envia', desc: 'Manda a situação que está vivendo' },
              { emoji: '✨', titulo: 'Nina analisa', desc: 'Entende o contexto do seu filho' },
              { emoji: '💚', titulo: 'Você aplica', desc: 'Orientações práticas e diretas' },
            ].map(({ emoji, titulo, desc }, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center rounded-2xl p-3"
                style={{ background: 'var(--color-verde-50)' }}
              >
                <span className="text-2xl mb-2">{emoji}</span>
                <p className="font-semibold text-xs text-gray-800 mb-1">{titulo}</p>
                <p className="text-[10px] text-gray-500 leading-snug">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Depoimento ── */}
        <div
          className="rounded-2xl p-5"
          style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
        >
          <div className="flex gap-1 mb-3" aria-label="5 estrelas">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-amber-400 text-sm">★</span>
            ))}
          </div>
          <p className="text-sm text-gray-700 leading-relaxed italic mb-3">
            "Já tentei de tudo. A Nina foi a primeira que realmente entendeu o meu filho — e a mim.
            Em duas semanas as birras diminuíram pela metade."
          </p>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
              style={{ background: 'var(--color-verde)' }}
            >
              C
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800">Camila R.</p>
              <p className="text-[10px] text-gray-400">Mãe do Theo, 4 anos • Plano Pro</p>
            </div>
          </div>
        </div>

        {/* ── Planos ── */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Escolha seu plano
          </p>
          <div className="flex flex-col gap-4">
            {PLANOS.map(plano => (
              <CardPlano key={plano.id} plano={plano} />
            ))}
          </div>
        </div>

        {/* ── Garantia ── */}
        <div
          className="rounded-2xl p-4 flex gap-3 items-start"
          style={{ background: 'var(--color-verde-50)', border: '1px solid var(--color-verde-100)' }}
        >
          <span className="text-2xl flex-shrink-0">🛡️</span>
          <div>
            <p className="font-semibold text-sm" style={{ color: 'var(--color-verde-dark)' }}>
              Garantia de 7 dias
            </p>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
              Se não sentir diferença na primeira semana, devolvemos 100% do valor — sem perguntas.
            </p>
          </div>
        </div>

        {/* ── Falar antes de assinar ── */}
        <a
          href="https://wa.me/5554992708504?text=Olá!%20Quero%20saber%20mais%20sobre%20os%20planos%20da%20Nina."
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium transition-all active:scale-95"
          style={{ background: 'white', color: '#25D366', border: '1.5px solid #25D36630', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}
        >
          <span className="text-lg">💬</span>
          Tirar dúvidas no WhatsApp antes de assinar
        </a>

        {/* ── FAQ ── */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Perguntas frequentes
          </p>
          <div className="flex flex-col gap-2">
            {FAQ.map((item, i) => (
              <FaqItem key={i} pergunta={item.pergunta} resposta={item.resposta} />
            ))}
          </div>
        </div>

        {/* ── Footer ── */}
        <p className="text-center text-xs text-gray-400 pb-2">
          NexoEdu · Acalma App · Todos os direitos reservados
        </p>

      </div>
    </div>
  )
}
