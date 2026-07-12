import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Menu } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { ParticleCanvas } from '@/components/decor/ParticleCanvas'
import Logo from '@/components/Logo'

export function Layout() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  // Close the drawer on route change
  useEffect(() => { setOpen(false) }, [location.pathname])

  return (
    <div className="flex h-screen overflow-hidden">
      <ParticleCanvas />

      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile off-canvas drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative z-10 h-full">
            <Sidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-3 py-2.5 glass border-b border-line z-20 shrink-0">
          <button onClick={() => setOpen(true)} className="p-2 -ml-1 text-text hover:text-accent transition-colors" aria-label="Menu">
            <Menu size={22} />
          </button>
          <Logo size={18} />
          <div className="w-9" />
        </div>

        <main className="holo-grid flex-1 overflow-y-auto scrollbar-thin p-4 md:p-6 z-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
