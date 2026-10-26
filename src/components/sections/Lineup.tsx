import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { COPY } from '../../data/copy'
import { ARTISTS, DAYS, SPACES, type Artist } from '../../data/festival'
import { useInView } from '../../hooks/useInView'
import { useReducedMotion } from '../../hooks/useMediaQuery'
import { fill } from '../../i18n/format'
import { useLanguage } from '../../i18n/useLanguage'
import { gsap } from '../../lib/gsap'
import { ArtistArt } from '../ArtistArt'
import { Magnetic } from '../Magnetic'
import { Reveal } from '../Reveal'

const N = ARTISTS.length
const STEP = 360 / N

function Facts({ artist }: { artist: Artist }) {
  const { t } = useLanguage()
  const day = DAYS.find((d) => d.date === artist.day)
  const space = SPACES.find((s) => s.id === artist.space)
  return (
    <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
      <div>
        <dt className="etiqueta text-tenue">{t(COPY.lineup.day)}</dt>
        <dd className="mt-0.5">{day ? `${t(day.weekday)} ${day.date}` : ''}</dd>
      </div>
      <div>
        <dt className="etiqueta text-tenue">{t(COPY.lineup.stage)}</dt>
        <dd className="mt-0.5">{space ? t(space.name) : ''}</dd>
      </div>
    </dl>
  )
}

function CardFace({ artist, index }: { artist: Artist; index: number }) {
  const { t } = useLanguage()
  return (
    <>
      <ArtistArt name={artist.name} shape={artist.shape} index={index} />
      <span className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/85 to-transparent" />
      <span className="absolute inset-x-0 bottom-0 p-4 text-left text-white">
        <span className="display block text-2xl leading-none [font-variation-settings:'wght'_600,'wdth'_80,'opsz'_96]">
          {artist.name}
        </span>
        <span className="etiqueta mt-2 block text-[0.65rem] text-white/80">
          {t(artist.discipline)}
        </span>
      </span>
    </>
  )
}

/** Reduced motion: the same cards, flat, in a grid. */
function FlatLineup() {
  const { t } = useLanguage()
  return (
    <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
      {ARTISTS.map((artist, i) => (
        <li key={artist.name}>
          <div className="relative aspect-[5/7] overflow-hidden rounded-xl">
            <CardFace artist={artist} index={i} />
          </div>
          <p className="mt-3 text-tenue">{t(artist.line)}</p>
          <Facts artist={artist} />
        </li>
      ))}
    </ul>
  )
}

/**
 * The line-up as a ring of cards in 3D. Drag it (with inertia, snapping to
 * a card), use the buttons or the arrow keys, or press a card to bring it to
 * the front. It drifts slowly on its own while nobody touches it. The card in
 * front is described below in a polite live region.
 */
function Ring() {
  const { t } = useLanguage()
  const [index, setIndex] = useState(0)
  const stage = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const cards = useRef<(HTMLButtonElement | null)[]>([])
  const angle = useRef({ a: 0 })
  const radius = useRef(500)
  const held = useRef(false)
  const dragged = useRef(false)
  const visible = useInView(stage, '0px')
  const indexRef = useRef(0)
  // Announce the front card only after the visitor moves the ring, not on
  // every step of the idle drift.
  const [live, setLive] = useState(false)

  const render = useCallback(() => {
    const a = angle.current.a
    const r = radius.current
    if (ring.current)
      ring.current.style.transform = `translateZ(${-r}px) rotateX(-7deg) rotateY(${a}deg)`
    cards.current.forEach((card, i) => {
      if (!card) return
      let rel = (i * STEP + a) % 360
      if (rel > 180) rel -= 360
      if (rel < -180) rel += 360
      const facing = Math.cos((rel * Math.PI) / 180)
      card.style.transform = `rotateY(${i * STEP}deg) translateZ(${r}px)`
      card.style.setProperty('--f', facing.toFixed(3))
      card.style.pointerEvents = facing > 0.2 ? 'auto' : 'none'
    })
    const next = ((Math.round(-a / STEP) % N) + N) % N
    if (next !== indexRef.current) {
      indexRef.current = next
      setIndex(next)
    }
  }, [])

  const goTo = useCallback(
    (i: number) => {
      setLive(true)
      const a = angle.current.a
      let target = -i * STEP
      target += Math.round((a - target) / 360) * 360
      gsap.to(angle.current, {
        a: target,
        duration: 1,
        ease: 'expo.out',
        overwrite: true,
        onUpdate: render,
      })
    },
    [render],
  )

  // Size: the ring's radius follows the card width so neighbours just touch.
  useEffect(() => {
    const measure = () => {
      const w = cards.current[0]?.offsetWidth ?? 240
      radius.current = (w / 2 / Math.tan(Math.PI / N)) * 1.14
      render()
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [render])

  // Idle drift, only while on screen and untouched.
  useEffect(() => {
    if (!visible) return
    const el = stage.current
    let paused = false
    const pause = () => (paused = true)
    const resume = () => (paused = false)
    el?.addEventListener('pointerenter', pause)
    el?.addEventListener('pointerleave', resume)
    el?.addEventListener('focusin', pause)
    el?.addEventListener('focusout', resume)
    const tick = (_: number, delta: number) => {
      if (paused || held.current || gsap.isTweening(angle.current)) return
      setLive(false)
      angle.current.a -= 0.004 * delta
      render()
    }
    gsap.ticker.add(tick)
    return () => {
      gsap.ticker.remove(tick)
      el?.removeEventListener('pointerenter', pause)
      el?.removeEventListener('pointerleave', resume)
      el?.removeEventListener('focusin', pause)
      el?.removeEventListener('focusout', resume)
    }
  }, [visible, render])

  // Drag with inertia, then snap to the nearest card.
  useEffect(() => {
    const el = stage.current
    if (!el) return
    let startX = 0
    let startA = 0
    let lastX = 0
    let lastT = 0
    let velocity = 0
    const perPx = () => (360 / (2 * Math.PI * radius.current)) * 0.9

    const down = (event: PointerEvent) => {
      if (event.button !== 0) return
      held.current = true
      dragged.current = false
      gsap.killTweensOf(angle.current)
      startX = lastX = event.clientX
      startA = angle.current.a
      lastT = performance.now()
      velocity = 0
    }
    const move = (event: PointerEvent) => {
      if (!held.current) return
      const dx = event.clientX - startX
      if (!dragged.current && Math.abs(dx) > 6) {
        dragged.current = true
        el.setPointerCapture(event.pointerId)
      }
      if (!dragged.current) return
      const now = performance.now()
      velocity = ((event.clientX - lastX) / Math.max(1, now - lastT)) * perPx()
      lastX = event.clientX
      lastT = now
      angle.current.a = startA + dx * perPx()
      render()
    }
    const up = () => {
      if (!held.current) return
      held.current = false
      if (!dragged.current) return
      setLive(true)
      const projected = angle.current.a + velocity * 380
      const snapped = Math.round(projected / STEP) * STEP
      gsap.to(angle.current, {
        a: snapped,
        duration: 1.2,
        ease: 'expo.out',
        onUpdate: render,
      })
    }
    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
  }, [render])

  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'ArrowRight') goTo((index + 1) % N)
    else if (event.key === 'ArrowLeft') goTo((index - 1 + N) % N)
    else return
    event.preventDefault()
  }

  const artist = ARTISTS[index] ?? ARTISTS[0]!

  return (
    <div
      role="region"
      aria-roledescription={t(COPY.lineup.carousel)}
      aria-label={t(COPY.lineup.carousel)}
      onKeyDown={onKey}
    >
      <div
        ref={stage}
        data-cursor={t(COPY.lineup.drag)}
        className="relative mt-6 h-[24rem] touch-pan-y select-none [perspective:1100px] md:h-[30rem] md:[perspective:1500px]"
      >
        <div
          ref={ring}
          className="absolute top-1/2 left-1/2 [transform-style:preserve-3d]"
        >
          {ARTISTS.map((a, i) => (
            <button
              key={a.name}
              ref={(el) => {
                cards.current[i] = el
              }}
              type="button"
              aria-current={i === index ? 'true' : undefined}
              onClick={() => {
                if (dragged.current) return
                goTo(i)
              }}
              onPointerMove={(event) => {
                const r = event.currentTarget.getBoundingClientRect()
                event.currentTarget.style.setProperty(
                  '--sx',
                  `${event.clientX - r.left}px`,
                )
                event.currentTarget.style.setProperty(
                  '--sy',
                  `${event.clientY - r.top}px`,
                )
              }}
              onFocus={() => goTo(i)}
              className="group absolute -top-[8.25rem] -left-[5.75rem] h-[16.5rem] w-[11.5rem] cursor-pointer overflow-hidden rounded-xl brightness-[calc(0.3+0.7*var(--f,1))] [backface-visibility:hidden] md:-top-[10.75rem] md:-left-[7.5rem] md:h-[21.5rem] md:w-[15rem]"
            >
              <CardFace artist={a} index={i} />
              <span className="sr-only">
                {' '}
                {fill(t(COPY.lineup.slide), { n: i + 1, total: N })}
              </span>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 [background:radial-gradient(circle_at_var(--sx)_var(--sy),rgb(255_255_255/0.28),transparent_45%)]"
              />
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-4 grid max-w-3xl items-start gap-6 text-center md:grid-cols-[auto_1fr_auto] md:text-left">
        <Magnetic className="hidden md:inline-flex">
          <button
            type="button"
            onClick={() => goTo((index - 1 + N) % N)}
            aria-label={t(COPY.lineup.previous)}
            className="inline-flex size-14 cursor-pointer items-center justify-center rounded-full border border-linea text-xl transition-colors hover:border-tinta"
          >
            <span aria-hidden="true">←</span>
          </button>
        </Magnetic>
        <div
          aria-live={live ? 'polite' : 'off'}
          aria-atomic="true"
          className="min-h-[11rem]"
        >
          <p className="etiqueta text-tenue">
            {fill(t(COPY.lineup.slide), { n: index + 1, total: N })} ·{' '}
            {t(artist.from)}
          </p>
          <p className="display mt-2 text-4xl md:text-5xl">{artist.name}</p>
          <p className="prosa mt-2 text-tenue">{t(artist.line)}</p>
          <div className="flex justify-center md:justify-start">
            <Facts artist={artist} />
          </div>
        </div>
        <div className="flex justify-center gap-3 md:block">
          <Magnetic className="inline-flex md:hidden">
            <button
              type="button"
              onClick={() => goTo((index - 1 + N) % N)}
              aria-label={t(COPY.lineup.previous)}
              className="inline-flex size-14 cursor-pointer items-center justify-center rounded-full border border-linea text-xl"
            >
              <span aria-hidden="true">←</span>
            </button>
          </Magnetic>
          <Magnetic>
            <button
              type="button"
              onClick={() => goTo((index + 1) % N)}
              aria-label={t(COPY.lineup.next)}
              className="inline-flex size-14 cursor-pointer items-center justify-center rounded-full border border-linea text-xl transition-colors hover:border-tinta"
            >
              <span aria-hidden="true">→</span>
            </button>
          </Magnetic>
        </div>
      </div>
    </div>
  )
}

export function Lineup() {
  const { t } = useLanguage()
  const reduced = useReducedMotion()

  return (
    <section
      id="lineup"
      data-escena="noche"
      aria-labelledby="lineup-titulo"
      className="escena-noche relative overflow-x-clip"
    >
      <div className="mx-auto max-w-[90rem] px-4 py-20 md:px-8 md:py-28">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <p className="etiqueta text-tenue md:col-span-3">
            {t(COPY.lineup.label)}
          </p>
          <Reveal
            id="lineup-titulo"
            text={t(COPY.lineup.title)}
            className="titulo md:col-span-6"
          />
          <p className="prosa text-tenue md:col-span-3">
            {t(COPY.lineup.lede)}
          </p>
        </div>
        {reduced ? <FlatLineup /> : <Ring />}
      </div>
    </section>
  )
}
