import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function AuthModal({ onFechar }) {
  const { signIn, signOut, user } = useAuth()
  const [email, setEmail]   = useState('')
  const [estado, setEstado] = useState('idle')  // idle | enviando | enviado | erro
  const [erro, setErro]     = useState('')

  async function enviar() {
    if (!email.includes('@')) { setErro('Digite um email válido.'); return }
    setEstado('enviando')
    try {
      await signIn(email)
      setEstado('enviado')
    } catch (e) {
      setErro(e.message || 'Erro ao enviar. Tente novamente.')
      setEstado('erro')
    }
  }

  return (
    <div className="fixed inset-0 z-[70]" style={{ maxWidth: 430, margin: '0 auto' }}>
      <div className="absolute inset-0 bg-black/40" onClick={onFechar} />
      <div
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl px-6 pt-5 pb-10"
        style={{ maxHeight: '85svh', overflowY: 'auto' }}
      >
        <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-6" />

        {/* Usuária já logada */}
        {user ? (
          <div className="flex flex-col items-center text-center py-4 gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: 'var(--color-verde-50)' }}
            >☁️</div>
            <div>
              <p className="font-lora text-lg text-gray-800 mb-1">Progresso salvo</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            <button
              onClick={async () => { await signOut(); onFechar() }}
              className="text-sm text-red-400 py-2 px-4 rounded-xl hover:bg-red-50 transition-colors"
            >
              Sair da conta
            </button>
            <button onClick={onFechar} className="text-sm text-gray-300">Fechar</button>
          </div>

        /* Link enviado */
        ) : estado === 'enviado' ? (
          <div className="flex flex-col items-center text-center py-4 gap-4">
            <span className="text-5xl">✉️</span>
            <div>
              <p className="font-lora text-xl text-gray-800 mb-2">Verifique seu email</p>
              <p className="text-sm text-gray-500 leading-relaxed">
                Enviamos um link de acesso para{' '}
                <strong className="text-gray-700">{email}</strong>.
                <br />Clique no link para entrar e salvar seus dados.
              </p>
            </div>
            <p className="text-xs text-gray-400">Pode fechar esta janela agora.</p>
            <button onClick={onFechar} className="text-sm text-gray-400 py-2">Fechar</button>
          </div>

        /* Formulário de email */
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: 'var(--color-verde-50)' }}
              >☁️</div>
              <div>
                <h3 className="font-lora text-xl text-gray-800 leading-snug">Salve seu progresso</h3>
                <p className="text-xs text-gray-400">Acesse de qualquer dispositivo, sem senha</p>
              </div>
            </div>

            <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 block mb-2">
              Seu email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setErro(''); setEstado('idle') }}
              onKeyDown={e => e.key === 'Enter' && enviar()}
              placeholder="você@email.com"
              autoFocus
              className="w-full bg-gray-50 rounded-xl px-4 py-3.5 text-sm text-gray-700 outline-none border-2 border-transparent focus:border-gray-200 placeholder-gray-300 mb-1"
              style={{ fontFamily: 'var(--font-dm)' }}
            />
            {erro && <p className="text-xs text-red-500 mb-3">{erro}</p>}

            <button
              onClick={enviar}
              disabled={estado === 'enviando'}
              className="w-full py-4 rounded-2xl text-white font-semibold text-sm mt-4 active:scale-95 transition-all"
              style={{
                background: email ? 'var(--color-verde)' : '#C5D5CB',
                boxShadow: email ? '0 4px 16px rgba(61,107,85,0.3)' : 'none',
              }}
            >
              {estado === 'enviando' ? 'Enviando...' : 'Enviar link de acesso ✉️'}
            </button>

            <p className="text-xs text-gray-400 text-center mt-3 leading-relaxed">
              Você receberá um email com um link mágico. Sem senha necessária.
            </p>
            <button onClick={onFechar} className="w-full mt-3 py-2 text-sm text-gray-300">
              Pular por enquanto
            </button>
          </>
        )}
      </div>
    </div>
  )
}
