import { useRef, type JSX, type PointerEvent as ReactPointerEvent } from 'react'
import { COPY } from '../../data/copy'
import {
  INSTALLATIONS,
  SPACES,
  type InstallationArt,
} from '../../data/festival'
import { useLanguage } from '../../i18n/useLanguage'
import { Reveal } from '../Reveal'

/** Pendulum wave: each line has a slightly different period, so the row
 * drifts out of phase and back into a line every 30 s, like the real thing. */
function Pendulos() {
  return (
    <svg viewBox="0 0 240 160" className="size-full" aria-hidden="true">
      {Array.from({ length: 15 }, (_, i) => {
        const x = 22 + i * 14
        const len = 70 + i * 3.4
        return (
          <g
            key={i}
            className="pendulo"
            style={{
              transformOrigin: `${x}px 8px`,
              animationDuration: `${30 / (18 + i)}s`,
            }}
          >
            <line
              x1={x}
              y1={8}
              x2={x}
              y2={8 + len}
              stroke="currentColor"
              strokeOpacity="0.5"
            />
            <circle
              cx={x}
              cy={8 + len}
              r={4.2}
              fill={`hsl(${200 + i * 9} 90% 70%)`}
            />
          </g>
        )
      })}
    </svg>
  )
}

function Ecos() {
  return (
    <svg viewBox="0 0 240 160" className="size-full" aria-hidden="true">
      <defs>
        <linearGradient id="eco-g" x1="0" x2="1">
          <stop offset="0" stopColor="#ff9ac8" />
          <stop offset="0.5" stopColor="#b7a8ff" />
          <stop offset="1" stopColor="#92e3ff" />
        </linearGradient>
      </defs>
      {Array.from({ length: 6 }, (_, i) => (
        <circle
          key={i}
          cx="120"
          cy="80"
          r="70"
          fill="none"
          stroke="url(#eco-g)"
          strokeWidth="1.6"
          className="eco"
          style={{ animationDelay: `${-i * 0.7}s` }}
        />
      ))}
      <circle cx="120" cy="80" r="5" fill="currentColor" />
    </svg>
  )
}

function Marea() {
  return (
    <svg
      viewBox="0 0 240 160"
      className="size-full"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="marea-g" x1="0" x2="1">
          <stop offset="0" stopColor="#45d6c8" />
          <stop offset="0.35" stopColor="#7c6cff" />
          <stop offset="0.7" stopColor="#ff7ab6" />
          <stop offset="1" stopColor="#45d6c8" />
        </linearGradient>
      </defs>
      {Array.from({ length: 7 }, (_, i) => (
        <path
          key={i}
          className="ola"
          d={`M0 ${40 + i * 15} C 40 ${28 + i * 15}, 80 ${52 + i * 15}, 120 ${40 + i * 15} S 200 ${28 + i * 15}, 240 ${40 + i * 15} S 320 ${52 + i * 15}, 360 ${40 + i * 15} S 440 ${28 + i * 15}, 480 ${40 + i * 15}`}
          fill="none"
          stroke="url(#marea-g)"
          strokeWidth={2.2 - i * 0.2}
          style={{
            animationDuration: `${6 + i * 1.3}s`,
            animationDirection: i % 2 ? 'reverse' : 'normal',
          }}
        />
      ))}
    </svg>
  )
}

/** Mirrors that turn towards the pointer; a slow wave runs when it is away. */
function Espejos() {
  const grid = useRef<HTMLDivElement>(null)
  const onMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const tiles = grid.current?.children
    if (!tiles) return
    for (const tile of tiles) {
      const r = tile.getBoundingClientRect()
      const dx = event.clientX - (r.left + r.width / 2)
      const dy = event.clientY - (r.top + r.height / 2)
      ;(tile as HTMLElement).style.transform =
        `rotateY(${Math.max(-60, Math.min(60, dx / 3))}deg) rotateX(${Math.max(-60, Math.min(60, -dy / 3))}deg)`
    }
  }
  const onLeave = () => {
    const tiles = grid.current?.children
    if (!tiles) return
    for (const tile of tiles) (tile as HTMLElement).style.transform = ''
  }
  return (
    <div
      ref={grid}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      aria-hidden="true"
      className="grid size-full grid-cols-8 grid-rows-5 gap-1.5 p-2 [perspective:500px]"
    >
      {Array.from({ length: 40 }, (_, i) => (
        <span
          key={i}
          className="espejo rounded-[3px] bg-[linear-gradient(135deg,#f6f3ff,#b7a8ff_40%,#92e3ff_70%,#ffd59a)] transition-transform duration-500 ease-salida"
          style={{
            animationDelay: `${(i % 8) * 0.12 + Math.floor(i / 8) * 0.12}s`,
          }}
        />
      ))}
    </div>
  )
}

const ART: Record<InstallationArt, () => JSX.Element> = {
  pendulos: Pendulos,
  ecos: Ecos,
  marea: Marea,
  espejos: Espejos,
}

export function Installations() {
  const { t } = useLanguage()

  return (
    <section
      id="instalaciones"
      data-escena="noche"
      aria-labelledby="instalaciones-titulo"
      className="escena-noche relative"
    >
      <div className="mx-auto max-w-[90rem] px-4 pt-8 pb-20 md:px-8 md:pb-28">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <p className="etiqueta text-tenue md:col-span-3">
            {t(COPY.installations.label)}
          </p>
          <Reveal
            id="instalaciones-titulo"
            text={t(COPY.installations.title)}
            className="titulo md:col-span-6"
          />
          <p className="prosa text-tenue md:col-span-3">
            {t(COPY.installations.lede)}
          </p>
        </div>

        <ol className="mt-14 border-t border-linea">
          {INSTALLATIONS.map((item, i) => {
            const Art = ART[item.id]
            const space = SPACES.find((s) => s.id === item.space)
            return (
              <li
                key={item.id}
                className="group grid gap-6 border-b border-linea py-8 md:grid-cols-12 md:items-center md:gap-8 md:py-10"
              >
                <span className="cifra text-sm text-tenue md:col-span-1">
                  0{i + 1}
                </span>
                <div className="md:col-span-6">
                  <h3 className="display text-[clamp(2.2rem,1.6rem+2.6vw,4.4rem)] transition-[font-variation-settings] duration-700 ease-salida [font-variation-settings:'wght'_380,'wdth'_80,'opsz'_96] group-hover:[font-variation-settings:'wght'_760,'wdth'_96,'opsz'_96]">
                    {t(item.title)}
                  </h3>
                  <p className="mt-1 text-tenue">{item.by}</p>
                  <p className="prosa mt-4 max-w-xl">{t(item.text)}</p>
                  <div className="mt-5 flex flex-wrap gap-x-8 gap-y-2">
                    <p className="etiqueta">{t(item.figure)}</p>
                    <dl className="flex gap-2">
                      <dt className="etiqueta text-tenue">
                        {t(COPY.installations.where)}
                      </dt>
                      <dd className="etiqueta">{space ? t(space.name) : ''}</dd>
                    </dl>
                  </div>
                </div>
                <div className="relative aspect-[3/2] overflow-hidden rounded-2xl border border-linea bg-white/[0.03] md:col-span-5">
                  <Art />
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
