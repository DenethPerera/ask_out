import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

// The gentle "wind-up" before the actual question — sets the mood before
// jumping straight to "Do you like me?".
export default function IntroScreen({ onContinue }) {
  const containerRef = useRef(null)

  const { contextSafe } = useGSAP(
    () => {
      gsap.from('.reveal-item', {
        autoAlpha: 0,
        y: 40,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.18,
      })
    },
    { scope: containerRef },
  )

  // Fade + slide the whole page out, then hand off to the next stage.
  const handleContinue = contextSafe(() => {
    gsap.to(containerRef.current, {
      autoAlpha: 0,
      y: -30,
      duration: 0.5,
      ease: 'power2.inOut',
      onComplete: onContinue,
    })
  })

  return (
    <div
      ref={containerRef}
      className="relative z-10 flex min-h-svh w-full flex-col items-center justify-center gap-8 px-6 py-16 text-center"
    >
      <div className="mx-auto w-full max-w-sm rounded-[2rem] border border-white/60 bg-white/40 px-8 py-12 shadow-[0_20px_60px_-15px_rgba(244,63,94,0.35)] backdrop-blur-md">
        <p className="reveal-item text-xs font-semibold uppercase tracking-[0.3em] text-rose-400">
          psst... ✨
        </p>
        <h1 className="reveal-item mt-4 font-script text-5xl font-bold leading-tight text-rose-600 sm:text-6xl">
          I have something
          <br />
          to tell you
        </h1>
        <p className="reveal-item mt-5 text-sm font-medium text-rose-400 sm:text-base">
          nothing scary, I promise 🤭 — just open your heart for a sec
        </p>

        <button
          type="button"
          onClick={handleContinue}
          className="reveal-item mt-8 rounded-full bg-rose-500 px-8 py-3 text-base font-semibold text-white shadow-[0_10px_30px_-8px_rgba(244,63,94,0.6)] transition-colors hover:bg-rose-600"
        >
          Okay, tell me 💌
        </button>
      </div>
    </div>
  )
}
