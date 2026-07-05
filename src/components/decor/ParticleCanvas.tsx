import { useEffect, useRef } from 'react'

interface Particle {
  x: number; y: number; vx: number; vy: number; size: number
}

interface GlowOrb {
  x: number; y: number; vx: number; vy: number; radius: number
}

const CONFIG = {
  particleColor: '#22e06a',
  lineColor: 'rgba(34, 224, 106, 0.08)',
  particleCount: 60,
  connectionDistance: 150,
  orbCount: 6,
}

export function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let w = 0, h = 0
    const particles: Particle[] = []
    const orbs: GlowOrb[] = []

    function resize() {
      w = window.innerWidth
      h = window.innerHeight
      canvas!.width = w
      canvas!.height = h
    }
    resize()
    window.addEventListener('resize', resize)

    for (let i = 0; i < CONFIG.particleCount; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
      })
    }

    const cornerPositions = [
      { x: 60, y: 60 },
      { x: w - 60, y: 60 },
      { x: 60, y: h - 60 },
      { x: w - 60, y: h - 60 },
    ]

    for (let i = 0; i < CONFIG.orbCount; i++) {
      const pos = i < 4 ? cornerPositions[i] : { x: Math.random() * w, y: Math.random() * h }
      orbs.push({
        x: pos.x,
        y: pos.y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        radius: 200 + Math.random() * 300,
      })
    }

    function draw() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, w, h)

      for (let i = 0; i < orbs.length; i++) {
        const orb = orbs[i]
        orb.x += orb.vx
        orb.y += orb.vy
        if (orb.x < orb.radius) { orb.x = orb.radius; orb.vx = Math.abs(orb.vx) }
        if (orb.x > w - orb.radius) { orb.x = w - orb.radius; orb.vx = -Math.abs(orb.vx) }
        if (orb.y < orb.radius) { orb.y = orb.radius; orb.vy = Math.abs(orb.vy) }
        if (orb.y > h - orb.radius) { orb.y = h - orb.radius; orb.vy = -Math.abs(orb.vy) }

        const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius)
        gradient.addColorStop(0, 'rgba(34, 224, 106, 0.025)')
        gradient.addColorStop(0.4, 'rgba(34, 224, 106, 0.012)')
        gradient.addColorStop(1, 'rgba(34, 224, 106, 0)')

        ctx.beginPath()
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = w
        if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h
        if (p.y > h) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = CONFIG.particleColor
        ctx.fill()
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < CONFIG.connectionDistance) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = CONFIG.lineColor
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }
      }

      animId = requestAnimationFrame(draw)
    }

    animId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}
