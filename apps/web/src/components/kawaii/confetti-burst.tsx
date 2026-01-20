import * as React from 'react'
import { cn } from '@/lib/utils'

interface ConfettiParticle {
  id: number
  color: string
  x: number
  y: number
  tx: number
  ty: number
  rotation: number
}

interface ConfettiBurstProps {
  trigger?: boolean
  onComplete?: () => void
  className?: string
}

const colors = [
  'oklch(0.75 0.22 330)',
  'oklch(0.85 0.15 280)',
  'oklch(0.88 0.25 140)',
  'oklch(0.90 0.20 90)',
  'oklch(0.88 0.12 180)',
]

export const ConfettiBurst = React.memo(function ConfettiBurst({
  trigger,
  onComplete,
  className,
}: ConfettiBurstProps) {
  const [particles, setParticles] = React.useState<ConfettiParticle[]>([])

  React.useEffect(() => {
    if (trigger) {
      const newParticles: ConfettiParticle[] = Array.from({ length: 20 }, (_, i) => ({
        id: Date.now() + i,
        color: colors[Math.floor(Math.random() * colors.length)],
        x: 50,
        y: 50,
        tx: (Math.random() - 0.5) * 200,
        ty: (Math.random() - 0.5) * 200,
        rotation: Math.random() * 360,
      }))

      setParticles(newParticles)

      const timer = setTimeout(() => {
        setParticles([])
        onComplete?.()
      }, 800)

      return () => clearTimeout(timer)
    }
  }, [trigger, onComplete])

  if (particles.length === 0) {
    return null
  }

  return (
    <div className={cn('fixed inset-0 pointer-events-none z-50', className)}>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-confetti-burst"
          style={
            {
              '--tx': `${particle.tx}px`,
              '--ty': `${particle.ty}px`,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              backgroundColor: particle.color,
              width: '8px',
              height: '8px',
              borderRadius: '2px',
              transform: `rotate(${particle.rotation}deg)`,
            } as React.CSSProperties
          }
          aria-hidden="true"
        />
      ))}
    </div>
  )
})
