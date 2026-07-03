import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { GuestRoute } from '@/components/auth/GuestRoute'
import { HeroPage } from '@/pages/HeroPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { AuthCallback } from '@/pages/AuthCallback'
import { OnboardingPage } from '@/pages/OnboardingPage'
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
      <Route path="/" element={<HeroPage />} />

      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route path="/auth/callback" element={<AuthCallback />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route element={<Layout />}>
          <Route path="/atlas" element={<AtlasPage />} />
          <Route path="/quest/:questId" element={<QuestDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/build" element={<BuildPage />} />
          <Route path="/hero/:heroId" element={<HeroProfilePage />} />
          <Route path="/store" element={<StorePage />} />
          <Route path="/market" element={<MarketPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
