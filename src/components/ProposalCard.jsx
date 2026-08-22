import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import {
  HERO_STICKER,
  YES_STICKER,
  NO_STICKER,
  YES_REACTION_STICKER,
  NO_REACTION_STICKER,
} from '../lib/stickers'

// The "No" button's label gets more pleading each time it's dodged.
const NO_EXCUSES = [
  'No',
  'Are you sure?',
  'Really sure?',
  'Think again!',
  "Last chance...",
  'Surely not?',
  'You might regret this',
  'Give it another thought',
  'Are you positive?',
  'Just checking...',
]

export default function ProposalCard({ onYes }) {
  const containerRef = useRef(null)
  const yesRef = useRef(null)
  const noRef = useRef(null)
  const noSpacerRef = useRef(null)
  const reactionLayerRef = useRef(null)
  const [dodgeCount, setDodgeCount] = useState(0)

  const { contextSafe } = useGSAP(
    () => {
      // Entrance: stagger fade + slide up from the bottom.
      gsap.from('.reveal-item', {
        autoAlpha: 0,
        y: 40,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.15,
      })

      // Sync the (fixed-position) No button over its reserved spot in the layout.
      const rect = noSpacerRef.current.getBoundingClientRect()
      gsap.set(noRef.current, { left: rect.left, top: rect.top })

      // Gentle continuous pulse on the Yes button, skipped for reduced motion.
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const pulse = gsap.to(yesRef.current, {
          scale: 1.06,
          duration: 0.9,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        })
        return () => pulse.kill()
      })

      return () => mm.revert()
    },
    { scope: containerRef },
  )

  // Launches a sticker flying from an element's position straight up the
  // screen — the same beat as a Facebook story reaction: pop in, rise with a
  // wobble, spin a little, then shrink and fade out near the top.
  const launchReaction = contextSafe((sticker, originRect) => {
    const layer = reactionLayerRef.current
    if (!layer || !originRect) return

    const el = document.createElement('img')
    el.src = sticker.src
    el.alt = ''
    el.className =
      'absolute h-24 w-auto object-contain drop-shadow-[0_12px_30px_rgba(244,63,94,0.5)] sm:h-28'
    el.style.left = `${originRect.left + originRect.width / 2}px`
    el.style.top = `${originRect.top}px`
    layer.appendChild(el)

    const rise = Math.max(window.innerHeight * 0.85, 480)
    const wobble = gsap.utils.random(28, 46)
    const spin = gsap.utils.random(10, 20) * gsap.utils.random([-1, 1])

    gsap.set(el, {
      xPercent: -50,
      yPercent: -50,
      x: 0,
      y: 0,
      scale: 0.2,
      autoAlpha: 0,
      rotation: gsap.utils.random(-10, 10),
    })

    gsap
      .timeline({ onComplete: () => el.remove() })
      .to(el, { autoAlpha: 1, scale: 1.35, duration: 0.3, ease: 'back.out(2.8)' })
      .to(el, { scale: 1, duration: 0.2, ease: 'power1.out' })
      .to(el, { y: -rise, duration: 1.5, ease: 'power1.out' }, 0.15)
      .to(el, { x: `+=${wobble}`, duration: 0.32, ease: 'sine.inOut', repeat: 7, yoyo: true }, 0.15)
      .to(el, { rotation: spin, duration: 0.28, ease: 'sine.inOut', repeat: 7, yoyo: true }, 0.15)
      .to(el, { autoAlpha: 0, scale: 0.6, duration: 0.5, ease: 'power1.in' }, '-=0.6')
  })

  // Fires the "yes!" sticker the moment the cursor lands on the Yes button.
  const reactYes = contextSafe(() => {
    if (!yesRef.current) return
    launchReaction(YES_REACTION_STICKER, yesRef.current.getBoundingClientRect())
  })

  // Runs the No button to a random spot on the viewport, just out of reach.
  const dodge = contextSafe(() => {
    const btn = noRef.current
    if (!btn) return

    const rect = btn.getBoundingClientRect()
    launchReaction(NO_REACTION_STICKER, rect)

    const margin = 16
    const maxX = Math.max(margin, window.innerWidth - rect.width - margin)
    const maxY = Math.max(margin, window.innerHeight - rect.height - margin)

    gsap.to(btn, {
      left: gsap.utils.random(margin, maxX),
      top: gsap.utils.random(margin, maxY),
      duration: 0.35,
      ease: 'back.out(1.7)',
      overwrite: 'auto',
    })

    // The Yes button gets a little more excited every time she tries.
    gsap.to(yesRef.current, {
      scale: '+=0.04',
      duration: 0.3,
      ease: 'back.out(2)',
      overwrite: 'auto',
    })

    setDodgeCount((c) => Math.min(c + 1, NO_EXCUSES.length - 1))
  })

  const noLabel = NO_EXCUSES[dodgeCount]

  return (
    <div
      ref={containerRef}
      className="relative z-10 flex min-h-svh w-full flex-col items-center justify-center gap-8 px-6 py-16 text-center"
    >
      {/* Full-viewport layer that flying reaction stickers get mounted into —
          fixed at the origin so an element's getBoundingClientRect() coords
          can be used directly as its left/top. */}
      <div ref={reactionLayerRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-30" />

      <div className="mx-auto w-full max-w-sm rounded-[2rem] border border-white/60 bg-white/40 px-8 py-10 shadow-[0_20px_60px_-15px_rgba(244,63,94,0.35)] backdrop-blur-md">
        <img
          src={HERO_STICKER.src}
          width={HERO_STICKER.width}
          height={HERO_STICKER.height}
          alt="cute sticker"
          className="reveal-item mx-auto h-32 w-32 object-contain sm:h-36 sm:w-36"
        />

        <div className="reveal-item mt-4 space-y-3">
          <h1 className="font-script text-5xl font-bold text-rose-600 sm:text-6xl">Do you like me?</h1>
          <p className="text-sm font-medium tracking-wide text-rose-400 sm:text-base">
            be honest, I'll know if you're lying 👀
          </p>
        </div>

        <div className="reveal-item relative mt-8 flex w-full items-center justify-center gap-4">
          <button
            ref={yesRef}
            type="button"
            onClick={() => onYes(dodgeCount)}
            onMouseEnter={reactYes}
            onFocus={reactYes}
            onTouchStart={reactYes}
            className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-6 py-3 text-base font-semibold text-white shadow-[0_10px_30px_-8px_rgba(244,63,94,0.6)] transition-colors hover:bg-rose-600"
          >
            <img
              src={YES_STICKER.src}
              width={YES_STICKER.width}
              height={YES_STICKER.height}
              alt=""
              className="h-10 w-auto object-contain sm:h-12"
            />
            <span>Yes</span>
          </button>

          {/* Invisible placeholder — reserves the No button's spot in the flex
              row so the real (fixed-position) button starts out looking like
              a normal inline button, before it starts running away. */}
          <span
            ref={noSpacerRef}
            aria-hidden="true"
            className="invisible inline-flex items-center gap-2 whitespace-nowrap rounded-full px-6 py-3 text-base font-medium"
          >
            <img src={NO_STICKER.src} width={NO_STICKER.width} height={NO_STICKER.height} alt="" className="h-10 w-auto object-contain sm:h-12" />
            <span>{noLabel}</span>
          </span>
        </div>
      </div>

      <button
        ref={noRef}
        type="button"
        onMouseEnter={dodge}
        onClick={dodge}
        onTouchStart={dodge}
        style={{ position: 'fixed', left: 0, top: 0 }}
        className="reveal-item z-20 inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-rose-200 bg-white/80 px-6 py-3 text-base font-medium text-rose-400 shadow-md backdrop-blur"
      >
        <img
          src={NO_STICKER.src}
          width={NO_STICKER.width}
          height={NO_STICKER.height}
          alt=""
          className="h-10 w-auto object-contain sm:h-12"
        />
        <span>{noLabel}</span>
      </button>
    </div>
  )
}
