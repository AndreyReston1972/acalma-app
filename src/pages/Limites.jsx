import { useState, useEffect } from 'react'
import { scripts, checklistSemanal } from '../data/limites'

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
              style={{ background: 'var(--color-verde-50)', border: '1px solid var(--color-verde-100)' }}
            >
              <p className="text-sm text-gray-700 leading-relaxed italic">"{item.script}"</p>
              <button
                onClick={copiar}
                className="mt-3 flex items-center gap-1.5 text-xs font-medium transition-colors"
                style={{ color: copiado ? 'var(--color-verde)' : '#9CA3AF' }}
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
        style={{ background: 'var(--color-verde-50)' }}
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

  const corBarra = n <= 2 ? '#E07060' : n <= 4 ? '#F0C040' : '#3D6B55'

  return (
    <div className="flex flex-col gap-4">

      {/* Progresso */}
      <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between mb-3">
          <p className="font-lora text-base text-gray-800">Esta semana</p>
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
                border: `1.5px solid ${ativo ? 'var(--color-verde)' : 'transparent'}`,
                boxShadow: ativo ? '0 2px 8px rgba(61,107,85,0.12)' : '0 1px 4px rgba(0,0,0,0.06)',
              }}
            >
              {/* Checkbox customizado */}
              <div
                className="w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5 transition-all duration-200"
                style={{
                  borderColor: ativo ? 'var(--color-verde)' : '#D1D5DB',
                  background: ativo ? 'var(--color-verde)' : 'transparent',
                }}
              >
                {ativo && <span className="text-white text-xs font-bold">✓</span>}
              </div>
              <p
                className="text-sm leading-relaxed transition-colors"
                style={{ color: ativo ? 'var(--color-verde-dark)' : '#374151' }}
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
          style={{ background: 'var(--color-verde)', color: 'white' }}
        >
          <p className="font-lora text-lg mb-1">Semana completa! 🌿</p>
          <p className="text-sm opacity-80">
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
    <div className="min-h-svh pb-28" style={{ background: 'var(--color-areia)' }}>

      {/* Header */}
      <div
        className="px-6 pb-6"
        style={{
          background: 'linear-gradient(160deg, #4A7C65 0%, #3A6855 100%)',
          borderRadius: '0 0 28px 28px',
          paddingTop: 'calc(env(safe-area-inset-top) + 16px)',
        }}
      >
        <p className="text-white/60 text-xs uppercase tracking-widest mb-1">Acalma</p>
        <h1 className="font-lora text-2xl text-white mb-1">Guia de Limites</h1>
        <p className="text-white/70 text-sm">Scripts práticos + reflexão semanal</p>
      </div>

      {/* Tab switcher */}
      <div className="px-5 mt-5 mb-4">
        <div className="flex bg-white rounded-xl p-1 gap-1" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          {[
            { id: 'scripts',    label: '📋 Scripts' },
            { id: 'checklist',  label: '✅ Checklist' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setAba(tab.id)}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                background: aba === tab.id ? 'var(--color-verde)' : 'transparent',
                color: aba === tab.id ? 'white' : '#9CA3AF',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="px-5">
        {aba === 'scripts' ? <AbaScripts /> : <AbaChecklist />}
      </div>

    </div>
  )
}
