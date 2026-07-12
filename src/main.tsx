import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { PrivyProvider } from '@privy-io/react-auth'
import { AuthProvider } from '@/contexts/AuthContext'
import { config } from '@/config/wagmi'
import { privyConfig } from '@/config/privy'
import App from './App'
import './index.css'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <PrivyProvider appId={import.meta.env.VITE_PRIVY_APP_ID} config={privyConfig}>
        <QueryClientProvider client={queryClient}>
          <WagmiProvider config={config}>
            <AuthProvider>
              <App />
            </AuthProvider>
          </WagmiProvider>
        </QueryClientProvider>
      </PrivyProvider>
    </BrowserRouter>
  </StrictMode>,
)
