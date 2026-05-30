import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { emocoes } from '../data/emocoes'

const GRADIENTES = {
  raiva:      'linear-gradient(135deg, #E85D4A, #C94535)',
  tristeza:   'linear-gradient(135deg, #5B8DB8, #3E6F9B)',
  medo:       'linear-gradient(135deg, #8B6FB5, #6B4F95)',
  alegria:    'linear-gradient(135deg, #F5A623, #D4891C)',
  ansiedade:  'linear-gradient(135deg, #8B7BB5, #6B5F95)',
  frustracao: 'linear-gradient(135deg, #E8844A, #C4663A)',
  ciume:      'linear-gradient(135deg, #4A9B7F, #317A62)',
  vergonha:   'linear-gradient(135deg, #C4785A, #A5603D)',
}

/* ── Seção reutilizável ── */
function Secao({ titulo, children }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">{titulo}</p>
      {children}
    </div>
  )
}

/* ────────────────────────────────────────────
   FICHA COMPLETA (overlay full-screen)
──────────────────────────────────────────── */
function Ficha({ emocao, onVoltar }) {
  const navigate = useNavigate()
  const { emoji, nome, cor, descricao, sinais, oque_dizer, oque_nao_dizer, atividades, livros } = emocao

  return (
    <div className="flex flex-col min-h-svh" style={{ background: 'white' }}>

      {/* Hero colorido */}
      <div
        className="px-6 pt-12 pb-8"
        style={{ background: `linear-gradient(155deg, ${cor} 0%, ${cor}BB 100%)` }}
      >
        <button
          onClick={onVoltar}
          className="flex items-center gap-1.5 text-white/70 text-sm mb-8 hover:text-white transition-colors"
        >
          ← Emoções
        </button>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-white/60 text-xs uppercase tracking-widest mb-1">Ficha completa</p>
            <h1 className="font-lora text-3xl text-white mb-2">{nome}</h1>
            <p className="text-white/80 text-sm leading-relaxed max-w-xs">{descricao}</p>
          </div>
          <span className="text-6xl ml-4 flex-shrink-0 mb-1">{emoji}</span>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 px-6 pt-6 pb-28" style={{ background: '#FAFAF8' }}>

        {/* Sinais */}
        <Secao titulo="🔍 Como reconhecer">
          <div className="flex flex-wrap gap-2">
            {sinais.map((s, i) => (
              <span
                key={i}
                className="text-sm px-3 py-1.5 rounded-full font-medium"
                style={{ background: `${cor}18`, color: cor }}
              >
                {s}
              </span>
            ))}
          </div>
        </Secao>

        {/* O que dizer */}
        <Secao titulo="💬 Diga isso">
          <div className="flex flex-col gap-2">
            {oque_dizer.map((frase, i) => (
              <div
                key={i}
                className="bg-white rounded-xl px-4 py-3 border-l-4"
                style={{ borderColor: 'var(--color-verde)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
              >
                <p className="text-sm text-gray-700 leading-relaxed">"{frase}"</p>
              </div>
            ))}
          </div>
        </Secao>

        {/* O que NÃO dizer */}
        <Secao titulo="🚫 Evite dizer">
          <div className="flex flex-col gap-2">
            {oque_nao_dizer.map((frase, i) => (
              <div
                key={i}
                className="bg-white rounded-xl px-4 py-3 border-l-4 border-red-300"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
              >
                <p className="text-sm text-gray-400 italic">"{frase}"</p>
              </div>
            ))}
          </div>
        </Secao>

        {/* Atividades */}
        <Secao titulo="🎨 Atividades que ajudam">
          <div className="flex flex-col gap-2">
            {atividades.map((a, i) => (
              <div key={i} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cor }} />
                <p className="text-sm text-gray-700">{a}</p>
              </div>
            ))}
          </div>
        </Secao>

        {/* Livros */}
        <Secao titulo="📚 Livros indicados">
          <div className="flex flex-col gap-2">
            {livros.map((l, i) => (
              <div key={i} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <span className="text-lg">📖</span>
                <p className="text-sm text-gray-700 font-medium">{l}</p>
              </div>
            ))}
          </div>
        </Secao>

        {/* Atalho SOS */}
        <button
          onClick={() => navigate('/sos')}
          className="w-full py-4 rounded-2xl font-semibold text-sm transition-all active:scale-95 mt-2"
          style={{
            background: `${cor}18`,
            color: cor,
            border: `1.5px solid ${cor}40`,
          }}
        >
          {emoji} Ela está com {nome.toLowerCase()} agora? → Modo SOS
        </button>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────
   LISTA DE EMOÇÕES
──────────────────────────────────────────── */
function Lista({ onAbrir }) {
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
        <h1 className="font-lora text-2xl text-white mb-1">Biblioteca de Emoções</h1>
        <p className="text-white/70 text-sm">Guia completo para reconhecer e acolher</p>
      </div>

      <div className="px-5 mt-5">
        <p className="text-xs text-gray-400 mb-4 text-center">
          Toque em uma emoção para ver a ficha completa
        </p>

        {/* Grid 2×4 */}
        <div className="grid grid-cols-2 gap-3">
          {emocoes.map(emocao => (
            <button
              key={emocao.id}
              onClick={() => onAbrir(emocao)}
              className="text-left rounded-2xl p-4 transition-all active:scale-95 duration-150"
              style={{
                background: GRADIENTES[emocao.id] || `linear-gradient(135deg, ${emocao.cor}, ${emocao.cor}BB)`,
                boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
              }}
            >
              <span className="text-4xl block mb-3">{emocao.emoji}</span>
              <p className="font-lora font-semibold text-base mb-1" style={{ color: 'white' }}>
                {emocao.nome}
              </p>
              <p className="text-xs leading-snug line-clamp-2" style={{ color: 'rgba(255,255,255,0.75)' }}>
                {emocao.descricao}
              </p>
            </button>
          ))}
        </div>

        {/* Rodapé informativo */}
        <div
          className="mt-6 rounded-2xl p-4 flex gap-3 items-start"
          style={{ background: 'var(--color-verde-50)' }}
        >
          <span className="text-xl mt-0.5">💡</span>
          <p className="text-xs text-gray-600 leading-relaxed">
            Cada emoção traz scripts prontos de o que dizer, o que evitar e atividades
            para ajudar na regulação emocional.
          </p>
        </div>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────
   ORQUESTRADOR
──────────────────────────────────────────── */
export default function Emocoes() {
  const [emocaoAberta, setEmocaoAberta] = useState(null)

  return (
    <>
      <Lista onAbrir={setEmocaoAberta} />

      {/* Overlay full-screen — z-[60] para cobrir a NavBar (z-50) */}
      {emocaoAberta && (
        <div className="fixed inset-0 z-[60] overflow-y-auto" style={{ maxWidth: 430, margin: '0 auto' }}>
          <Ficha emocao={emocaoAberta} onVoltar={() => setEmocaoAberta(null)} />
        </div>
      )}
    </>
  )
}
