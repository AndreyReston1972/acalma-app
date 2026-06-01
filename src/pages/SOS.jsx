import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { emocoes } from '../data/emocoes'
import TituloSecao from '../components/TituloSecao'

const ACOES = [
  { id: 'espaco',  label: 'Dar espaço',      desc: 'Fique perto sem falar. Presença sem pressão.',              emoji: '🤲' },
  { id: 'nomear',  label: 'Nomear a emoção',  desc: '"Você parece [emoção]. Faz sentido você sentir isso."',    emoji: '💬' },
  { id: 'toque',   label: 'Oferecer toque',   desc: 'Abra os braços. Deixa ela escolher se quer o abraço.',     emoji: '🫂' },
  { id: 'mover',   label: 'Redirecionar',     desc: 'Propõe algo físico: pular, correr, apertar uma almofada.', emoji: '🏃' },
]

function salvarNoDiario({ emocaoId, acoes, registro }) {
  const chave = `acalma_diario_${new Date().toISOString().split('T')[0]}`
  const entrada = { data: new Date().toISOString(), emocaoId, acoes, ...registro }
  const lista = JSON.parse(localStorage.getItem(chave) || '[]')
  lista.push(entrada)
  localStorage.setItem(chave, JSON.stringify(lista))
}

/* ────────────────────────────────────────────
   TELA 1 — Respira (30 s com guia visual)
──────────────────────────────────────────── */
function Respira({ onAvancar, onSair }) {
  const [timer, setTimer] = useState(30)

  useEffect(() => {
    if (timer === 0) return
    const id = setTimeout(() => setTimer(t => t - 1), 1000)
    return () => clearTimeout(id)
  }, [timer])

  const elapsed = 30 - timer
  const ciclo   = elapsed % 14
  const fase    = ciclo < 4 ? 0 : ciclo < 8 ? 1 : 2
  const faseTxt = ['Inspire...', 'Segure...', 'Expire devagar...']
  const scale   = fase === 0 ? 1 + (ciclo / 4) * 0.38
               : fase === 1 ? 1.38
               : 1.38 - ((ciclo - 8) / 6) * 0.38

  const progresso = ((30 - timer) / 30) * 100

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-between px-6 pb-10"
      style={{
        background: 'linear-gradient(180deg, #2C5040 0%, #1A3020 100%)',
        paddingTop: 'calc(env(safe-area-inset-top) + 56px)',
      }}
    >
      {/* Fechar */}
      <button
        onClick={onSair}
        className="absolute right-6 text-white/80 text-2xl leading-none"
        style={{ top: 'calc(env(safe-area-inset-top) + 48px)' }}
      >✕</button>

      {/* Cabeçalho */}
      <div className="text-center">
        <p className="text-white/70 text-xs uppercase tracking-widest mb-2">Passo 1 de 4</p>
        <h2 className="font-lora text-2xl text-white mb-1">Respira primeiro</h2>
        <p className="text-white/70 text-sm">Você só pode acalmar ela se estiver regulada.</p>
      </div>

      {/* Círculo de respiração */}
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-52 h-52 flex items-center justify-center">
          {/* Anéis estáticos de fundo */}
          <div className="absolute inset-0 rounded-full border border-white/8" />
          <div className="absolute inset-4 rounded-full border border-white/10" />

          {/* Círculo animado */}
          <div
            className="w-36 h-36 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1.5px solid rgba(255,255,255,0.25)',
              transform: `scale(${scale})`,
              transition: 'transform 1s ease-in-out',
              boxShadow: '0 0 60px rgba(90,138,114,0.25)',
            }}
          >
            <span className="text-4xl select-none">🌿</span>
          </div>
        </div>

        <div className="text-center">
          <p className="font-lora text-xl text-white mb-1">{faseTxt[fase]}</p>
          <p className="text-white/55 text-xs">4s · 4s · 6s</p>
        </div>

        {/* Timer circular */}
        <div className="flex items-center gap-2">
          <div
            className="w-10 h-10 rounded-full border-2 border-white/20 flex items-center justify-center"
            style={{ borderTopColor: timer === 0 ? '#5A8A72' : 'rgba(255,255,255,0.6)' }}
          >
            <span className="text-white text-sm font-mono">{timer}</span>
          </div>
          {timer === 0 && <span className="text-green-400 text-sm">✓ Pronta</span>}
        </div>
      </div>

      {/* Barra de progresso + botão */}
      <div className="w-full">
        <div className="w-full h-1 rounded-full bg-white/10 mb-6 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${progresso}%`, background: 'rgba(90,138,114,0.8)' }}
          />
        </div>
        <button
          onClick={onAvancar}
          className="w-full py-4 rounded-2xl font-semibold text-base transition-all active:scale-95"
          style={{
            background: timer === 0 ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.12)',
            color: timer === 0 ? '#2C5040' : 'rgba(255,255,255,0.7)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          {timer === 0 ? 'Estou regulada ✓' : 'Pular este passo →'}
        </button>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────
   TELA 2 — Identifica a emoção
──────────────────────────────────────────── */
function Identifica({ emocaoId, onSelecionar, onAvancar, onVoltar }) {
  const emocaoAtual = emocoes.find(e => e.id === emocaoId)

  return (
    <div className="min-h-svh flex flex-col" style={{ background: 'var(--color-areia)' }}>

      {/* Header */}
      <div className="px-6 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onVoltar} className="text-gray-400 text-lg">←</button>
          <div className="flex-1 flex gap-1.5">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-1 flex-1 rounded-full"
                style={{ background: i <= 2 ? 'var(--color-verde)' : '#D0E5D9' }} />
            ))}
          </div>
          <span className="text-xs text-gray-500">2 / 4</span>
        </div>
        <h2 className="font-lora text-xl text-gray-800 mb-1">Qual emoção você vê nela?</h2>
        <p className="text-sm text-gray-500">Toque para identificar o que está acontecendo.</p>
      </div>

      {/* Grid de emoções */}
      <div className="px-6 grid grid-cols-2 gap-3 pb-4">
        {emocoes.map(e => (
          <button
            key={e.id}
            onClick={() => onSelecionar(e.id)}
            className="text-left rounded-2xl p-3 transition-all active:scale-95"
            style={{
              background: emocaoId === e.id ? 'white' : 'rgba(255,255,255,0.6)',
              border: `2px solid ${emocaoId === e.id ? e.cor : 'transparent'}`,
              boxShadow: emocaoId === e.id ? `0 4px 12px ${e.cor}30` : 'none',
            }}
          >
            <span className="text-2xl block mb-1">{e.emoji}</span>
            <p className="font-semibold text-sm text-gray-700">{e.nome}</p>
          </button>
        ))}
      </div>

      {/* Dica contextual */}
      {emocaoAtual && (
        <div className="mx-6 mb-4 p-3 rounded-xl" style={{ background: `${emocaoAtual.cor}15`, border: `1px solid ${emocaoAtual.cor}30` }}>
          <p className="text-xs text-gray-600 leading-relaxed">
            <span className="font-semibold">Sinais:</span> {emocaoAtual.sinais.join(' · ')}
          </p>
        </div>
      )}

      {/* Botão */}
      <div className="px-6 pb-10 mt-auto">
        <button
          onClick={onAvancar}
          disabled={!emocaoId}
          className="w-full py-4 rounded-2xl text-white font-semibold text-base transition-all active:scale-95"
          style={{
            background: emocaoId ? 'var(--color-verde)' : '#C5D5CB',
            boxShadow: emocaoId ? '0 4px 16px rgba(61,107,85,0.3)' : 'none',
          }}
        >
          Continuar →
        </button>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────
   TELA 3 — Protocolo de resposta
──────────────────────────────────────────── */
function Protocolo({ emocaoId, acoes, onToggleAcao, onAvancar, onVoltar }) {
  const emocao = emocoes.find(e => e.id === emocaoId)

  return (
    <div className="min-h-svh flex flex-col" style={{ background: 'var(--color-areia)' }}>

      {/* Header */}
      <div className="px-6 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onVoltar} className="text-gray-400 text-lg">←</button>
          <div className="flex-1 flex gap-1.5">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-1 flex-1 rounded-full"
                style={{ background: i <= 3 ? 'var(--color-verde)' : '#D0E5D9' }} />
            ))}
          </div>
          <span className="text-xs text-gray-500">3 / 4</span>
        </div>

        {emocao && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">{emocao.emoji}</span>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Emoção identificada</p>
              <h2 className="font-lora text-xl text-gray-800">{emocao.nome}</h2>
            </div>
          </div>
        )}
      </div>

      <div className="px-6 pb-32 flex flex-col gap-5 overflow-y-auto">

        {/* O que dizer */}
        {emocao && (
          <div>
            <TituloSecao>💬 Diga isso agora</TituloSecao>
            <div className="flex flex-col gap-2">
              {emocao.oque_dizer.map((frase, i) => (
                <div key={i} className="bg-white rounded-xl px-4 py-3 border-l-4"
                  style={{ borderColor: 'var(--color-verde)' }}>
                  <p className="text-sm text-gray-700 italic">"{frase}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* O que NÃO dizer */}
        {emocao && (
          <div>
            <TituloSecao>🚫 Evite dizer</TituloSecao>
            <div className="flex flex-col gap-2">
              {emocao.oque_nao_dizer.slice(0, 2).map((frase, i) => (
                <div key={i} className="bg-white rounded-xl px-4 py-3 border-l-4 border-red-300">
                  <p className="text-sm text-gray-500 line-through italic">"{frase}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ações práticas */}
        <div>
          <TituloSecao>🎯 Ação — marque o que vai fazer</TituloSecao>
          <div className="flex flex-col gap-2">
            {ACOES.map(acao => {
              const ativo = acoes.includes(acao.id)
              return (
                <button
                  key={acao.id}
                  onClick={() => onToggleAcao(acao.id)}
                  className="flex items-start gap-3 bg-white rounded-xl p-4 text-left transition-all active:scale-95"
                  style={{
                    border: `2px solid ${ativo ? 'var(--color-verde)' : 'transparent'}`,
                    boxShadow: ativo ? '0 2px 8px rgba(61,107,85,0.15)' : 'none',
                  }}
                >
                  <div
                    className="w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5 transition-all"
                    style={{
                      borderColor: ativo ? 'var(--color-verde)' : '#D1D5DB',
                      background: ativo ? 'var(--color-verde)' : 'transparent',
                    }}
                  >
                    {ativo && <span className="text-white text-xs font-bold">✓</span>}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-700">{acao.emoji} {acao.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{acao.desc}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Botão fixo */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-6 pb-8 pt-4"
        style={{ background: 'linear-gradient(to top, var(--color-areia) 80%, transparent)' }}>
        <button
          onClick={onAvancar}
          className="w-full py-4 rounded-2xl text-white font-semibold text-base transition-all active:scale-95"
          style={{ background: 'var(--color-verde)', boxShadow: '0 4px 16px rgba(61,107,85,0.3)' }}
        >
          Registrar este episódio →
        </button>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────
   TELA 4 — Registra
──────────────────────────────────────────── */
function Registra({ registro, onMudar, onSalvar, onPular, onVoltar }) {
  return (
    <div className="min-h-svh flex flex-col" style={{ background: 'var(--color-areia)' }}>

      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onVoltar} className="text-gray-400 text-lg">←</button>
          <div className="flex-1 flex gap-1.5">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-1 flex-1 rounded-full" style={{ background: 'var(--color-verde)' }} />
            ))}
          </div>
          <span className="text-xs text-gray-500">4 / 4</span>
        </div>
        <h2 className="font-lora text-xl text-gray-800 mb-1">Registra o que aconteceu</h2>
        <p className="text-sm text-gray-500">Padrões só aparecem com registros. Leva 1 minuto.</p>
      </div>

      <div className="px-6 flex flex-col gap-4 pb-36">
        {[
          { campo: 'antes',    label: 'O que aconteceu antes da crise?', placeholder: 'Ex: ela estava com fome, chegamos do passeio cansadas...' },
          { campo: 'reacao',   label: 'Como você reagiu?',               placeholder: 'Ex: gritei, respirei, saí da sala...' },
          { campo: 'terminou', label: 'Como terminou?',                  placeholder: 'Ex: ela acalmou depois de 10 min, dormiu...' },
        ].map(({ campo, label, placeholder }) => (
          <div key={campo}>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
              {label}
            </label>
            <textarea
              rows={3}
              value={registro[campo]}
              onChange={e => onMudar(campo, e.target.value)}
              placeholder={placeholder}
              className="w-full bg-white rounded-xl px-4 py-3 text-sm text-gray-700 border-2 border-transparent focus:border-verde-100 outline-none resize-none placeholder-gray-300 leading-relaxed"
              style={{ fontFamily: 'var(--font-dm)' }}
            />
          </div>
        ))}
      </div>

      {/* Botões fixos */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-6 pb-8 pt-4"
        style={{ background: 'linear-gradient(to top, var(--color-areia) 80%, transparent)' }}>
        <button
          onClick={onSalvar}
          className="w-full py-4 rounded-2xl text-white font-semibold text-base transition-all active:scale-95 mb-2"
          style={{ background: 'var(--color-verde)', boxShadow: '0 4px 16px rgba(61,107,85,0.3)' }}
        >
          Salvar registro 📔
        </button>
        <button onClick={onPular} className="w-full py-2 text-sm text-gray-600">
          Pular registro
        </button>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────
   TELA FINAL — Você conseguiu
──────────────────────────────────────────── */
function Sucesso({ emocaoId, navigate }) {
  const emocao = emocoes.find(e => e.id === emocaoId)

  const frases = [
    'Você passou por mais uma. Isso tem peso e importância.',
    'Consciência é o primeiro passo. Você está no caminho certo.',
    'Cada crise enfrentada com intenção é crescimento — seu e dela.',
    'Presença consciente não é perfeição. É tentar, mesmo difícil.',
  ]
  const frase = frases[Math.floor(Math.random() * frases.length)]

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-between px-6 pt-20 pb-12 text-center"
      style={{ background: 'linear-gradient(180deg, #3D6B55 0%, #2C5040 100%)' }}
    >
      <div />

      <div className="flex flex-col items-center gap-6">
        {/* Ícone de conclusão */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.3)' }}
        >
          <span className="text-4xl">✓</span>
        </div>

        <div>
          <h2 className="font-lora text-2xl text-white mb-3">Você conseguiu.</h2>
          <p className="text-white/70 text-sm leading-relaxed max-w-xs mx-auto">{frase}</p>
        </div>

        {emocao && (
          <div
            className="px-4 py-2 rounded-full text-sm"
            style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)' }}
          >
            {emocao.emoji} Emoção identificada: <strong>{emocao.nome}</strong>
          </div>
        )}
      </div>

      <div className="w-full flex flex-col gap-3">
        <button
          onClick={() => navigate('/')}
          className="w-full py-4 rounded-2xl font-semibold text-base transition-all active:scale-95"
          style={{ background: 'rgba(255,255,255,0.95)', color: '#2C5040' }}
        >
          Voltar ao início
        </button>
        <button
          onClick={() => navigate('/diario')}
          className="w-full py-3 text-sm"
          style={{ color: 'rgba(255,255,255,0.8)' }}
        >
          Ver meu diário →
        </button>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────
   ORQUESTRADOR PRINCIPAL
──────────────────────────────────────────── */
export default function SOS() {
  const navigate = useNavigate()
  const [passo, setPasso]   = useState(1)
  const [emocaoId, setEmocaoId] = useState(null)
  const [acoes, setAcoes]   = useState([])
  const [registro, setRegistro] = useState({ antes: '', reacao: '', terminou: '' })
  const [concluido, setConcluido] = useState(false)

  function toggleAcao(id) {
    setAcoes(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id])
  }

  function mudarRegistro(campo, valor) {
    setRegistro(prev => ({ ...prev, [campo]: valor }))
  }

  function salvarEConcluir() {
    salvarNoDiario({ emocaoId, acoes, registro })
    setConcluido(true)
  }

  if (concluido) return <Sucesso emocaoId={emocaoId} navigate={navigate} />

  if (passo === 1) return (
    <Respira
      onAvancar={() => setPasso(2)}
      onSair={() => navigate(-1)}
    />
  )

  if (passo === 2) return (
    <Identifica
      emocaoId={emocaoId}
      onSelecionar={setEmocaoId}
      onAvancar={() => setPasso(3)}
      onVoltar={() => setPasso(1)}
    />
  )

  if (passo === 3) return (
    <Protocolo
      emocaoId={emocaoId}
      acoes={acoes}
      onToggleAcao={toggleAcao}
      onAvancar={() => setPasso(4)}
      onVoltar={() => setPasso(2)}
    />
  )

  return (
    <Registra
      registro={registro}
      onMudar={mudarRegistro}
      onSalvar={salvarEConcluir}
      onPular={() => setConcluido(true)}
      onVoltar={() => setPasso(3)}
    />
  )
}
