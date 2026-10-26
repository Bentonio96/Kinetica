import { useRef } from 'react'
import { COPY } from '../data/copy'
import { useLanguage } from '../i18n/useLanguage'
import { MQ, ScrollTrigger, gsap, useGSAP } from '../lib/gsap'

function Star() {
  return (
    <svg
      viewBox="0 0 40 40"
      className="mx-[0.35em] inline-block size-[0.55em] shrink-0 text-tinta"
      aria-hidden="true"
    >
      <path
        d="M20 0c1.6 10.6 8.8 17.8 20 20-11.2 2.2-18.4 9.4-20 20-1.6-10.6-8.8-17.8-20-20C11.2 17.8 18.4 10.6 20 0Z"
        fill="currentColor"
      />
    </svg>
  )
}

/**
 * Two bands of words drifting in opposite directions. Scrolling speeds them
 * up and leans them into the motion; scrolling back reverses them. Decorative
 * (the words are the festival's themes, also in the manifesto), so hidden
 * from assistive tech. Static under reduced motion.
 */
export function Marquee() {
  const { t } = useLanguage()
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        const rows = gsap.utils.toArray<HTMLElement>(
          '[data-cinta]',
          root.current,
        )
        const state = rows.map((_, i) => ({ x: 0, dir: i % 2 ? 1 : -1 }))
        let boost = 0
        let direction = 1
        let visible = false
        const io = new IntersectionObserver(([e]) => {
          visible = e?.isIntersecting ?? false
        })
        if (root.current) io.observe(root.current)

        const trigger = ScrollTrigger.create({
          trigger: root.current,
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: (self) => {
            direction = self.direction
            boost = Math.min(Math.abs(self.getVelocity()) / 220, 14)
          },
        })

        const tick = (_: number, delta: number) => {
          if (!visible) return
          const dt = delta / 16.67
          boost *= 0.94
          rows.forEach((row, i) => {
            const s = state[i]
            if (!s) return
            const half = row.scrollWidth / 2
            s.x += (0.6 + boost) * s.dir * direction * dt
            if (s.x <= -half) s.x += half
            if (s.x > 0) s.x -= half
            gsap.set(row, { x: s.x, skewX: -boost * 0.9 * s.dir * direction })
          })
        }
        gsap.ticker.add(tick)
        return () => {
          gsap.ticker.remove(tick)
          trigger.kill()
          io.disconnect()
        }
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  const words = COPY.marquee.map((w) => t(w))
  const band = (offset: number) => (
    <>
      {[0, 1].map((copy) => (
        <span key={copy} className="flex items-center">
          {words.map((w, i) => {
            const word = words[(i + offset) % words.length] ?? w
            return (
              <span key={`${copy}-${i}`} className="flex items-center">
                {word}
                <Star />
              </span>
            )
          })}
        </span>
      ))}
    </>
  )

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="display relative overflow-x-clip py-[4vw] text-[clamp(3rem,9vw,8.5rem)] uppercase select-none"
    >
      <div data-cinta="" className="cinta">
        {band(0)}
      </div>
      <div
        data-cinta=""
        className="cinta mt-[0.1em] text-transparent [-webkit-text-stroke:1.5px_var(--tinta)]"
      >
        {band(3)}
      </div>
    </div>
  )
}
