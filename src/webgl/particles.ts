/**
 * Particle forms on a 2D canvas: a cloud of points that assembles into
 * whatever text it is given (the day of the month in the programme), bursts
 * apart when the text changes and scatters away from the pointer.
 *
 * Canvas 2D rather than WebGL: a couple of thousand points with spring
 * physics is cheap on the CPU and needs no shader warm-up. The loop runs only
 * while the canvas is on screen, and stops by itself once the cloud settles
 * and the pointer is away.
 */

export interface ParticleOptions {
  readonly count: number
  /** Draw the settled shape once and never animate (reduced motion). */
  readonly still: boolean
  readonly font: string
}

export interface ParticleField {
  setText(text: string): void
  setVisible(visible: boolean): void
  destroy(): void
}

// Ink plus a spectral spread; ink dominates so the shape reads as type.
const PALETTE = [
  '#141217',
  '#141217',
  '#141217',
  '#3a2ae0',
  '#e0458f',
  '#1f9e8f',
  '#e07a2a',
]

export function createParticles(
  canvas: HTMLCanvasElement,
  { count, still, font }: ParticleOptions,
): ParticleField | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const px = new Float32Array(count)
  const py = new Float32Array(count)
  const vx = new Float32Array(count)
  const vy = new Float32Array(count)
  const tx = new Float32Array(count)
  const ty = new Float32Array(count)
  const size = new Float32Array(count)
  const colour = new Uint8Array(count)

  let width = 0
  let height = 0
  let dpr = 1
  let text = ''
  let raf = 0
  let visible = false
  let calm = 0
  const pointer = { x: -9999, y: -9999, active: false }

  for (let i = 0; i < count; i++) {
    size[i] = 1.3 + Math.random() * 1.9
    colour[i] = Math.floor(Math.random() * PALETTE.length)
  }

  function measure() {
    const rect = canvas.getBoundingClientRect()
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    width = rect.width
    height = rect.height
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
  }

  /** Sample the glyphs of `text` into `count` target points. */
  function sample() {
    if (!width || !height) return
    const off = document.createElement('canvas')
    const sw = Math.round(width / 2)
    const sh = Math.round(height / 2)
    off.width = sw
    off.height = sh
    const o = off.getContext('2d', { willReadFrequently: true })
    if (!o) return
    let fontSize = sh * 0.92
    o.font = `800 ${fontSize}px ${font}`
    const measured = o.measureText(text).width
    if (measured > sw * 0.9) fontSize *= (sw * 0.9) / measured
    o.font = `800 ${fontSize}px ${font}`
    o.textAlign = 'center'
    o.textBaseline = 'middle'
    o.fillStyle = '#000'
    o.fillText(text, sw / 2, sh / 2 + fontSize * 0.05)
    const data = o.getImageData(0, 0, sw, sh).data
    const points: number[] = []
    const step = Math.max(1, Math.round(Math.sqrt((sw * sh) / (count * 9))))
    for (let y = 0; y < sh; y += step)
      for (let x = 0; x < sw; x += step)
        if ((data[(y * sw + x) * 4 + 3] ?? 0) > 128) points.push(x * 2, y * 2)
    const n = points.length / 2
    if (!n) return
    for (let i = 0; i < count; i++) {
      const k = Math.floor(Math.random() * n) * 2
      tx[i] = (points[k] ?? 0) + (Math.random() - 0.5) * step * 1.6
      ty[i] = (points[k + 1] ?? 0) + (Math.random() - 0.5) * step * 1.6
    }
  }

  function scatterStart() {
    for (let i = 0; i < count; i++) {
      px[i] = Math.random() * width
      py[i] = Math.random() * height
    }
  }

  function draw() {
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx!.clearRect(0, 0, width, height)
    for (let c = 0; c < PALETTE.length; c++) {
      ctx!.fillStyle = PALETTE[c] ?? '#141217'
      ctx!.beginPath()
      for (let i = 0; i < count; i++) {
        if (colour[i] !== c) continue
        const s = size[i] ?? 1
        ctx!.rect((px[i] ?? 0) - s / 2, (py[i] ?? 0) - s / 2, s, s)
      }
      ctx!.fill()
    }
  }

  function step() {
    let energy = 0
    const r = Math.min(width, height) * 0.16
    const r2 = r * r
    for (let i = 0; i < count; i++) {
      let ax = ((tx[i] ?? 0) - (px[i] ?? 0)) * 0.018
      let ay = ((ty[i] ?? 0) - (py[i] ?? 0)) * 0.018
      if (pointer.active) {
        const dx = (px[i] ?? 0) - pointer.x
        const dy = (py[i] ?? 0) - pointer.y
        const d2 = dx * dx + dy * dy
        if (d2 < r2 && d2 > 0.01) {
          const f = (1 - d2 / r2) * 2.4
          const d = Math.sqrt(d2)
          ax += (dx / d) * f
          ay += (dy / d) * f
        }
      }
      const nvx = ((vx[i] ?? 0) + ax) * 0.86
      const nvy = ((vy[i] ?? 0) + ay) * 0.86
      vx[i] = nvx
      vy[i] = nvy
      px[i] = (px[i] ?? 0) + nvx
      py[i] = (py[i] ?? 0) + nvy
      energy += Math.abs(nvx) + Math.abs(nvy)
    }
    return energy / count
  }

  function tick() {
    raf = 0
    const energy = step()
    draw()
    calm = energy < 0.02 && !pointer.active ? calm + 1 : 0
    if (visible && calm < 30) raf = requestAnimationFrame(tick)
  }

  function wake() {
    calm = 0
    if (!still && visible && !raf) raf = requestAnimationFrame(tick)
  }

  function settle() {
    for (let i = 0; i < count; i++) {
      px[i] = tx[i] ?? 0
      py[i] = ty[i] ?? 0
    }
    draw()
  }

  const onMove = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect()
    pointer.x = event.clientX - rect.left
    pointer.y = event.clientY - rect.top
    pointer.active = true
    wake()
  }
  const onLeave = () => {
    pointer.active = false
    wake()
  }
  const onResize = () => {
    measure()
    sample()
    if (still) settle()
    else wake()
  }

  measure()
  scatterStart()
  if (!still) {
    canvas.addEventListener('pointermove', onMove, { passive: true })
    canvas.addEventListener('pointerleave', onLeave)
  }
  const observer = new ResizeObserver(onResize)
  observer.observe(canvas)

  return {
    setText(next) {
      if (next === text) return
      text = next
      sample()
      if (still) {
        settle()
        return
      }
      // A burst outwards, so the change reads as a reassembly.
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2
        const f = 4 + Math.random() * 10
        vx[i] = (vx[i] ?? 0) + Math.cos(a) * f
        vy[i] = (vy[i] ?? 0) + Math.sin(a) * f
      }
      wake()
    },
    setVisible(next) {
      visible = next
      if (next) wake()
    },
    destroy() {
      if (raf) cancelAnimationFrame(raf)
      observer.disconnect()
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerleave', onLeave)
    },
  }
}
