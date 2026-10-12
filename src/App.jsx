import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import NavBar from './components/NavBar'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import SOS from './pages/SOS'
import Emocoes from './pages/Emocoes'
import Limites from './pages/Limites'
import Diario from './pages/Diario'

function OnboardingGuard() {
  const done = localStorage.getItem('acalma_onboarding')
  return done ? <Navigate to="/" replace /> : <Onboarding />
}

function HomeGuard() {
  const done = localStorage.getItem('acalma_onboarding')
  return done ? <Home /> : <Navigate to="/onboarding" replace />
}

function AppLayout() {
  return (
    <>
      <Outlet />
      <NavBar />
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/onboarding" element={<OnboardingGuard />} />
        <Route path="/sos" element={<SOS />} />
        {/* Oferta antiga da Nina retirada; links salvos voltam ao início */}
        <Route path="/nina" element={<Navigate to="/" replace />} />
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomeGuard />} />
          <Route path="/emocoes" element={<Emocoes />} />
          <Route path="/limites" element={<Limites />} />
          <Route path="/diario" element={<Diario />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  )
}
