import { useRef, useMemo } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import Heart from './Heart'

const HEART_COUNT = 16
const COLORS = ['#fb7185', '#f472b6', '#fda4af', '#f9a8d4', '#fecdd3']

// Ambient background: hearts continuously drift up from the bottom of the
// screen and fade out near the top, looping forever.
export default function FloatingHearts() {
  const containerRef = useRef(null)

  const hearts = useMemo(
    () =>
      Array.from({ length: HEART_COUNT }, (_, i) => ({
        id: i,
        left: gsap.utils.random(2, 98),
        size: gsap.utils.random(14, 34),
        color: gsap.utils.random(COLORS),
      })),
    [],
  )

  useGSAP(
    () => {
      // Skip the continuous motion for anyone who's asked for reduced motion.
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.utils.toArray('.floating-heart').forEach((el) => {
          const duration = gsap.utils.random(7, 13)
          const drift = gsap.utils.random(-40, 40)

          gsap
            .timeline({ repeat: -1, delay: gsap.utils.random(0, 10) })
            .set(el, { y: 0, x: 0, autoAlpha: 0 })
            .to(el, { autoAlpha: 0.85, duration: duration * 0.12, ease: 'power1.out' }, 0)
            .to(el, { y: '-110vh', x: drift, duration, ease: 'none' }, 0)
            .to(el, { autoAlpha: 0, duration: duration * 0.25, ease: 'power1.in' }, duration * 0.75)
        })
      })

      return () => mm.revert()
    },
    { scope: containerRef },
  )

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {hearts.map((h) => (
        <div key={h.id} className="floating-heart absolute bottom-0 opacity-0" style={{ left: `${h.left}%` }}>
          <Heart size={h.size} color={h.color} />
        </div>
      ))}
    </div>
  )
}
