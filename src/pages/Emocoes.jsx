import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { emocoes } from '../data/emocoes'

const GRADIENTES = {
  raiva:      'linear-gradient(135deg, #D9503E, #B83D2D)',
  tristeza:   'linear-gradient(135deg, #4A7BB5, #2E5E96)',
  medo:       'linear-gradient(135deg, #7B5EA7, #5D3E87)',
  alegria:    'linear-gradient(135deg, #D4891C, #B06A0E)',
  ansiedade:  'linear-gradient(135deg, #4A9B7F, #2E7A60)',
  frustracao: 'linear-gradient(135deg, #D0724A, #A85432)',
  ciume:      'linear-gradient(135deg, #5E8B6E, #3D6B50)',
  vergonha:   'linear-gradient(135deg, #C4785A, #A05A3D)',
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
          className="flex items-center gap-1.5 text-sm mb-8 hover:opacity-80 transition-opacity"
          style={{ color: 'rgba(255,255,255,0.7)' }}
        >
          ← Emoções
        </button>

        <div className="flex items-end justify-between">
          <div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 4 }}>Ficha completa</p>
            <h1 style={{ fontFamily: "'Lora', serif", fontSize: 30, color: 'white', marginBottom: 8 }}>{nome}</h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 1.5, maxWidth: 240 }}>{descricao}</p>
          </div>
          <span className="ml-4 flex-shrink-0 mb-1" style={{ fontSize: 60 }}>{emoji}</span>
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
                style={{ borderColor: '#4A7C65', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
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
    <div className="min-h-svh pb-28" style={{ background: '#FAF7F2' }}>

      {/* Header */}
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
        <h1 style={{ fontFamily: "'Lora', serif", color: 'white', fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Biblioteca de Emoções</h1>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>Guia completo para reconhecer e acolher</p>
      </div>

      <div style={{ padding: '16px 16px 0' }}>
        <p style={{ fontSize: 11, color: '#7A7A7A', textAlign: 'center', marginBottom: 14 }}>
          Toque em uma emoção para ver a ficha completa
        </p>

        {/* Grid 2×4 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {emocoes.map(emocao => (
            <button
              key={emocao.id}
              onClick={() => onAbrir(emocao)}
              className="text-left transition-all active:scale-95 duration-150"
              style={{
                background: GRADIENTES[emocao.id] || `linear-gradient(135deg, ${emocao.cor}, ${emocao.cor}BB)`,
                borderRadius: 16,
                padding: '14px 12px',
                minHeight: 90,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
              }}
            >
              <span style={{ fontSize: 26, display: 'block', marginBottom: 6 }}>{emocao.emoji}</span>
              <p style={{ fontFamily: "'Lora', serif", color: 'white', fontSize: 14, fontWeight: 600 }}>
                {emocao.nome}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 11, marginTop: 3, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {emocao.descricao}
              </p>
            </button>
          ))}
        </div>

        {/* Rodapé informativo */}
        <div
          className="mt-6 rounded-2xl p-4 flex gap-3 items-start"
          style={{ background: '#EDF4F0' }}
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
