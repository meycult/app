import { Routes, Route } from 'react-router-dom'

function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-text-muted text-lg">{title}</p>
    </div>
  )
}

export default function App() {
  return (
    <div className="flex h-screen overflow-hidden">
      <main className="flex-1 overflow-y-auto scrollbar-thin p-6">
        <Routes>
          <Route path="/" element={<Placeholder title="Atlas" />} />
          <Route path="/quest/:questId" element={<Placeholder title="Quest Detail" />} />
          <Route path="/profile" element={<Placeholder title="Profile" />} />
          <Route path="/build" element={<Placeholder title="Build" />} />
          <Route path="/hero/:heroId" element={<Placeholder title="Hero Profile" />} />
          <Route path="/store" element={<Placeholder title="Store" />} />
          <Route path="/market" element={<Placeholder title="Market" />} />
          <Route path="/admin" element={<Placeholder title="Admin" />} />
        </Routes>
      </main>
    </div>
  )
}
