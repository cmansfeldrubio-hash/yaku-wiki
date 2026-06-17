import { Routes, Route } from 'react-router-dom'
import { useStats } from './hooks/useStats'

import NavSidebar from './components/layout/NavSidebar'
import HomePage from './pages/HomePage'
import CharactersPage from './pages/CharactersPage'
import CharacterPage from './pages/CharacterPage'
import EventsPage from './pages/EventsPage'
import EventPage from './pages/EventPage'
import LocationsPage from './pages/LocationsPage'
import LocationPage from './pages/LocationPage'
import GlossaryPage from './pages/GlossaryPage'
import GlossaryTermPage from './pages/GlossaryTermPage'
import GalleryPage from './pages/GalleryPage'
import MemesPage from './pages/MemesPage'
import CardsGalleryPage from './pages/CardsGalleryPage'
import CardMakerPage from './pages/CardMakerPage'
import UsersPage from './pages/UsersPage'
import YakumeadasPage from './pages/YakumeadasPage'
import YakumeadaPage from './pages/YakumeadaPage'
import ComicsPage from './pages/ComicsPage'
import ComicReaderPage from './pages/ComicReaderPage'
import NotFoundPage from './pages/NotFoundPage'
import styles from './App.module.css'

export default function App() {
  const { stats } = useStats()

  return (
    <div className={styles.shell}>
      <NavSidebar stats={stats} />
      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/personajes" element={<CharactersPage />} />
          <Route path="/personaje/:slug" element={<CharacterPage />} />
          <Route path="/eventos" element={<EventsPage />} />
          <Route path="/evento/:slug" element={<EventPage />} />
          <Route path="/ubicaciones" element={<LocationsPage />} />
          <Route path="/ubicacion/:slug" element={<LocationPage />} />
          <Route path="/la-palabra" element={<GlossaryPage />} />
          <Route path="/la-palabra/:slug" element={<GlossaryTermPage />} />
          <Route path="/galeria" element={<GalleryPage />} />
          <Route path="/memes" element={<MemesPage />} />
          <Route path="/cards" element={<CardsGalleryPage />} />
          <Route path="/cards/crear" element={<CardMakerPage />} />
          <Route path="/usuarios" element={<UsersPage />} />
          <Route path="/yakumeadas" element={<YakumeadasPage />} />
          <Route path="/yakumeada/:slug" element={<YakumeadaPage />} />
          <Route path="/comics" element={<ComicsPage />} />
          <Route path="/comics/:slug" element={<ComicReaderPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  )
}
