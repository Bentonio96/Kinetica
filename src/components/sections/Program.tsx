import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { COPY } from '../../data/copy'
import { DAYS, SPACES } from '../../data/festival'
import { useInView } from '../../hooks/useInView'
import { useReducedMotion } from '../../hooks/useMediaQuery'
import { useLanguage } from '../../i18n/useLanguage'
import { MQ, gsap, useGSAP } from '../../lib/gsap'
import type { ParticleField } from '../../webgl/particles'
import { Reveal } from '../Reveal'

const FONT = '"Bricolage Grotesque Variable", "Arial Narrow", sans-serif'

export function Program() {
  const { t, lang } = useLanguage()
  const reduced = useReducedMotion()
  const [active, setActive] = useState(0)
  const root = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const field = useRef<ParticleField | null>(null)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const near = useInView(root, '400px 0px')
  const [ready, setReady] = useState(false)

  const day = DAYS[active] ?? DAYS[0]!

  // Load the particle code only when the section is about to be seen.
  useEffect(() => {
    if (!near || field.current) return
    let cancelled = false
    void (async () => {
      const [{ createParticles }] = await Promise.all([
        import('../../webgl/particles'),
        document.fonts.load(`800 100px ${FONT}`),
      ])
      const el = canvas.current
      if (cancelled || !el) return
      const lite = window.matchMedia('(max-width: 767px)').matches
      field.current = createParticles(el, {
        count: lite ? 1400 : 3200,
        still: reduced,
        font: FONT,
      })
      setReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [near, reduced])

  useEffect(() => () => field.current?.destroy(), [])

  useEffect(() => {
    field.current?.setVisible(near)
  }, [near, ready])

  useEffect(() => {
    if (ready) field.current?.setText(String(day.date))
  }, [ready, day.date])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        gsap.from('[data-item]', {
          y: 18,
          rotate: 1,
          duration: 0.7,
          stagger: 0.06,
        })
      })
      return () => mm.revert()
    },
    { scope: root, dependencies: [active], revertOnUpdate: true },
  )

  const onKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    const last = DAYS.length - 1
    let next = active
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown')
      next = active === last ? 0 : active + 1
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp')
      next = active === 0 ? last : active - 1
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = last
    else return
    event.preventDefault()
    setActive(next)
    tabs.current[next]?.focus()
  }

  return (
    <section
      ref={root}
      id="programa"
      aria-labelledby="programa-titulo"
      className="relative"
    >
      <div className="mx-auto max-w-[90rem] px-4 py-20 md:px-8 md:py-28">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <p className="etiqueta text-tenue md:col-span-3">
            {t(COPY.program.label)}
          </p>
          <Reveal
            id="programa-titulo"
            text={t(COPY.program.title)}
            className="titulo md:col-span-6"
          />
          <p className="prosa text-tenue md:col-span-3">
            {t(COPY.program.lede)}
          </p>
        </div>

        <div
          role="tablist"
          aria-label={t(COPY.program.tabs)}
          className="mt-12 grid grid-cols-4 border-y border-linea"
        >
          {DAYS.map((d, i) => {
            const selected = i === active
            return (
              <button
                key={d.date}
                ref={(el) => {
                  tabs.current[i] = el
                }}
                role="tab"
                type="button"
                id={`dia-${d.date}`}
                aria-selected={selected}
                aria-controls="programa-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(i)}
                onKeyDown={onKey}
                className={`group relative min-h-16 cursor-pointer px-1 py-3 text-left transition-colors duration-300 sm:px-4 ${selected ? 'text-tinta' : 'text-tenue hover:text-tinta'}`}
              >
                <span className="etiqueta block text-[0.65rem] sm:text-xs">
                  {t(d.weekday)}
                </span>
                <span className="display mt-1 block text-2xl sm:text-4xl">
                  {d.date}
                </span>
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-0 -bottom-px h-0.5 origin-left bg-acento transition-transform duration-500 ease-salida ${selected ? 'scale-x-100' : 'scale-x-0'}`}
                />
              </button>
            )
          })}
        </div>

        <div
          id="programa-panel"
          role="tabpanel"
          aria-labelledby={`dia-${day.date}`}
          className="mt-10 grid gap-10 md:grid-cols-12"
        >
          <div className="md:col-span-6">
            <div
              className="relative aspect-[5/4] w-full"
              data-cursor={reduced ? undefined : '✦'}
            >
              <canvas
                ref={canvas}
                aria-hidden="true"
                className="absolute inset-0 size-full touch-pan-y"
              />
              {!ready && (
                <span
                  aria-hidden="true"
                  className="display absolute inset-0 flex items-center justify-center text-[clamp(8rem,30vw,22rem)] text-linea"
                >
                  {day.date}
                </span>
              )}
            </div>
            <p className="display mt-2 text-3xl md:text-4xl">{t(day.name)}</p>
            <p className="prosa mt-2 max-w-md text-tenue">{t(day.mood)}</p>
          </div>

          <ol
            className="md:col-span-6 md:self-center"
            key={`${day.date}-${lang}`}
          >
            {day.items.map((item) => {
              const space = SPACES.find((s) => s.id === item.space)
              return (
                <li
                  key={item.time + item.who}
                  data-item=""
                  className="grid grid-cols-[4.5rem_1fr] gap-x-4 gap-y-1 border-b border-linea py-5 first:border-t sm:grid-cols-[5.5rem_1fr_auto]"
                >
                  <span className="cifra pt-1 text-sm text-tenue">
                    {item.time}
                  </span>
                  <div>
                    <p className="text-lg leading-snug font-medium md:text-xl">
                      {t(item.title)}
                    </p>
                    <p className="mt-0.5 text-tenue">{item.who}</p>
                  </div>
                  <span className="etiqueta col-start-2 text-tenue sm:col-start-3 sm:pt-1.5 sm:text-right">
                    {space ? t(space.name) : ''}
                  </span>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
