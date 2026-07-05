import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { GuestRoute } from '@/components/auth/GuestRoute'
import { LandingPage } from '@/pages/HeroPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { AuthCallback } from '@/pages/AuthCallback'
import { OnboardingPage } from '@/pages/OnboardingPage'
import { NetworkPage } from '@/pages/AtlasPage'
import { QuestDetailPage } from '@/pages/QuestDetailPage'
import { OraclePage } from '@/pages/ProfilePage'
import { BuildPage } from '@/pages/BuildPage'
import { HeroPage } from '@/pages/HeroProfilePage'
import { StorePage } from '@/pages/StorePage'
import { MarketPage } from '@/pages/MarketPage'
import { AdminPage } from '@/pages/AdminPage'
import { AccountPage } from '@/pages/AccountPage'
import { ComingSoonPage } from '@/pages/ComingSoonPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route path="/auth/callback" element={<AuthCallback />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/coming-soon" element={<ComingSoonPage />} />
        <Route element={<Layout />}>
          <Route path="/network" element={<NetworkPage />} />
          <Route path="/quest/:questId" element={<QuestDetailPage />} />
          <Route path="/profile" element={<OraclePage />} />
          <Route path="/build" element={<BuildPage />} />
          <Route path="/hero/:heroId" element={<HeroPage />} />
          <Route path="/store" element={<StorePage />} />
          <Route path="/market" element={<MarketPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
