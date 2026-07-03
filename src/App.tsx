import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { AtlasPage } from '@/pages/AtlasPage'
import { QuestDetailPage } from '@/pages/QuestDetailPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { BuildPage } from '@/pages/BuildPage'
import { HeroProfilePage } from '@/pages/HeroProfilePage'
import { StorePage } from '@/pages/StorePage'
import { MarketPage } from '@/pages/MarketPage'
import { AdminPage } from '@/pages/AdminPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<AtlasPage />} />
        <Route path="/quest/:questId" element={<QuestDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/build" element={<BuildPage />} />
        <Route path="/hero/:heroId" element={<HeroProfilePage />} />
        <Route path="/store" element={<StorePage />} />
        <Route path="/market" element={<MarketPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Route>
    </Routes>
  )
}
