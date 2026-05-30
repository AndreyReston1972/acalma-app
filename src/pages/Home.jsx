import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from '../components/AuthModal'

/* ── Dicas rotativas (1 por dia via índice do ano) ── */
const dicas = [
  { texto: 'Antes de reagir à birra, respire uma vez. Esse segundo de pausa muda tudo.', tag: 'Autorregulação' },
  { texto: 'Nomear a emoção da criança antes de corrigir o comportamento reduz a intensidade da crise.', tag: 'Emoções' },
  { texto: 'Crianças não desobedecem para irritar — elas testam limites para sentir que você está no controle.', tag: 'Limites' },
  { texto: 'Conexão antes de correção: 30 segundos de presença real diminuem a resistência.', tag: 'Vínculo' },
  { texto: 'Consistência é mais importante do que perfeição. Um "não" que se mantém vale mais do que dez que cedem.', tag: 'Limites' },
  { texto: 'Quando você fica calma, o cérebro do seu filho tem a chance de se regular também. Você é a âncora.', tag: 'Neurociência' },
  { texto: 'Oferecer duas escolhas dentro de um limite devolve autonomia sem abrir mão da estrutura.', tag: 'Limites' },
  { texto: 'Birra não é manipulação — é o jeito do cérebro imaturo de pedir ajuda para regular uma emoção grande.', tag: 'Emoções' },
  { texto: 'Pedir desculpas ao seu filho quando você errou não enfraquece sua autoridade — ela fortalece o vínculo.', tag: 'Vínculo' },
  { texto: 'Avise antes das transições: "Daqui a 5 minutos a gente vai". Isso reduz resistências em 70%.', tag: 'Prática' },
  { texto: 'Crianças reguladas têm mães reguladas. Cuidar de você não é egoísmo — é estratégia.', tag: 'Autocuidado' },
  { texto: 'O que você repete vira rotina. O que vira rotina, vira segurança para a criança.', tag: 'Desenvolvimento' },
  { texto: 'Quando a crise passa, é a hora de conversar. No meio da tempestade, só o acolhimento funciona.', tag: 'Prática' },
  { texto: 'Presença sem telefone por 15 minutos por dia tem mais impacto do que horas de atenção distraída.', tag: 'Conexão' },
]

const desafioLabel = {
  birras: 'Birras e explosões',
  limites: 'Limites e desobediência',
  ansiedade: 'Ansiedade e medos',
  irmaos: 'Conflitos entre irmãos',
  rotinas: 'Rotinas difíceis',
  culpa: 'Autoconfiança como mãe',
}

const idadeLabel = {
  '2-3': '2 a 3 anos',
  '4-5': '4 a 5 anos',
  '6-8': '6 a 8 anos',
  'varios': 'idades diferentes',
}

const diasNomes = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

/* ── Utilitários ── */
function saudacao() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

function dataFormatada() {
  const s = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
  return s.replace(/^\w/, c => c.toUpperCase())
}

function diaDoAno() {
  const agora = new Date()
  const inicio = new Date(agora.getFullYear(), 0, 0)
  return Math.floor((agora - inicio) / 86400000)
}

function semanaAtual() {
  const hoje = new Date()
  const diaSemana = hoje.getDay()
  const segunda = new Date(hoje)
  segunda.setDate(hoje.getDate() - ((diaSemana + 6) % 7))

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(segunda)
    d.setDate(segunda.getDate() + i)
    const chave = d.toISOString().split('T')[0]
    return {
      label: diasNomes[d.getDay()],
      isHoje: d.toDateString() === hoje.toDateString(),
      isFuturo: d > hoje,
      temEntrada: !!localStorage.getItem(`acalma_diario_${chave}`),
    }
  })
}

function contarEntradas() {
  return Object.keys(localStorage)
    .filter(k => k.startsWith('acalma_diario_'))
    .length
}

/* ── Componente ── */
export default function Home() {
  const navigate  = useNavigate()
  const { user }  = useAuth()
  const [authOpen, setAuthOpen]             = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(
    () => !!localStorage.getItem('acalma_banner_dismissed')
  )
  const perfil = JSON.parse(localStorage.getItem('acalma_perfil') || '{}')
  const dica = dicas[diaDoAno() % dicas.length]
  const dias = semanaAtual()
  const totalEntradas = contarEntradas()

  return (
    <div
      className="flex flex-col pb-28 min-h-svh"
      style={{ background: 'var(--color-areia)' }}
    >
      {/* ── Header ── */}
      <div
        className="px-6 pb-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #4A7C65 0%, #3A6855 100%)',
          borderRadius: '0 0 28px 28px',
          paddingTop: 'calc(env(safe-area-inset-top) + 16px)',
        }}
      >
        <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, background: 'rgba(255,255,255,0.06)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -20, left: -20, width: 100, height: 100, background: 'rgba(255,255,255,0.04)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            <span className="font-lora text-lg text-white opacity-90">Acalma</span>
          </div>
          <span className="text-white text-xs opacity-60">{dataFormatada()}</span>
        </div>

        <p className="font-lora text-white/70 text-sm mb-1">{saudacao()},</p>
        <h1 className="font-lora text-white leading-snug" style={{ fontSize: 20, fontWeight: 600 }}>
          mamãe 💚
        </h1>

        {perfil.desafio && (
          <div className="mt-3 inline-flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1">
            <span className="text-xs text-white/90">Foco: {desafioLabel[perfil.desafio]}</span>
          </div>
        )}
      </div>

      <div className="px-5 mt-5 flex flex-col gap-4">

        {/* ── Botão SOS ── */}
        <button
          onClick={() => navigate('/sos')}
          className="sos-pulse w-full text-white text-left active:scale-95 transition-transform duration-150"
          style={{
            background: 'linear-gradient(135deg, #E85D4A 0%, #C94535 100%)',
            borderRadius: 20,
            padding: '22px 24px',
            boxShadow: '0 8px 30px rgba(232,93,74,0.4)',
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">🆘</span>
                <span className="font-lora text-xl font-bold">Modo SOS</span>
              </div>
              <p className="text-white/80 text-sm">Meu filho está em crise agora</p>
            </div>
            <span className="text-3xl opacity-80">→</span>
          </div>
        </button>

        {/* ── Banner de sincronização (só aparece se não logada e não dispensada) ── */}
        {!user && !bannerDismissed && (
          <div className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <span className="text-xl">☁️</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-700">Salve seu progresso</p>
              <p className="text-xs text-gray-400">Acesse de qualquer dispositivo</p>
            </div>
            <button
              onClick={() => setAuthOpen(true)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg flex-shrink-0"
              style={{ background: 'var(--color-verde-50)', color: 'var(--color-verde)' }}
            >
              Entrar
            </button>
            <button
              onClick={() => {
                setBannerDismissed(true)
                localStorage.setItem('acalma_banner_dismissed', '1')
              }}
              className="text-gray-300 text-base leading-none flex-shrink-0"
            >
              ✕
            </button>
          </div>
        )}

        {/* ── Progresso semanal ── */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-lora text-base" style={{ color: 'var(--color-verde-dark)' }}>
              Esta semana
            </h2>
            <span className="text-xs text-gray-400">
              {totalEntradas === 0
                ? 'Nenhum registro ainda'
                : `${totalEntradas} registro${totalEntradas > 1 ? 's' : ''}`}
            </span>
          </div>

          <div className="flex justify-between">
            {dias.map(({ label, isHoje, isFuturo, temEntrada }) => (
              <div key={label} className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] text-gray-400">{label}</span>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all"
                  style={{
                    background: isHoje
                      ? 'var(--color-verde)'
                      : temEntrada
                        ? 'var(--color-verde-100)'
                        : isFuturo
                          ? '#F3F4F6'
                          : '#F3F4F6',
                    color: isHoje ? 'white' : temEntrada ? 'var(--color-verde-dark)' : '#D1D5DB',
                    border: isHoje ? '2px solid var(--color-verde-dark)' : '2px solid transparent',
                  }}
                >
                  {temEntrada ? '✓' : '·'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Dica do dia ── */}
        <div
          className="rounded-2xl p-4"
          style={{ background: 'var(--color-verde-50)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">💡</span>
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-verde)' }}>
              Dica do dia
            </span>
            <span
              className="ml-auto text-[10px] px-2 py-0.5 rounded-full"
              style={{ background: 'var(--color-verde-100)', color: 'var(--color-verde-dark)' }}
            >
              {dica.tag}
            </span>
          </div>
          <p className="font-lora text-sm text-gray-700 leading-relaxed italic">{dica.texto}</p>
        </div>

        {/* ── Atalhos rápidos ── */}
        <div>
          <h2 className="font-lora text-base text-gray-700 mb-3">Explorar</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: '💚', label: 'Emoções', sub: '8 fichas completas', rota: '/emocoes', bg: '#EDF4F0', cor: '#3D6B55' },
              { icon: '🎯', label: 'Limites', sub: '6 scripts práticos', rota: '/limites', bg: '#F0EDF5', cor: '#7C5CBF' },
              { icon: '📔', label: 'Diário', sub: 'Registre episódios', rota: '/diario', bg: '#FDF3F1', cor: '#E07060' },
              { icon: '✨', label: 'Nina', sub: 'Planos e suporte', rota: '/nina', bg: '#FEF9EC', cor: '#C09030' },
            ].map(({ icon, label, sub, rota, bg, cor }) => (
              <button
                key={rota}
                onClick={() => navigate(rota)}
                className="text-left rounded-2xl p-4 active:scale-95 transition-transform duration-150"
                style={{ background: bg }}
              >
                <span className="text-2xl block mb-2">{icon}</span>
                <p className="font-semibold text-sm" style={{ color: cor }}>{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
              </button>
            ))}
          </div>
        </div>

        {/* ── Perfil do filho ── */}
        {perfil.idade && (
          <div className="bg-white rounded-2xl p-4 flex items-center gap-3" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <span className="text-2xl">👶</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700">Perfil configurado</p>
              <p className="text-xs text-gray-400 truncate">
                {idadeLabel[perfil.idade]} · {desafioLabel[perfil.desafio] || 'sem desafio'}
              </p>
              {user && (
                <p className="text-[10px] text-gray-300 mt-0.5 truncate">☁️ {user.email}</p>
              )}
            </div>
            <button
              onClick={() => user ? setAuthOpen(true) : setAuthOpen(true)}
              className="text-xs text-gray-300 hover:text-gray-500 flex-shrink-0"
            >
              {user ? '☁️' : '↗'}
            </button>
          </div>
        )}

      </div>

      {authOpen && <AuthModal onFechar={() => setAuthOpen(false)} />}
    </div>
  )
}
