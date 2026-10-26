import { useRef, type ElementType } from 'react'
import { useReducedMotion } from '../hooks/useMediaQuery'
import { gsap, useGSAP } from '../lib/gsap'

/**
 * A word whose letters breathe: each one swells in weight and width as the
 * pointer gets close, and a slow wave runs through them when it does not.
 * Works on the variable axes of Bricolage Grotesque (wght 200–800, wdth
 * 75–100), so nothing is scaled and the glyphs stay crisp.
 *
 * The letters are hidden from assistive tech; `label` is what is read.
 * Callers size the word for its widest state (every letter at wdth 100,
 * wght 800), so it can never outgrow its line.
 */
export function KineticWord({
  text,
  label,
  as: Tag = 'span',
  className = '',
  rest = { wght: 300, wdth: 78 },
}: {
  text: string
  label: string
  as?: ElementType
  className?: string
  rest?: { wght: number; wdth: number }
}) {
  const root = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      const el = root.current
      if (!el || reduced) return
      const letters = [...el.querySelectorAll<HTMLElement>('[data-letra]')]
      const pointer = { x: -1e4, y: -1e4 }
      let visible = false
      let t = 0
      let size = parseFloat(getComputedStyle(el).fontSize) || 100
      const onResize = () => {
        size = parseFloat(getComputedStyle(el).fontSize) || 100
      }
      window.addEventListener('resize', onResize)
      const influence = letters.map(() => 0)

      const move = (event: PointerEvent) => {
        pointer.x = event.clientX
        pointer.y = event.clientY
      }
      const observer = new IntersectionObserver(([entry]) => {
        visible = entry?.isIntersecting ?? false
      })
      observer.observe(el)
      window.addEventListener('pointermove', move, { passive: true })

      const tick = (_time: number, delta: number) => {
        if (!visible) return
        t += delta / 1000
        const radius = size * 1.4
        letters.forEach((letter, i) => {
          const r = letter.getBoundingClientRect()
          const dx = pointer.x - (r.left + r.width / 2)
          const dy = pointer.y - (r.top + r.height / 2)
          const near = Math.exp(-(dx * dx + dy * dy) / (radius * radius))
          const wave = 0.5 + 0.5 * Math.sin(t * 1.5 - i * 0.65)
          const goal = Math.max(near, wave * 0.45)
          const current = influence[i] ?? 0
          const next = current + (goal - current) * 0.12
          influence[i] = next
          const wght = rest.wght + (800 - rest.wght) * next
          const wdth = rest.wdth + (100 - rest.wdth) * next
          letter.style.fontVariationSettings = `'wght' ${wght.toFixed(0)}, 'wdth' ${wdth.toFixed(1)}, 'opsz' 96`
        })
      }
      gsap.ticker.add(tick)
      return () => {
        gsap.ticker.remove(tick)
        observer.disconnect()
        window.removeEventListener('pointermove', move)
        window.removeEventListener('resize', onResize)
      }
    },
    { dependencies: [reduced, text], scope: root },
  )

  const settings = `'wght' ${reduced ? 640 : rest.wght}, 'wdth' ${reduced ? 82 : rest.wdth}, 'opsz' 96`

  return (
    <Tag ref={root} className={className}>
      <span className="sr-only">{label}</span>
      <span aria-hidden="true" className="inline-flex whitespace-nowrap">
        {[...text].map((char, i) => (
          <span
            key={`${char}-${i}`}
            data-letra=""
            className="inline-block"
            style={{ fontVariationSettings: settings }}
          >
            {char}
          </span>
        ))}
      </span>
    </Tag>
  )
}
