import { useRef, useMemo } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import Heart from './Heart'
import { SUCCESS_STICKER } from '../lib/stickers'

const PARTICLE_COUNT = 40
const COLORS = ['#fb7185', '#f43f5e', '#f472b6', '#facc15', '#fb923c', '#a78bfa']

export default function SuccessScreen() {
  const containerRef = useRef(null)

  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        id: i,
        isHeart: i % 2 === 0,
        color: gsap.utils.random(COLORS),
        size: gsap.utils.random(10, 26),
      })),
    [],
  )

  useGSAP(
    () => {
      // Burst: every particle flies outward from center in a random
      // direction, tumbles, then falls and fades — a little confetti physics.
      gsap.utils.toArray('.burst-particle').forEach((el) => {
        const angle = gsap.utils.random(0, Math.PI * 2)
        const distance = gsap.utils.random(120, 420)
        const x = Math.cos(angle) * distance
        const y = Math.sin(angle) * distance - 60

        gsap
          .timeline()
          .set(el, { x: 0, y: 0, scale: 0, autoAlpha: 1, rotation: gsap.utils.random(-30, 30) })
          .to(
            el,
            {
              x,
              y,
              scale: gsap.utils.random(0.7, 1.4),
              rotation: `+=${gsap.utils.random(-180, 180)}`,
              duration: gsap.utils.random(0.7, 1.1),
              ease: 'power2.out',
            },
            0,
          )
          .to(
            el,
            { y: '+=160', autoAlpha: 0, duration: gsap.utils.random(0.6, 0.9), ease: 'power1.in' },
            '>-0.2',
          )
      })

      // Success message bounces in just after the burst starts.
      gsap.from('.success-message > *', {
        autoAlpha: 0,
        y: 30,
        scale: 0.8,
        duration: 0.7,
        delay: 0.15,
        stagger: 0.12,
        ease: 'back.out(1.6)',
      })
    },
    { scope: containerRef },
  )

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-svh w-full flex-col items-center justify-center gap-4 overflow-hidden px-6 text-center"
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-0 w-0" aria-hidden="true">
        {particles.map((p) => (
          <div key={p.id} className="burst-particle absolute -translate-x-1/2 -translate-y-1/2 opacity-0">
            {p.isHeart ? (
              <Heart size={p.size} color={p.color} />
            ) : (
              <div
                style={{ width: p.size * 0.6, height: p.size * 0.6, background: p.color }}
                className="rounded-sm"
              />
            )}
          </div>
        ))}
      </div>

      <div className="success-message relative z-10 space-y-4 rounded-[2rem] border border-white/60 bg-white/40 px-10 py-12 shadow-[0_20px_60px_-15px_rgba(244,63,94,0.35)] backdrop-blur-md">
        <img
          src={SUCCESS_STICKER.src}
          width={SUCCESS_STICKER.width}
          height={SUCCESS_STICKER.height}
          alt="she said yes sticker"
          className="mx-auto h-28 w-auto object-contain sm:h-32"
        />
        <div className="text-6xl">🎉💍🎉</div>
        <h1 className="font-script text-5xl font-bold text-rose-600 sm:text-6xl">I knew it! ❤️</h1>
        <p className="text-base font-medium text-rose-500 sm:text-lg">you just made my whole life 🥹</p>
      </div>
    </div>
  )
}
