import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const passos = [
  {
    titulo: 'Qual a idade do seu filho?',
    subtitulo: 'Vou personalizar as estratégias para a fase dele.',
    campo: 'idade',
    grid: false,
    opcoes: [
      { valor: '2-3', label: '2 a 3 anos', emoji: '🌱', desc: 'Primeiras birras grandes' },
      { valor: '4-5', label: '4 a 5 anos', emoji: '🌿', desc: 'Emoções mais complexas' },
      { valor: '6-8', label: '6 a 8 anos', emoji: '🌳', desc: 'Autonomia e escola' },
      { valor: 'varios', label: 'Mais de um filho', emoji: '🌲', desc: 'Idades diferentes' },
    ],
  },
  {
    titulo: 'Qual é seu maior desafio?',
    subtitulo: 'Seja honesta — estamos aqui para ajudar, não julgar.',
    campo: 'desafio',
    grid: true,
    opcoes: [
      { valor: 'birras', label: 'Birras e explosões', emoji: '🌪️', desc: 'Choro intenso, gritos' },
      { valor: 'limites', label: 'Limites e não', emoji: '🚧', desc: 'Não aceita um "não"' },
      { valor: 'ansiedade', label: 'Ansiedade e medos', emoji: '🌧️', desc: 'Apego, medos noturnos' },
      { valor: 'irmaos', label: 'Conflito entre irmãos', emoji: '⚡', desc: 'Ciúme, brigas' },
      { valor: 'rotinas', label: 'Rotinas difíceis', emoji: '🌙', desc: 'Sono, alimentação' },
      { valor: 'culpa', label: 'Culpa e autoconfiança', emoji: '💚', desc: 'Me sentir boa mãe' },
    ],
  },
  {
    titulo: 'Como você reage nas crises?',
    subtitulo: 'Sem julgamento. Isso me ajuda a sugerir o que você precisa.',
    campo: 'reacao',
    grid: false,
    opcoes: [
      { valor: 'grito', label: 'Grito ou perco o controle', emoji: '😤', desc: 'Depois fico com culpa' },
      { valor: 'paralisa', label: 'Fico paralisada, sem saber o que fazer', emoji: '😶', desc: 'Me sinto perdida' },
      { valor: 'cedo', label: 'Cedo para evitar o conflito', emoji: '🏳️', desc: 'Ele acaba ganhando mesmo' },
      { valor: 'misto', label: 'Depende do dia — sou inconsistente', emoji: '🎲', desc: 'Me conheço pouco' },
    ],
  },
]

export default function Onboarding() {
  const [passo, setPasso] = useState(0)
  const [respostas, setRespostas] = useState({})
  const navigate = useNavigate()

  const passoAtual = passos[passo]
  const selecionado = respostas[passoAtual.campo]
  const isUltimo = passo === passos.length - 1

  function selecionar(valor) {
    setRespostas(prev => ({ ...prev, [passoAtual.campo]: valor }))
  }

  function avancar() {
    if (!selecionado) return
    if (!isUltimo) {
      setPasso(p => p + 1)
      return
    }
    localStorage.setItem('acalma_perfil', JSON.stringify(respostas))
    localStorage.setItem('acalma_onboarding', 'done')
    navigate('/', { replace: true })
  }

  function voltar() {
    if (passo > 0) setPasso(p => p - 1)
  }

  return (
    <div className="flex flex-col min-h-svh" style={{ background: 'var(--color-verde-50)' }}>

      {/* Topo */}
      <div className="px-6 pt-14 pb-4">
        <div className="flex items-center gap-2 mb-10">
          <span className="text-3xl">🌿</span>
          <span className="font-lora text-xl" style={{ color: 'var(--color-verde)' }}>Acalma</span>
        </div>

        {/* Barra de progresso */}
        <div className="flex gap-2 mb-8">
          {passos.map((_, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full transition-all duration-500 flex-1"
              style={{
                background: i <= passo ? 'var(--color-verde)' : '#D0E5D9',
                opacity: i < passo ? 0.5 : 1,
              }}
            />
          ))}
        </div>

        <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-verde)' }}>
          PASSO {passo + 1} DE {passos.length}
        </p>
        <h2 className="font-lora text-2xl text-gray-800 leading-snug mb-2">
          {passoAtual.titulo}
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          {passoAtual.subtitulo}
        </p>
      </div>

      {/* Opções */}
      <div className="flex-1 px-6 pb-40 overflow-y-auto">
        <div className={passoAtual.grid ? 'grid grid-cols-2 gap-3' : 'flex flex-col gap-3'}>
          {passoAtual.opcoes.map(opcao => {
            const ativo = selecionado === opcao.valor
            return (
              <button
                key={opcao.valor}
                onClick={() => selecionar(opcao.valor)}
                className="text-left transition-all duration-200 active:scale-95"
                style={{
                  background: ativo ? 'white' : 'rgba(255,255,255,0.55)',
                  border: `2px solid ${ativo ? 'var(--color-verde)' : 'transparent'}`,
                  borderRadius: '16px',
                  padding: passoAtual.grid ? '14px 12px' : '14px 16px',
                  boxShadow: ativo ? '0 4px 12px rgba(61,107,85,0.15)' : 'none',
                }}
              >
                {passoAtual.grid ? (
                  /* Layout 2 colunas */
                  <div className="flex flex-col gap-1">
                    <span className="text-2xl">{opcao.emoji}</span>
                    <p
                      className="font-semibold text-sm leading-tight"
                      style={{ color: ativo ? 'var(--color-verde)' : '#374151' }}
                    >
                      {opcao.label}
                    </p>
                    <p className="text-xs text-gray-500 leading-tight">{opcao.desc}</p>
                  </div>
                ) : (
                  /* Layout lista */
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{opcao.emoji}</span>
                    <div className="flex-1">
                      <p
                        className="font-semibold text-sm"
                        style={{ color: ativo ? 'var(--color-verde)' : '#374151' }}
                      >
                        {opcao.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{opcao.desc}</p>
                    </div>
                    {ativo && (
                      <span className="text-base font-bold" style={{ color: 'var(--color-verde)' }}>✓</span>
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Botões fixos no rodapé */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-6 pt-4 pb-8"
        style={{ background: 'linear-gradient(to top, var(--color-verde-50) 80%, transparent)' }}
      >
        <button
          onClick={avancar}
          disabled={!selecionado}
          className="w-full py-4 rounded-2xl text-white font-semibold text-base transition-all active:scale-95"
          style={{
            background: selecionado ? 'var(--color-verde)' : '#C5D5CB',
            boxShadow: selecionado ? '0 4px 16px rgba(61,107,85,0.35)' : 'none',
          }}
        >
          {isUltimo ? 'Começar minha jornada 🌿' : 'Continuar →'}
        </button>

        {passo > 0 && (
          <button
            onClick={voltar}
            className="w-full mt-3 py-2 text-sm text-gray-600 hover:text-gray-700 transition-colors"
          >
            ← Voltar
          </button>
        )}
      </div>
    </div>
  )
}
