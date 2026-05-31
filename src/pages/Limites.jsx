import { useState, useEffect } from 'react'
import { scripts, checklistSemanal } from '../data/limites'
import PageContainer from '../components/PageContainer'

/* Chave da semana = segunda-feira da semana atual (YYYY-MM-DD) */
function semanaKey() {
  const d = new Date()
  const seg = new Date(d)
  seg.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return seg.toISOString().split('T')[0]
}

function loadChecklist() {
  try {
    const saved = JSON.parse(localStorage.getItem('acalma_checklist') || '{}')
    return saved.semana === semanaKey() ? (saved.marcados ?? []) : []
  } catch { return [] }
}

const mensagensProgresso = [
  'Olhe para esta lista toda semana. Só fazer isso já é consciência.',
  'Você está começando. Cada passo conta.',
  'Você está no caminho certo. Consistência vem com prática.',
  'Mais da metade — você está crescendo como mãe.',
  'Semana forte! Seus filhos sentem essa presença.',
  'Quase lá. Você está fazendo um trabalho incrível.',
  'Você está fazendo um trabalho incrível.',
  'Semana completa. Isso não é perfeição — é dedicação real. 💚',
]

/* ────────────────────────────────────────────
   ABA SCRIPTS — Accordion
──────────────────────────────────────────── */
function ScriptCard({ item, isOpen, onToggle }) {
  const [copiado, setCopiado] = useState(false)

  function copiar(e) {
    e.stopPropagation()
    navigator.clipboard.writeText(item.script).then(() => {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    })
  }

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden transition-shadow"
      style={{ boxShadow: isOpen ? '0 4px 16px rgba(0,0,0,0.09)' : '0 2px 12px rgba(0,0,0,0.06)' }}
    >
      {/* Cabeçalho clicável */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-4 text-left"
      >
        <span className="text-2xl">{item.emoji}</span>
        <span className="flex-1 font-semibold text-gray-800 text-sm">{item.situacao}</span>
        <span
          className="text-gray-400 text-sm transition-transform duration-300"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          ▼
        </span>
      </button>

      {/* Conteúdo expansível */}
      <div
        style={{
          maxHeight: isOpen ? '600px' : '0',
          overflow: 'hidden',
          transition: 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div className="px-4 pb-5 flex flex-col gap-4 border-t border-gray-100 pt-4">

          {/* Script */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">💬 Script</p>
            <div
              className="rounded-xl p-4 relative"
              style={{ background: '#EDF4F0', border: '1px solid #D0E5D9' }}
            >
              <p className="text-sm text-gray-700 leading-relaxed italic">"{item.script}"</p>
              <button
                onClick={copiar}
                className="mt-3 flex items-center gap-1.5 text-xs font-medium transition-colors"
                style={{ color: copiado ? '#4A7C65' : '#9CA3AF' }}
              >
                {copiado ? '✓ Copiado!' : '📋 Copiar script'}
              </button>
            </div>
          </div>

          {/* Princípio */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">🔑 Princípio</p>
            <div className="flex items-start gap-2 bg-amber-50 rounded-xl px-4 py-3 border border-amber-100">
              <p className="text-sm text-amber-800 font-medium leading-relaxed">{item.principio}</p>
            </div>
          </div>

          {/* Erros comuns */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">⚠️ Evite</p>
            <div className="flex flex-wrap gap-2">
              {item.erros_comuns.map((e, i) => (
                <span
                  key={i}
                  className="text-xs px-3 py-1.5 rounded-full text-red-600"
                  style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}
                >
                  {e}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

function AbaScripts() {
  const [aberto, setAberto] = useState(null)

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-gray-400 text-center mb-1">
        Toque em uma situação para ver o script completo
      </p>
      {scripts.map(item => (
        <ScriptCard
          key={item.id}
          item={item}
          isOpen={aberto === item.id}
          onToggle={() => setAberto(prev => prev === item.id ? null : item.id)}
        />
      ))}

      {/* Dica bottom */}
      <div
        className="rounded-2xl p-4 flex gap-3 mt-2"
        style={{ background: '#EDF4F0' }}
      >
        <span className="text-lg mt-0.5">💡</span>
        <p className="text-xs text-gray-600 leading-relaxed">
          Estes scripts funcionam porque combinam <strong>reconhecimento</strong> com
          <strong> escolha dentro de um limite</strong>. Pratique em voz alta antes de
          precisar.
        </p>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────
   ABA CHECKLIST SEMANAL
──────────────────────────────────────────── */
function AbaChecklist() {
  const [marcados, setMarcados] = useState(loadChecklist)

  useEffect(() => {
    localStorage.setItem('acalma_checklist', JSON.stringify({
      semana: semanaKey(),
      marcados,
    }))
  }, [marcados])

  function toggle(i) {
    setMarcados(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])
  }

  const total = checklistSemanal.length
  const n = marcados.length
  const pct = Math.round((n / total) * 100)
  const msg = mensagensProgresso[n]

  const corBarra = n <= 2 ? '#E07060' : n <= 4 ? '#F0C040' : '#4A7C65'

  return (
    <div className="flex flex-col gap-4">

      {/* Progresso */}
      <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between mb-3">
          <p style={{ fontFamily: "'Lora', serif", fontSize: 16, color: '#2D2D2D' }}>Esta semana</p>
          <span className="font-semibold text-sm" style={{ color: corBarra }}>
            {n} / {total}
          </span>
        </div>

        {/* Barra */}
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: corBarra }}
          />
        </div>

        <p className="text-xs text-gray-500 leading-relaxed italic">"{msg}"</p>
      </div>

      {/* Itens */}
      <div className="flex flex-col gap-2">
        {checklistSemanal.map((item, i) => {
          const ativo = marcados.includes(i)
          return (
            <button
              key={i}
              onClick={() => toggle(i)}
              className="flex items-start gap-3 bg-white rounded-2xl px-4 py-4 text-left transition-all active:scale-95"
              style={{
                border: `1.5px solid ${ativo ? '#4A7C65' : 'transparent'}`,
                boxShadow: ativo ? '0 2px 8px rgba(74,124,101,0.12)' : '0 1px 4px rgba(0,0,0,0.06)',
              }}
            >
              {/* Checkbox customizado */}
              <div
                className="w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5 transition-all duration-200"
                style={{
                  borderColor: ativo ? '#4A7C65' : '#D1D5DB',
                  background: ativo ? '#4A7C65' : 'transparent',
                }}
              >
                {ativo && <span className="text-white text-xs font-bold">✓</span>}
              </div>
              <p
                className="text-sm leading-relaxed transition-colors"
                style={{ color: ativo ? '#2C5040' : '#374151' }}
              >
                {item}
              </p>
            </button>
          )
        })}
      </div>

      {/* Mensagem de conclusão */}
      {n === total && (
        <div
          className="rounded-2xl p-4 text-center"
          style={{ background: '#4A7C65', color: 'white' }}
        >
          <p style={{ fontFamily: "'Lora', serif", fontSize: 18, marginBottom: 4 }}>Semana completa! 🌿</p>
          <p className="text-sm" style={{ opacity: 0.8 }}>
            Guarde esse sentimento. Ele é o combustível da próxima semana.
          </p>
        </div>
      )}

      {/* Limpar */}
      {n > 0 && n < total && (
        <button
          onClick={() => setMarcados([])}
          className="text-xs text-gray-300 text-center py-2 hover:text-gray-400 transition-colors"
        >
          Limpar checklist
        </button>
      )}

    </div>
  )
}

/* ────────────────────────────────────────────
   COMPONENTE PRINCIPAL
──────────────────────────────────────────── */
export default function Limites() {
  const [aba, setAba] = useState('scripts')

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

        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 4 }}>Acalma</p>
        <h1 style={{ fontFamily: "'Lora', serif", color: 'white', fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Guia de Limites</h1>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginBottom: 16 }}>Scripts práticos + reflexão semanal</p>

        {/* Tab switcher dentro do header */}
        <div style={{ background: 'rgba(0,0,0,0.15)', borderRadius: 10, padding: 3, display: 'flex', gap: 2 }}>
          {[
            { id: 'scripts',   label: '📋 Scripts' },
            { id: 'checklist', label: '✅ Checklist' },
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
        {aba === 'scripts' ? <AbaScripts /> : <AbaChecklist />}
      </div>

    </PageContainer>
  )
}
