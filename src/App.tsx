import { useEffect } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { NavInferior } from './components/NavInferior'
import { ProvedorAviso } from './components/Aviso'
import { Inicio } from './pages/Inicio'
import { Situacao } from './pages/Situacao'
import { Orientacao } from './pages/Orientacao'
import { Registro } from './pages/Registro'
import { Preparar } from './pages/Preparar'
import { EditorCombinado } from './pages/EditorCombinado'
import { DetalheCombinado } from './pages/DetalheCombinado'
import { Mostrar } from './pages/Mostrar'
import { Salvos } from './pages/Salvos'
import { Conta } from './pages/Conta'
import { Seguranca } from './pages/Seguranca'
import { ApoioAdulto } from './pages/ApoioAdulto'
import { Entrar } from './pages/Entrar'
import { Documento } from './pages/Documento'
import { DemonstracaoAcesso } from './pages/DemonstracaoAcesso'
import { DemonstracaoNina } from './pages/DemonstracaoNina'
import { RegistrosAnteriores } from './pages/RegistrosAnteriores'
import { privacidade, termos } from './content/documentos'
import { ProvedorConta } from './conta/Conta'
import { Portao } from './conta/Portao'

/* Telas com navegação: espaço no fim para a barra inferior nunca cobrir conteúdo */
function ComNavegacao() {
  return (
    <>
      <div className="pb-[calc(env(safe-area-inset-bottom)+6rem)]">
        <Outlet />
      </div>
      <NavInferior />
    </>
  )
}

/* Cada tela nova começa do topo */
function RolarParaOTopo() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export function Rotas() {
  return (
    <Portao>
    <Routes>
      <Route element={<ComNavegacao />}>
        <Route path="/" element={<Inicio />} />
        <Route path="/preparar" element={<Preparar />} />
        <Route path="/salvos" element={<Salvos />} />
      </Route>
      {/* Fluxos de foco: sem barra inferior, com voltar e fechar sempre visíveis */}
      <Route path="/agora" element={<Situacao />} />
      <Route path="/agora/:situacaoId" element={<Orientacao />} />
      <Route path="/agora/:situacaoId/:caminhoId" element={<Orientacao />} />
      <Route path="/registrar/:situacaoId" element={<Registro />} />
      <Route path="/preparar/novo" element={<EditorCombinado />} />
      <Route path="/preparar/modelo/:modeloId/mostrar" element={<Mostrar />} />
      <Route path="/preparar/:combinadoId" element={<DetalheCombinado />} />
      <Route path="/preparar/:combinadoId/editar" element={<EditorCombinado />} />
      <Route path="/preparar/:combinadoId/mostrar" element={<Mostrar />} />
      <Route path="/conta" element={<Conta />} />
      <Route path="/seguranca" element={<Seguranca />} />
      <Route path="/apoio-adulto" element={<ApoioAdulto />} />
      <Route path="/entrar" element={<Entrar />} />
      <Route path="/termos" element={<Documento doc={termos} />} />
      <Route path="/privacidade" element={<Documento doc={privacidade} />} />
      <Route path="/demonstracao/acesso" element={<DemonstracaoAcesso />} />
      <Route path="/demonstracao/acesso/:tela" element={<DemonstracaoAcesso />} />
      <Route path="/demonstracao/entrar" element={<Entrar simulacao />} />
      <Route path="/demonstracao/nina" element={<DemonstracaoNina />} />
      <Route path="/registros-anteriores" element={<RegistrosAnteriores />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Portao>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ProvedorAviso>
        <ProvedorConta>
          <RolarParaOTopo />
          <div className="coluna">
            <Rotas />
          </div>
        </ProvedorConta>
      </ProvedorAviso>
    </BrowserRouter>
  )
}
