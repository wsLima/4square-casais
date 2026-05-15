import { Routes, Route, Navigate } from 'react-router-dom'
import HostPage from './pages/HostPage'
import CasaisPage from './pages/CasaisPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/host" replace />} />
      <Route path="/host" element={<HostPage />} />
      <Route path="/casais" element={<CasaisPage />} />
    </Routes>
  )
}
