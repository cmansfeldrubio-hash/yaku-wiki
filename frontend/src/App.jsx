import { Routes, Route } from 'react-router-dom'
import { useStats } from './hooks/useStats'

import Header from './components/layout/Header'
import HomePage from './pages/HomePage'
import CharacterPage from './pages/CharacterPage'
import EventsPage from './pages/EventsPage'
import EventPage from './pages/EventPage'
import LocationsPage from './pages/LocationsPage'
import LocationPage from './pages/LocationPage'
import GlossaryPage from './pages/GlossaryPage'
import GlossaryTermPage from './pages/GlossaryTermPage'
import GalleryPage from './pages/GalleryPage'
import UsersPage from './pages/UsersPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  const { stats } = useStats()

  return (
    <div>
      <Header stats={stats} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/personaje/:slug" element={<CharacterPage />} />
        <Route path="/eventos" element={<EventsPage />} />
        <Route path="/evento/:slug" element={<EventPage />} />
        <Route path="/ubicaciones" element={<LocationsPage />} />
        <Route path="/ubicacion/:slug" element={<LocationPage />} />
        <Route path="/la-palabra" element={<GlossaryPage />} />
        <Route path="/la-palabra/:slug" element={<GlossaryTermPage />} />
        <Route path="/galeria" element={<GalleryPage />} />
        <Route path="/usuarios" element={<UsersPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  )
}
