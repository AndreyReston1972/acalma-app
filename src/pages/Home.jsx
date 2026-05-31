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
      className="flex flex-col min-h-svh"
      style={{ background: 'var(--fundo)', paddingBottom: 'calc(80px + env(safe-area-inset-bottom))' }}
    >
      {/* ── Header ── */}
      <div
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, var(--verde) 0%, var(--verde-escuro) 100%)',
          borderRadius: '0 0 28px 28px',
          paddingTop: 'calc(env(safe-area-inset-top) + 16px)',
          paddingLeft: 20,
          paddingRight: 20,
          paddingBottom: 20,
        }}
      >
        <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, background: 'rgba(255,255,255,0.07)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -20, left: -20, width: 90, height: 90, background: 'rgba(255,255,255,0.04)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            <span className="font-lora text-white" style={{ fontSize: 18, fontWeight: 600 }}>Acalma</span>
          </div>
          <span style={{
            background: 'rgba(255,255,255,0.15)',
            padding: '4px 10px',
            borderRadius: 20,
            color: 'rgba(255,255,255,0.9)',
            fontSize: 11,
            backdropFilter: 'blur(10px)',
          }}>
            {dataFormatada()}
          </span>
        </div>

        <p className="text-white/70 mb-1" style={{ fontSize: 12 }}>{saudacao()},</p>
        <h1 className="font-lora text-white leading-snug" style={{ fontSize: 22, fontWeight: 600 }}>
          mamãe 💚
        </h1>

        {perfil.desafio && (
          <div style={{
            marginTop: 12,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.2)',
            padding: '4px 12px',
            borderRadius: 20,
          }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)' }}>Foco: {desafioLabel[perfil.desafio]}</span>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-col" style={{ gap: 12, padding: '0 16px' }}>

        {/* ── Botão SOS ── */}
        <button
          onClick={() => navigate('/sos')}
          className="sos-pulse w-full text-white text-left active:scale-95 transition-transform duration-150"
          style={{
            background: 'linear-gradient(135deg, var(--sos) 0%, var(--sos-escuro) 100%)',
            borderRadius: 18,
            padding: '18px 20px',
            boxShadow: '0 8px 24px rgba(217,80,62,0.40)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>
              SOS · Emergência
            </p>
            <p className="font-lora" style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 2 }}>
              Modo SOS
            </p>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, marginTop: 2 }}>
              Meu filho está em crise agora
            </p>
          </div>
          <span style={{ fontSize: 24, opacity: 0.8 }}>→</span>
        </button>

        {/* ── Banner de sincronização (só aparece se não logada e não dispensada) ── */}
        {!user && !bannerDismissed && (
          <div style={{ background: '#FFFFFF', borderRadius: 'var(--radius-card)', padding: '12px 16px', boxShadow: 'var(--shadow-card)', display: 'flex', alignItems: 'center', gap: 12 }}>
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
        <div style={{ background: '#FFFFFF', borderRadius: 'var(--radius-card)', padding: 16, boxShadow: 'var(--shadow-card)' }}>
          <div className="flex items-center justify-between mb-4">
            <p style={{ fontSize: 13, fontWeight: 600, color: '#2D2D2D' }}>Esta semana</p>
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
        <div style={{
          background: 'linear-gradient(135deg, #F0F7F3 0%, #E8F2ED 100%)',
          borderRadius: 14,
          padding: '14px 16px',
          borderLeft: '3px solid #4A7C65',
        }}>
          <div className="flex items-center gap-2 mb-2">
            <span style={{ fontSize: 12, fontWeight: 600, color: '#4A7C65', letterSpacing: '0.5px' }}>
              💡 Dica do dia
            </span>
            <span className="ml-auto" style={{
              fontSize: 10,
              padding: '2px 8px',
              borderRadius: 20,
              background: 'rgba(74,124,101,0.12)',
              color: '#2E5540',
            }}>
              {dica.tag}
            </span>
          </div>
          <p className="font-lora" style={{ fontStyle: 'italic', fontSize: 13, color: '#2D2D2D', lineHeight: 1.6 }}>
            {dica.texto}
          </p>
        </div>

        {/* ── Atalhos rápidos ── */}
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#2D2D2D', marginBottom: 8 }}>Explorar</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { icon: '💚', label: 'Emoções', sub: '8 fichas completas', rota: '/emocoes' },
              { icon: '🎯', label: 'Limites', sub: '6 scripts práticos', rota: '/limites' },
              { icon: '📔', label: 'Diário', sub: 'Registre episódios', rota: '/diario' },
              { icon: '✨', label: 'Nina', sub: 'Planos e suporte', rota: '/nina' },
            ].map(({ icon, label, sub, rota }) => (
              <button
                key={rota}
                onClick={() => navigate(rota)}
                className="text-left active:scale-95 transition-transform duration-150"
                style={{
                  background: '#FFFFFF',
                  borderRadius: 14,
                  padding: 14,
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <span style={{ fontSize: 24, display: 'block', marginBottom: 6 }}>{icon}</span>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#2D2D2D' }}>{label}</p>
                <p style={{ fontSize: 11, color: '#7A7A7A', marginTop: 2 }}>{sub}</p>
              </button>
            ))}
          </div>
        </div>

        {/* ── Perfil do filho ── */}
        {perfil.idade && (
          <div style={{ background: '#FFFFFF', borderRadius: 'var(--radius-card)', padding: 16, boxShadow: 'var(--shadow-card)', display: 'flex', alignItems: 'center', gap: 12 }}>
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
