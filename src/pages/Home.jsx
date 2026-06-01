import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from '../components/AuthModal'
import PageContainer from '../components/PageContainer'

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

/* ── Título de seção (padrão único de hierarquia) ── */
function TituloSecao({ children, meta }) {
  return (
    <div className="flex items-center justify-between mb-sm">
      <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6B7280' }}>
        {children}
      </p>
      {meta && <span style={{ fontSize: 12, color: '#6B7280' }}>{meta}</span>}
    </div>
  )
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
    <PageContainer style={{ background: '#FAF7F2' }}>
      <div className="flex flex-col">
      {/* ── Header ── */}
      <div
        className="header-verde"
        style={{
          background: 'linear-gradient(160deg, #4A7C65 0%, #2E5540 100%)',
          borderRadius: '0 0 28px 28px',
          paddingTop: 'calc(env(safe-area-inset-top) + 28px)',
          paddingLeft: 20,
          paddingRight: 20,
          paddingBottom: 20,
        }}
      >

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 24 }}>🌿</span>
            <span style={{ fontFamily: "'Lora', serif", color: 'white', fontSize: 18, fontWeight: 600 }}>Acalma</span>
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

        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 4 }}>{saudacao()},</p>
        <h1 style={{ fontFamily: "'Lora', serif", fontSize: 22, fontWeight: 600, color: 'white', lineHeight: 1.3 }}>
          mamãe 💚
        </h1>

        {perfil.desafio && (
          <div style={{
            marginTop: 12,
            display: 'inline-flex',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.14)',
            border: '1px solid rgba(255,255,255,0.22)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            padding: '5px 12px',
            borderRadius: '20px',
          }}>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.88)' }}>Foco: {desafioLabel[perfil.desafio]}</span>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-lg" style={{ padding: '0 16px' }}>

        {/* ── Botão SOS ── */}
        <button
          onClick={() => navigate('/sos')}
          className="sos-pulse active:scale-95 transition-transform duration-150 p-lg"
          style={{
            background: 'linear-gradient(135deg, #D9503E 0%, #B83D2D 100%)',
            borderRadius: 18,
            boxShadow: '0 8px 28px rgba(217,80,62,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'left',
            color: 'white',
          }}
        >
          <div>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>
              SOS · Emergência
            </p>
            <p style={{ fontFamily: "'Lora', serif", fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 2 }}>
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
          <div className="p-md" style={{ background: 'transparent', border: '1px solid #EAE6DF', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 18, opacity: 0.85 }}>☁️</span>
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: 13, fontWeight: 500, color: '#6B7280' }}>Salve seu progresso</p>
              <p style={{ fontSize: 11, color: '#6B7280' }}>Acesse de qualquer dispositivo</p>
            </div>
            <button
              onClick={() => setAuthOpen(true)}
              style={{ fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 8, background: '#EDF4F0', color: '#4A7C65', flexShrink: 0 }}
            >
              Entrar
            </button>
            <button
              onClick={() => {
                setBannerDismissed(true)
                localStorage.setItem('acalma_banner_dismissed', '1')
              }}
              style={{ color: '#D1D5DB', fontSize: 16, lineHeight: 1, flexShrink: 0 }}
            >
              ✕
            </button>
          </div>
        )}

        {/* ── Progresso semanal ── */}
        <div>
          <TituloSecao meta={totalEntradas === 0 ? 'Nenhum registro ainda' : `${totalEntradas} registro${totalEntradas > 1 ? 's' : ''}`}>
            Esta semana
          </TituloSecao>
          <div className="p-md" style={{ background: '#FFFFFF', borderRadius: '14px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
            <div className="flex justify-between">
              {dias.map(({ label, isHoje, isFuturo, temEntrada }) => (
                <div key={label} className="flex flex-col items-center gap-1.5">
                  <span style={{ fontSize: 10, color: '#9CA3AF' }}>{label}</span>
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      fontSize: 12,
                      fontWeight: 500,
                      background: isHoje
                        ? '#4A7C65'
                        : temEntrada
                          ? '#D0E5D9'
                          : '#F3F4F6',
                      color: isHoje ? 'white' : temEntrada ? '#2C5040' : '#D1D5DB',
                      border: isHoje ? '2px solid #2C5040' : '2px solid transparent',
                    }}
                  >
                    {temEntrada ? '✓' : '·'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Dica do dia ── */}
        <div>
          <TituloSecao meta={dica.tag}>Dica de hoje</TituloSecao>
          <div className="p-md" style={{
            background: 'linear-gradient(135deg, #F0F7F3 0%, #E8F2ED 100%)',
            borderRadius: 14,
            borderLeft: '3px solid #4A7C65',
          }}>
            <p style={{ fontFamily: "'Lora', serif", fontStyle: 'italic', fontSize: 13, color: '#2D2D2D', lineHeight: 1.6 }}>
              {dica.texto}
            </p>
          </div>
        </div>

        {/* ── Atalhos rápidos ── */}
        <div>
          <TituloSecao>Explorar</TituloSecao>
          <div className="gap-md" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            {[
              { icon: '💚', label: 'Emoções', sub: '8 fichas completas', rota: '/emocoes' },
              { icon: '🎯', label: 'Limites', sub: '6 scripts práticos', rota: '/limites' },
              { icon: '📔', label: 'Diário', sub: 'Registre episódios', rota: '/diario' },
              { icon: '✨', label: 'Nina', sub: 'Planos e suporte', rota: '/nina' },
            ].map(({ icon, label, sub, rota }) => (
              <button
                key={rota}
                onClick={() => navigate(rota)}
                className="text-left active:scale-95 transition-transform duration-150 p-md"
                style={{
                  background: 'white',
                  borderRadius: 14,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 24, display: 'block', marginBottom: 6 }}>{icon}</span>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#2D2D2D' }}>{label}</p>
                <p style={{ fontSize: '11px', color: '#7A7A7A', marginTop: '4px' }}>{sub}</p>
              </button>
            ))}
          </div>
        </div>

        {/* ── Perfil do filho ── */}
        {perfil.idade && (
          <div className="p-md" style={{ background: 'transparent', border: '1px solid #EAE6DF', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 20, opacity: 0.85 }}>👶</span>
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: 13, fontWeight: 500, color: '#6B7280' }}>Perfil configurado</p>
              <p style={{ fontSize: 11, color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {idadeLabel[perfil.idade]} · {desafioLabel[perfil.desafio] || 'sem desafio'}
              </p>
              {user && (
                <p style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>☁️ {user.email}</p>
              )}
            </div>
            <button
              onClick={() => setAuthOpen(true)}
              style={{ fontSize: 12, color: '#9CA3AF', flexShrink: 0 }}
            >
              {user ? '☁️' : '↗'}
            </button>
          </div>
        )}

      </div>

      {authOpen && <AuthModal onFechar={() => setAuthOpen(false)} />}
      </div>
    </PageContainer>
  )
}
