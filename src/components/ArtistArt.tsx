import { memo, type ReactNode } from 'react'
import type { ArtShape } from '../data/festival'

/** Small deterministic PRNG, so each artist always gets the same artwork. */
function seeded(text: string) {
  let h = 2166136261
  for (const ch of text) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  // Avalanche, so similar names do not start from similar numbers.
  h ^= h >>> 16
  h = Math.imul(h, 0x85ebca6b)
  h ^= h >>> 13
  h = Math.imul(h, 0xc2b2ae35)
  h ^= h >>> 16
  let a = h >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const W = 300
const H = 420

function shapes(kind: ArtShape, rnd: () => number) {
  const out: ReactNode[] = []
  const cx = W * (0.3 + rnd() * 0.4)
  const cy = H * (0.3 + rnd() * 0.3)
  switch (kind) {
    case 'anillos':
      for (let i = 1; i <= 11; i++)
        out.push(<circle key={i} cx={cx + i * 3} cy={cy} r={i * 17} />)
      break
    case 'ondas':
      for (let i = 0; i < 16; i++) {
        const y = 40 + i * 24
        const amp = 8 + rnd() * 22
        const f = 0.02 + rnd() * 0.02
        let d = `M -10 ${y}`
        for (let x = -10; x <= W + 10; x += 10)
          d += ` L ${x} ${(y + Math.sin(x * f + i * 0.6) * amp).toFixed(1)}`
        out.push(<path key={i} d={d} />)
      }
      break
    case 'rejilla':
      for (let y = 30; y < H; y += 26)
        for (let x = 24; x < W; x += 26) {
          const d = Math.hypot(x - cx, y - cy)
          const r = Math.max(0.6, 9 - d / 26 + rnd() * 1.5)
          out.push(
            <circle
              key={`${x}-${y}`}
              cx={x}
              cy={y}
              r={r}
              className="fill-current"
            />,
          )
        }
      break
    case 'orbita':
      for (let i = 0; i < 9; i++)
        out.push(
          <ellipse
            key={i}
            cx={cx}
            cy={cy + 40}
            rx={40 + i * 16}
            ry={14 + i * 7}
            transform={`rotate(${-24 + i * 6} ${cx} ${cy + 40})`}
          />,
        )
      out.push(
        <circle
          key="sol"
          cx={cx}
          cy={cy + 40}
          r={18}
          className="fill-current"
        />,
      )
      break
    case 'haz':
      for (let i = 0; i < 26; i++) {
        const a = -Math.PI * 0.95 + (i / 25) * Math.PI * 0.9 + rnd() * 0.02
        out.push(
          <line
            key={i}
            x1={cx}
            y1={H + 20}
            x2={cx + Math.cos(a) * 640}
            y2={H + 20 + Math.sin(a) * 640}
          />,
        )
      }
      break
    case 'pliegue':
      for (let i = 0; i < 14; i++) {
        const y = 20 + i * 30
        const k = 40 + rnd() * 120
        out.push(
          <path
            key={i}
            d={`M -10 ${y} L ${k} ${y + 34} L ${W - k / 2} ${y - 10} L ${W + 10} ${y + 22}`}
          />,
        )
      }
      break
  }
  return out
}

/**
 * Generated artwork for a line-up card: a gradient field and a line drawing,
 * both varied from the artist's name. The base hue comes from the card's
 * place in the ring (golden-angle steps), so neighbours never share a colour.
 * No images, so nothing to download and nothing that looks like stock.
 */
export const ArtistArt = memo(function ArtistArt({
  name,
  shape,
  index,
}: {
  name: string
  shape: ArtShape
  index: number
}) {
  const rnd = seeded(name)
  const h1 = Math.floor((index * 137.508 + 330 + rnd() * 20) % 360)
  const h2 = (h1 + 60 + Math.floor(rnd() * 120)) % 360
  const h3 = (h2 + 90 + Math.floor(rnd() * 60)) % 360
  const id = `a-${name.replace(/\W/g, '')}`
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 size-full"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`${id}-a`} cx="25%" cy="20%" r="85%">
          <stop offset="0" stopColor={`hsl(${h1} 85% 66%)`} />
          <stop offset="1" stopColor={`hsl(${h1} 70% 18%)`} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-b`} cx="85%" cy="85%" r="80%">
          <stop offset="0" stopColor={`hsl(${h2} 90% 60%)`} />
          <stop offset="1" stopColor={`hsl(${h2} 80% 20%)`} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill={`hsl(${h3} 45% 12%)`} />
      <rect width={W} height={H} fill={`url(#${id}-a)`} />
      <rect width={W} height={H} fill={`url(#${id}-b)`} />
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        className="text-white/70"
        strokeLinecap="round"
      >
        {shapes(shape, rnd)}
      </g>
    </svg>
  )
})
