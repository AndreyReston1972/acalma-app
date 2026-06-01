import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { emocoes } from '../data/emocoes'
import PageContainer from '../components/PageContainer'

/* ── Constantes ── */
const ACOES_MAP = {
  espaco: { label: 'Dar espaço',      emoji: '🤲' },
  nomear: { label: 'Nomear a emoção', emoji: '💬' },
  toque:  { label: 'Oferecer toque',  emoji: '🫂' },
  mover:  { label: 'Redirecionar',    emoji: '🏃' },
}
const DIAS_PT   = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado']
const DIAS_CURTO = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

/* ── Utilitários ── */
function carregarRegistros() {
  const todos = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key?.startsWith('acalma_diario_')) continue
    const dataKey = key.replace('acalma_diario_', '')
    try {
      const lista = JSON.parse(localStorage.getItem(key) || '[]')
      if (Array.isArray(lista)) {
        lista.forEach(e => todos.push({ ...e, _chave: key, _dataKey: dataKey }))
      }
    } catch {}
  }
  return todos.sort((a, b) =>
    (b.data || b._dataKey).localeCompare(a.data || a._dataKey)
  )
}

function deletarEntrada(chave, dataISO) {
  const lista = JSON.parse(localStorage.getItem(chave) || '[]')
  const nova = lista.filter(e => e.data !== dataISO)
  if (nova.length === 0) localStorage.removeItem(chave)
  else localStorage.setItem(chave, JSON.stringify(nova))
}

function formatarDataLabel(dataKey) {
  const d = new Date(dataKey + 'T12:00:00')
  const hoje = new Date()
  const ontem = new Date(hoje); ontem.setDate(hoje.getDate() - 1)
  if (d.toDateString() === hoje.toDateString()) return 'Hoje'
  if (d.toDateString() === ontem.toDateString()) return 'Ontem'
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
}

function agruparPorData(registros) {
  const grupos = {}
  registros.forEach(r => {
    if (!grupos[r._dataKey]) grupos[r._dataKey] = []
    grupos[r._dataKey].push(r)
  })
  return Object.entries(grupos).sort(([a], [b]) => b.localeCompare(a))
}

/* ─────────────────────────────────────────────
   MODAL NOVO REGISTRO
───────────────────────────────────────────── */
function ModalNovoRegistro({ onSalvar, onFechar }) {
  const [emocaoId, setEmocaoId] = useState(null)
  const [campos, setCampos] = useState({ antes: '', reacao: '', terminou: '' })

  function salvar() {
    const chave = `acalma_diario_${new Date().toISOString().split('T')[0]}`
    const entrada = { data: new Date().toISOString(), emocaoId, acoes: [], ...campos }
    const lista = JSON.parse(localStorage.getItem(chave) || '[]')
    lista.push(entrada)
    localStorage.setItem(chave, JSON.stringify(lista))
    onSalvar()
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.45)' }}
        onClick={onFechar}
      />
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 bg-white rounded-t-3xl overflow-y-auto"
        style={{ maxHeight: '85svh' }}
      >
        <div className="px-6 pt-5 pb-10">
          {/* Handle */}
          <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-5" />
          <h3 style={{ fontFamily: "'Lora', serif", fontSize: 20, color: '#1F2937', marginBottom: 20 }}>Novo registro</h3>

          {/* Emoção */}
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
            Emoção da criança
          </p>
          <div className="grid grid-cols-4 gap-2 mb-5">
            {emocoes.map(e => (
              <button
                key={e.id}
                onClick={() => setEmocaoId(e.id)}
                className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all"
                style={{
                  border: `2px solid ${emocaoId === e.id ? e.cor : 'transparent'}`,
                  background: emocaoId === e.id ? `${e.cor}14` : '#F9FAFB',
                }}
              >
                <span className="text-2xl">{e.emoji}</span>
                <span className="text-[10px] text-gray-600 text-center leading-tight">{e.nome}</span>
              </button>
            ))}
          </div>

          {/* Campos de texto */}
          {[
            { campo: 'antes',    label: 'O que aconteceu antes?',  placeholder: 'Contexto da crise...' },
            { campo: 'reacao',   label: 'Como você reagiu?',        placeholder: 'Sua reação...' },
            { campo: 'terminou', label: 'Como terminou?',           placeholder: 'Desfecho...' },
          ].map(({ campo, label, placeholder }) => (
            <div key={campo} className="mb-4">
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 block mb-1.5">
                {label}
              </label>
              <textarea
                rows={2}
                value={campos[campo]}
                onChange={e => setCampos(p => ({ ...p, [campo]: e.target.value }))}
                placeholder={placeholder}
                className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none resize-none placeholder-gray-300 border-2 border-transparent focus:border-gray-200"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              />
            </div>
          ))}

          <button
            onClick={salvar}
            className="w-full py-4 rounded-2xl text-white font-semibold text-base active:scale-95 transition-transform"
            style={{
              background: emocaoId ? '#4A7C65' : '#C5D5CB',
              boxShadow: emocaoId ? '0 4px 16px rgba(74,124,101,0.3)' : 'none',
            }}
          >
            Salvar registro
          </button>
        </div>
      </div>
    </>
  )
}

/* ─────────────────────────────────────────────
   CARD DE REGISTRO INDIVIDUAL
───────────────────────────────────────────── */
function CardRegistro({ entrada, onDeletar }) {
  const emocao = emocoes.find(e => e.id === entrada.emocaoId)
  const hora   = entrada.data
    ? new Date(entrada.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : ''

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden"
      style={{
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        borderLeft: emocao ? `4px solid ${emocao.cor}` : '4px solid #E5E7EB',
      }}
    >
      <div className="px-md py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {emocao
              ? <><span className="text-xl">{emocao.emoji}</span>
                  <span className="font-semibold text-sm text-gray-800">{emocao.nome}</span></>
              : <span className="text-sm text-gray-400 italic">Emoção não identificada</span>
            }
          </div>
          <div className="flex items-center gap-3">
            {hora && <span className="text-xs text-gray-400">{hora}</span>}
            <button onClick={onDeletar} className="text-gray-300 hover:text-red-400 transition-colors text-base leading-none">✕</button>
          </div>
        </div>

        {/* Ações usadas */}
        {entrada.acoes?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {entrada.acoes.map(a => ACOES_MAP[a] && (
              <span key={a} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                {ACOES_MAP[a].emoji} {ACOES_MAP[a].label}
              </span>
            ))}
          </div>
        )}

        {/* Texto de antes (preview) */}
        {entrada.antes && (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{entrada.antes}</p>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   ABA REGISTROS
───────────────────────────────────────────── */
function AbaRegistros({ registros, onRecarregar, onNovo }) {
  const navigate = useNavigate()
  const grupos = useMemo(() => agruparPorData(registros), [registros])

  if (registros.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <span className="text-5xl mb-4">🌱</span>
        <h3 style={{ fontFamily: "'Lora', serif", fontSize: 18, color: '#374151', marginBottom: 8 }}>Sem registros ainda</h3>
        <p className="text-sm text-gray-400 leading-relaxed mb-6">
          Quando você usar o Modo SOS, os episódios aparecem aqui automaticamente.
          Ou adicione um registro manualmente.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={() => navigate('/sos')}
            className="py-3 rounded-2xl text-white font-semibold text-sm active:scale-95 transition-transform"
            style={{ background: '#E07060' }}
          >
            🆘 Abrir Modo SOS
          </button>
          <button
            onClick={onNovo}
            className="py-3 rounded-2xl text-sm font-semibold active:scale-95 transition-transform"
            style={{ background: '#EDF4F0', color: '#4A7C65' }}
          >
            + Registro manual
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-lg">
      {grupos.map(([dataKey, entradas]) => (
        <div key={dataKey}>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2 capitalize">
            {formatarDataLabel(dataKey)}
            <span className="ml-2 font-normal normal-case">· {entradas.length} episódio{entradas.length > 1 ? 's' : ''}</span>
          </p>
          <div className="flex flex-col gap-2">
            {entradas.map((entrada, i) => (
              <CardRegistro
                key={entrada.data || i}
                entrada={entrada}
                onDeletar={() => {
                  deletarEntrada(entrada._chave, entrada.data)
                  onRecarregar()
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────
   ABA PADRÕES
───────────────────────────────────────────── */
function Barra({ emoji, label, count, max, cor }) {
  const pct = Math.max((count / max) * 100, 4)
  return (
    <div className="flex items-center gap-3">
      <span className="text-lg w-7 flex-shrink-0">{emoji}</span>
      <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: cor }}
        />
      </div>
      <span className="text-xs text-gray-500 w-4 text-right font-medium">{count}</span>
    </div>
  )
}

function AbaPatterns({ registros }) {
  if (registros.length < 3) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <span className="text-4xl mb-3">📊</span>
        <h3 style={{ fontFamily: "'Lora', serif", fontSize: 18, color: '#374151', marginBottom: 8 }}>Padrões em construção</h3>
        <p className="text-sm text-gray-400 leading-relaxed">
          Continue registrando episódios. Os padrões aparecem após <strong>3 registros</strong>.
          <br/>Você tem {registros.length} até agora.
        </p>
        <div className="mt-4 flex gap-1" aria-hidden="true">
          {[0,1,2].map(i => (
            <div key={i} className="w-3 h-3 rounded-full"
              style={{ background: i < registros.length ? '#4A7C65' : '#E5E7EB' }} />
          ))}
        </div>
      </div>
    )
  }

  /* ── Cálculos ── */
  const emocaoFreq = {}
  const diaFreq    = Array(7).fill(0)
  const acaoFreq   = {}

  registros.forEach(r => {
    if (r.emocaoId) emocaoFreq[r.emocaoId] = (emocaoFreq[r.emocaoId] || 0) + 1

    const d = new Date(r.data || (r._dataKey + 'T12:00:00'))
    diaFreq[d.getDay()]++

    ;(r.acoes || []).forEach(a => { acaoFreq[a] = (acaoFreq[a] || 0) + 1 })
  })

  const emocaoOrdenada = Object.entries(emocaoFreq)
    .sort(([,a],[,b]) => b - a)
    .slice(0, 5)
  const maxEmocao = emocaoOrdenada[0]?.[1] || 1

  const maxDia = Math.max(...diaFreq, 1)

  const acaoOrdenada = Object.entries(acaoFreq)
    .sort(([,a],[,b]) => b - a)
  const maxAcao = acaoOrdenada[0]?.[1] || 1

  /* ── Insights automáticos ── */
  const insights = []
  if (emocaoOrdenada[0]) {
    const e = emocoes.find(x => x.id === emocaoOrdenada[0][0])
    const pct = Math.round((emocaoOrdenada[0][1] / registros.length) * 100)
    if (e) insights.push(`${e.emoji} ${e.nome} aparece em ${pct}% dos episódios registrados`)
  }
  const diaTopIdx = diaFreq.indexOf(maxDia)
  if (diaFreq[diaTopIdx] >= 2) {
    insights.push(`📅 ${DIAS_PT[diaTopIdx]} é o dia com mais episódios registrados`)
  }
  if (acaoOrdenada[0]) {
    const a = ACOES_MAP[acaoOrdenada[0][0]]
    if (a) insights.push(`${a.emoji} "${a.label}" foi sua estratégia mais usada`)
  }
  insights.push(`📝 ${registros.length} episódio${registros.length > 1 ? 's' : ''} registrado${registros.length > 1 ? 's' : ''} no total`)

  return (
    <div className="flex flex-col gap-lg">

      {/* Insights */}
      <div className="bg-white rounded-2xl p-md" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">💡 Insights</p>
        <div className="flex flex-col gap-2.5">
          {insights.map((txt, i) => (
            <p key={i} className="text-sm text-gray-700 leading-relaxed">{txt}</p>
          ))}
        </div>
      </div>

      {/* Emoções mais frequentes */}
      {emocaoOrdenada.length > 0 && (
        <div className="bg-white rounded-2xl p-md" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Emoções mais frequentes
          </p>
          <div className="flex flex-col gap-3">
            {emocaoOrdenada.map(([id, count]) => {
              const e = emocoes.find(x => x.id === id)
              return e ? (
                <Barra key={id} emoji={e.emoji} label={e.nome} count={count} max={maxEmocao} cor={e.cor} />
              ) : null
            })}
          </div>
        </div>
      )}

      {/* Heatmap semanal */}
      <div className="bg-white rounded-2xl p-md" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
          Dias mais desafiadores
        </p>
        <div className="flex justify-between">
          {DIAS_CURTO.map((dia, i) => {
            const count = diaFreq[i]
            const intensity = count === 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : 3
            const cores = ['#F3F4F6','#D0E5D9','#5A8A72','#3D6B55']
            const txtCores = ['#D1D5DB','#5A8A72','white','white']
            return (
              <div key={dia} className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] text-gray-400">{dia}</span>
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-semibold transition-colors"
                  style={{ background: cores[intensity], color: txtCores[intensity] }}
                >
                  {count > 0 ? count : '·'}
                </div>
              </div>
            )
          })}
        </div>
        <p className="text-[10px] text-gray-400 text-center mt-3">
          Número de episódios por dia da semana (total acumulado)
        </p>
      </div>

      {/* Estratégias usadas */}
      {acaoOrdenada.length > 0 && (
        <div className="bg-white rounded-2xl p-md" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Estratégias mais usadas
          </p>
          <div className="flex flex-col gap-3">
            {acaoOrdenada.map(([id, count]) => {
              const a = ACOES_MAP[id]
              return a ? (
                <Barra key={id} emoji={a.emoji} label={a.label} count={count} max={maxAcao} cor="#4A7C65" />
              ) : null
            })}
          </div>
        </div>
      )}

    </div>
  )
}

/* ─────────────────────────────────────────────
   COMPONENTE PRINCIPAL
───────────────────────────────────────────── */
export default function Diario() {
  const [aba, setAba]           = useState('registros')
  const [registros, setRegistros] = useState(() => carregarRegistros())
  const [modalAberto, setModalAberto] = useState(false)

  function recarregar() { setRegistros(carregarRegistros()) }

  return (
    <PageContainer style={{ background: '#FAF7F2' }}>

      {/* Header + Tabs */}
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

        <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase' }}>Acalma</p>
          {aba === 'registros' && (
            <button
              onClick={() => setModalAberto(true)}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.2)',
                padding: '4px 12px',
                borderRadius: 20,
                color: 'rgba(255,255,255,0.9)',
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              + Novo
            </button>
          )}
        </div>

        <h1 style={{ fontFamily: "'Lora', serif", color: 'white', fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Diário de Padrões</h1>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginBottom: 16 }}>
          {registros.length > 0
            ? `${registros.length} episódio${registros.length > 1 ? 's' : ''} registrado${registros.length > 1 ? 's' : ''}`
            : 'Seus registros de crise aparecem aqui'}
        </p>

        {/* Tab switcher dentro do header */}
        <div style={{ background: 'rgba(0,0,0,0.15)', borderRadius: 10, padding: 3, display: 'flex', gap: 2 }}>
          {[
            { id: 'registros', label: '📋 Registros' },
            { id: 'padroes',   label: '📊 Padrões' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setAba(tab.id)}
              className="flex-1 transition-all duration-200"
              style={{
                padding: '8px 0',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: aba === tab.id ? 600 : 400,
                background: aba === tab.id ? 'white' : 'transparent',
                color: aba === tab.id ? '#2D2D2D' : 'rgba(255,255,255,0.7)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo */}
      <div style={{ padding: '16px 16px 0' }}>
        {aba === 'registros'
          ? <AbaRegistros registros={registros} onRecarregar={recarregar} onNovo={() => setModalAberto(true)} />
          : <AbaPatterns registros={registros} />
        }
      </div>

      {/* Modal novo registro */}
      {modalAberto && (
        <ModalNovoRegistro
          onSalvar={() => { recarregar(); setModalAberto(false) }}
          onFechar={() => setModalAberto(false)}
        />
      )}

    </PageContainer>
  )
}
