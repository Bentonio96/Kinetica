import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { COPY } from '../../data/copy'
import { SPACES, type SpaceId } from '../../data/festival'
import { useFinePointer, useReducedMotion } from '../../hooks/useMediaQuery'
import { fill } from '../../i18n/format'
import { useLanguage } from '../../i18n/useLanguage'
import { Reveal } from '../Reveal'

interface Zone {
  readonly shape: { x: number; y: number; w: number; h: number; r?: number }
  readonly anchor: readonly [number, number]
  /** Walking route from the entrance, drawn when the zone is chosen. */
  readonly route: string
}

const ZONES: Record<SpaceId, Zone> = {
  muelle: {
    shape: { x: 40, y: 50, w: 150, h: 80 },
    anchor: [115, 90],
    route: '',
  },
  galeria: {
    shape: { x: 230, y: 40, w: 330, h: 70 },
    anchor: [395, 75],
    route: 'M115 130 V146 H395 V110',
  },
  torre: {
    shape: { x: 610, y: 40, w: 90, h: 90 },
    anchor: [655, 85],
    route: 'M115 130 V146 H655 V130',
  },
  gruas: {
    shape: { x: 40, y: 180, w: 180, h: 150 },
    anchor: [130, 255],
    route: 'M115 130 V180',
  },
  nave: {
    shape: { x: 270, y: 168, w: 330, h: 162 },
    anchor: [435, 249],
    route: 'M115 130 V146 H435 V168',
  },
  darsena: {
    shape: { x: 470, y: 405, w: 200, h: 64, r: 32 },
    anchor: [570, 437],
    route: 'M115 130 V146 H245 V360 H570 V405',
  },
}

export function Venue() {
  const { t, n } = useLanguage()
  const [active, setActive] = useState<SpaceId>('nave')
  const fine = useFinePointer()
  const reduced = useReducedMotion()
  const tilt = useRef<HTMLDivElement>(null)

  const space = SPACES.find((s) => s.id === active) ?? SPACES[0]!
  const zone = ZONES[active]

  const onMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!fine || reduced || !tilt.current) return
    const r = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - r.left) / r.width - 0.5
    const y = (event.clientY - r.top) / r.height - 0.5
    tilt.current.style.transform = `rotateX(${(18 - y * 10).toFixed(2)}deg) rotateY(${(x * 10).toFixed(2)}deg)`
  }

  return (
    <section id="recinto" aria-labelledby="recinto-titulo" className="relative">
      <div className="mx-auto max-w-[90rem] px-4 py-20 md:px-8 md:py-28">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <p className="etiqueta text-tenue md:col-span-3">
            {t(COPY.venue.label)}
          </p>
          <Reveal
            id="recinto-titulo"
            text={t(COPY.venue.title)}
            className="titulo md:col-span-6"
          />
          <p className="prosa text-tenue md:col-span-3">{t(COPY.venue.lede)}</p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-12">
          <div
            className="lg:col-span-8 [perspective:1600px]"
            onPointerMove={onMove}
            onPointerLeave={() => {
              if (tilt.current) tilt.current.style.transform = ''
            }}
          >
            <div
              ref={tilt}
              className={`origin-center transition-transform duration-700 ease-salida ${reduced ? '' : 'lg:[transform:rotateX(18deg)]'}`}
            >
              <svg
                viewBox="0 0 740 520"
                role="img"
                aria-label={t(COPY.venue.mapLabel)}
                className="w-full overflow-visible"
              >
                <defs>
                  <pattern
                    id="agua"
                    width="18"
                    height="10"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M0 6 Q 4.5 2 9 6 T 18 6"
                      fill="none"
                      stroke="currentColor"
                      strokeOpacity="0.35"
                    />
                  </pattern>
                </defs>
                {/* Water and quay */}
                <path d="M0 380 H740 V520 H0 Z" className="fill-[#dfe9f0]" />
                <path
                  d="M0 380 H740 V520 H0 Z"
                  fill="url(#agua)"
                  className="text-[#5d88a6]"
                />
                <text
                  x="28"
                  y="500"
                  className="etiqueta fill-[#3f6683] text-[13px]"
                >
                  {t(COPY.venue.water)}
                </text>
                {/* Roads */}
                <path
                  d="M115 130 V146 H700 M245 146 V360 H700 M115 146 V180"
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity="0.12"
                  strokeWidth="14"
                  strokeLinejoin="round"
                />

                {SPACES.map((s) => {
                  const z = ZONES[s.id]
                  const on = s.id === active
                  return (
                    <g
                      key={s.id}
                      onClick={() => setActive(s.id)}
                      onPointerEnter={() => fine && setActive(s.id)}
                      className="cursor-pointer"
                    >
                      <rect
                        x={z.shape.x}
                        y={z.shape.y}
                        width={z.shape.w}
                        height={z.shape.h}
                        rx={z.shape.r ?? 10}
                        className={`transition-[fill,stroke] duration-500 ${on ? 'fill-tinta stroke-tinta' : 'fill-fondo stroke-tinta/40 hover:fill-tinta/10'}`}
                        strokeWidth="1.5"
                      />
                      <text
                        x={z.shape.x + 14}
                        y={z.shape.y + 26}
                        className={`pointer-events-none text-[19px] font-medium transition-[fill] duration-500 ${on ? 'fill-fondo' : 'fill-tinta'}`}
                      >
                        {s.id === 'torre'
                          ? t(s.name)
                              .split(/ (?=\S+$)/)
                              .map((line, i) => (
                                <tspan
                                  key={line}
                                  x={z.shape.x + 14}
                                  dy={i ? 22 : 0}
                                >
                                  {line}
                                </tspan>
                              ))
                          : t(s.name)}
                      </text>
                    </g>
                  )
                })}

                {/* Crane silhouettes over the yard */}
                <g
                  className="pointer-events-none"
                  stroke="currentColor"
                  strokeOpacity="0.45"
                  fill="none"
                >
                  <path d="M70 320 V230 H150 M70 240 L100 230" />
                  <path d="M180 320 V250 H120" />
                </g>

                {zone.route && (
                  <path
                    key={active}
                    d={zone.route}
                    fill="none"
                    className="ruta stroke-acento"
                    strokeWidth="3"
                    strokeDasharray="2 9"
                    strokeLinecap="round"
                    pathLength={100}
                  />
                )}
                <g className="pointer-events-none">
                  <circle
                    cx={zone.anchor[0]}
                    cy={zone.anchor[1] + 18}
                    r="6"
                    className="fill-acento"
                  />
                  <circle
                    cx={zone.anchor[0]}
                    cy={zone.anchor[1] + 18}
                    r="6"
                    className="pulso fill-none stroke-acento"
                    strokeWidth="2"
                  />
                </g>
                <g className="pointer-events-none">
                  <circle cx="115" cy="130" r="5" className="fill-tinta" />
                  <text
                    x="125"
                    y="160"
                    className="etiqueta fill-tinta text-[12px]"
                  >
                    {t(COPY.venue.entrance)}
                  </text>
                </g>
              </svg>
            </div>
          </div>

          <div className="lg:col-span-4">
            <h3 className="etiqueta text-tenue">{t(COPY.venue.spaces)}</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {SPACES.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    aria-pressed={s.id === active}
                    onClick={() => setActive(s.id)}
                    className={`min-h-11 cursor-pointer rounded-full border px-4 text-sm transition-colors duration-300 ${s.id === active ? 'border-tinta bg-tinta text-fondo' : 'border-linea hover:border-tinta'}`}
                  >
                    {t(s.name)}
                  </button>
                </li>
              ))}
            </ul>

            <div aria-live="polite" className="mt-8 border-t border-linea pt-6">
              <p className="etiqueta text-acento">{t(space.role)}</p>
              <p className="display mt-2 text-4xl">{t(space.name)}</p>
              <p className="prosa mt-3 text-tenue">{t(space.text)}</p>
              <dl className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <dt className="etiqueta text-tenue">{t(COPY.venue.hours)}</dt>
                  <dd className="cifra mt-1">{space.hours}</dd>
                </div>
                {space.capacity > 0 && (
                  <div>
                    <dt className="etiqueta text-tenue">
                      {t(COPY.venue.capacity)}
                    </dt>
                    <dd className="cifra mt-1">
                      {n(space.capacity)} {t(COPY.venue.people)}
                    </dd>
                  </div>
                )}
              </dl>
              {space.walk > 0 && (
                <p className="mt-4 text-sm text-tenue">
                  {fill(t(COPY.venue.walk), { n: space.walk })}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
