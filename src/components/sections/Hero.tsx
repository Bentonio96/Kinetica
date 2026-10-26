import { useEffect, useRef, useState } from 'react'
import { COPY } from '../../data/copy'
import { OPENING } from '../../data/festival'
import { useReducedMotion } from '../../hooks/useMediaQuery'
import { fill } from '../../i18n/format'
import { useLanguage } from '../../i18n/useLanguage'
import { MQ, gsap, useGSAP } from '../../lib/gsap'
import { scrollToTarget } from '../../lib/scroll'
import type { Orb } from '../../webgl/orb'
import { KineticWord } from '../KineticWord'
import { Magnetic } from '../Magnetic'

const OPENING_MS = Date.parse(OPENING)

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000))
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  }
}

function Countdown() {
  const { t, n } = useLanguage()
  // Null until mounted: the HTML is prerendered at build time, so any number
  // in it would be stale and would not match on hydration.
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => {
    // Intentional: the clock only exists on the client.
    // eslint-disable-next-line react/set-state-in-effect
    setNow(Date.now())
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const p = now === null ? null : parts(OPENING_MS - now)
  const cells = [
    ['days', p?.days],
    ['hours', p?.hours],
    ['minutes', p?.minutes],
    ['seconds', p?.seconds],
  ] as const

  return (
    <div>
      <p className="etiqueta text-tenue">{t(COPY.hero.countdown)}</p>
      <p className="sr-only">
        {p ? fill(t(COPY.hero.countdownSr), { n: n(p.days) }) : ''}
      </p>
      <div aria-hidden="true" className="mt-2 flex gap-4 sm:gap-6">
        {cells.map(([unit, value]) => (
          <div key={unit} className="min-w-[2.6ch]">
            <span className="cifra block text-2xl leading-none sm:text-3xl">
              {value === undefined ? '—' : String(value).padStart(2, '0')}
            </span>
            <span className="etiqueta mt-1 block text-[0.65rem] text-tenue">
              {t(COPY.hero.units[unit])}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Hero() {
  const { t } = useLanguage()
  const reduced = useReducedMotion()
  const root = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const orb = useRef<Orb | null>(null)
  const [orbReady, setOrbReady] = useState(false)

  // The orb loads after the page has painted and the browser is idle, so the
  // shader compile never competes with the first paint.
  useEffect(() => {
    let cancelled = false
    let cleanup: (() => void) | undefined
    const start = async () => {
      const el = canvas.current
      if (!el || cancelled) return
      const { createOrb } = await import('../../webgl/orb')
      if (cancelled) return
      const lite = window.matchMedia('(max-width: 767px)').matches
      const instance = createOrb(el, { lite, still: reduced })
      if (!instance) return
      orb.current = instance

      const place = () => {
        const w = el.clientWidth
        const h = el.clientHeight
        const aspect = w / h
        // Phones: centred near the top. Wider: to the right of the title.
        // Radius is the orb's apparent radius as a share of canvas height,
        // divided by 0.615, the radius the unit sphere projects to.
        if (aspect < 0.9)
          instance.setFrame(0, 0.17, Math.min(0.3, 0.36 * aspect) / 0.615)
        else
          instance.setFrame(
            Math.min(aspect * 0.5 - 0.42, 0.42),
            0.12,
            0.31 / 0.615,
          )
      }
      place()
      window.addEventListener('resize', place)

      const io = new IntersectionObserver(([entry]) =>
        instance.setVisible(entry?.isIntersecting ?? false),
      )
      io.observe(el)
      setOrbReady(true)
      cleanup = () => {
        window.removeEventListener('resize', place)
        io.disconnect()
        instance.destroy()
        orb.current = null
      }
    }

    const idle = () => {
      if (typeof window.requestIdleCallback === 'function')
        window.requestIdleCallback(() => void start(), { timeout: 1500 })
      else setTimeout(() => void start(), 300)
    }
    if (document.readyState === 'complete') idle()
    else window.addEventListener('load', idle, { once: true })

    return () => {
      cancelled = true
      window.removeEventListener('load', idle)
      cleanup?.()
    }
  }, [reduced])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        gsap.to('[data-hero-word]', {
          yPercent: 35,
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
            onUpdate: (self) => orb.current?.setScroll(self.progress),
          },
        })
        gsap.to('[data-hero-orb]', {
          yPercent: 22,
          scale: 1.15,
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section
      ref={root}
      id="inicio"
      aria-labelledby="inicio-titulo"
      className="relative isolate flex min-h-[max(var(--alto),40rem)] flex-col overflow-x-clip"
      onPointerDown={() => orb.current?.pulse()}
    >
      <div
        data-hero-orb=""
        aria-hidden="true"
        className="absolute inset-0 -z-10"
      >
        {/* Shown until the shader is ready, and kept if WebGL2 is missing. */}
        <div
          className={`absolute top-[18%] left-1/2 aspect-square w-[min(68vw,24rem)] -translate-x-1/2 rounded-full bg-[conic-gradient(from_210deg,#ffc2dc,#ffe3bd,#c9f3d6,#c1e9ff,#d4c9ff,#ffc2dc)] blur-[2px] transition-opacity duration-1000 md:top-[14%] md:left-[64%] md:w-[min(44vw,34rem)] ${orbReady ? 'opacity-0' : 'opacity-80'}`}
        />
        <canvas
          ref={canvas}
          className="entrada-suave absolute inset-0 size-full"
        />
      </div>

      <div className="mx-auto flex w-full max-w-[90rem] flex-1 flex-col px-4 pt-24 pb-8 md:px-8 md:pt-32 md:pb-10">
        <p className="etiqueta entrada max-w-[16rem] text-tenue md:max-w-none">
          <span className="inline-block">{t(COPY.hero.kicker)}</span>
        </p>

        <div className="mt-auto pt-[46vw] md:pt-0">
          <h1
            id="inicio-titulo"
            data-hero-word=""
            className="display entrada text-[clamp(3.6rem,19.5vw,15rem)] uppercase"
          >
            <KineticWord
              text="Kinetica"
              label={t(COPY.hero.title)}
              className="block"
            />
          </h1>

          <div className="mt-6 grid gap-8 md:mt-8 md:grid-cols-12 md:items-end">
            <div className="entrada md:col-span-5">
              <p
                className="display text-2xl md:text-3xl"
                style={{ ['--i' as string]: 2 }}
              >
                <span className="sr-only">{t(COPY.hero.datesLong)}</span>
                <span aria-hidden="true">{t(COPY.hero.dates)}</span>
              </p>
              <p className="mt-1 text-tenue" style={{ ['--i' as string]: 3 }}>
                {t(COPY.hero.place)}
              </p>
            </div>
            <p className="prosa entrada max-w-[34rem] md:col-span-4">
              <span className="inline-block" style={{ ['--i' as string]: 4 }}>
                {t(COPY.hero.lede)}
              </span>
            </p>
            <div className="md:col-span-3 md:justify-self-end">
              <Countdown />
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Magnetic>
              <a
                href="#entradas"
                onClick={(event) => {
                  event.preventDefault()
                  scrollToTarget('#entradas')
                }}
                className="group inline-flex min-h-12 items-center gap-3 rounded-full bg-tinta px-6 font-medium text-fondo no-underline transition-colors duration-300 hover:bg-acento"
              >
                {t(COPY.hero.cta)}
                <span
                  aria-hidden="true"
                  className="transition-transform duration-300 ease-salida group-hover:translate-x-1"
                >
                  →
                </span>
              </a>
            </Magnetic>
            <Magnetic strength={0.25}>
              <a
                href="#programa"
                onClick={(event) => {
                  event.preventDefault()
                  scrollToTarget('#programa')
                }}
                className="inline-flex min-h-12 items-center rounded-full border border-tinta/25 px-6 no-underline transition-colors duration-300 hover:border-tinta"
              >
                {t(COPY.hero.secondary)}
              </a>
            </Magnetic>
            {!reduced && (
              <p
                aria-hidden="true"
                className="etiqueta ml-auto hidden text-tenue lg:block"
              >
                {t(COPY.hero.orbHint)}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
