import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { GuestRoute } from '@/components/auth/GuestRoute'
import { LandingPage } from '@/pages/HeroPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { AuthCallback } from '@/pages/AuthCallback'
import { OnboardingPage } from '@/pages/OnboardingPage'
import { TemplePage } from '@/pages/TemplePage'
import { QuestDetailPage } from '@/pages/QuestDetailPage'
import { OraclePage } from '@/pages/ProfilePage'
import { BuildPage } from '@/pages/BuildPage'
import { HeroPage } from '@/pages/HeroProfilePage'
import { StorePage } from '@/pages/StorePage'
import { WalletPage } from '@/pages/WalletPage'
import { MarketPage } from '@/pages/MarketPage'
import { AdminPage } from '@/pages/AdminPage'
import { AccountPage } from '@/pages/AccountPage'

// On the shop subdomain, land straight on the (public) store.
function RootRoute() {
  if (typeof window !== 'undefined' && window.location.hostname === 'shop.meycult.com') {
    return <Navigate to="/store" replace />
  }
  return <LandingPage />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRoute />} />

      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Public — browsable without logging in (the Shop) */}
      <Route element={<Layout />}>
        <Route path="/store" element={<StorePage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route element={<Layout />}>
          <Route path="/quests" element={<TemplePage />} />
          <Route path="/quest/:questId" element={<QuestDetailPage />} />
          <Route path="/profile" element={<OraclePage />} />
          <Route path="/build" element={<BuildPage />} />
          <Route path="/hero/:heroId" element={<HeroPage />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/market" element={<MarketPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
