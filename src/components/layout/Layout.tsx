import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { ParticleCanvas } from '@/components/decor/ParticleCanvas'

export function Layout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <ParticleCanvas />
      <Sidebar />
      <main className="holo-grid flex-1 overflow-y-auto scrollbar-thin p-6 z-10">
        <Outlet />
      </main>
    </div>
  )
}
