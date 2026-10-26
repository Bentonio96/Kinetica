/**
 * Regenerates the screenshots in docs/ and the Open Graph image.
 *
 * Needs the dev server (npm run dev): it scrolls through the dev-only
 * window.__lenis handle, because window.scrollTo is overwritten by Lenis on
 * the next frame. Uses the installed Google Chrome.
 *
 * Usage: node scripts/capture.mjs [http://localhost:5173]
 */
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright'

const BASE = process.argv[2] ?? 'http://localhost:5173'
const OUT = 'docs'

const DESKTOP = { width: 1440, height: 900 }
const PHONE = { width: 390, height: 844 }

const SHOTS = [
  { file: '01-hero.jpg', viewport: DESKTOP, section: 'inicio' },
  {
    file: '02-programa.jpg',
    viewport: DESKTOP,
    section: 'programa',
    offset: 260,
  },
  { file: '03-lineup.jpg', viewport: DESKTOP, section: 'lineup', offset: 260 },
  {
    file: '04-instalaciones.jpg',
    viewport: DESKTOP,
    section: 'instalaciones',
    offset: 220,
  },
  {
    file: '05-recinto.jpg',
    viewport: DESKTOP,
    section: 'recinto',
    offset: 240,
  },
  {
    file: '06-entradas.jpg',
    viewport: DESKTOP,
    section: 'entradas',
    offset: 200,
  },
  {
    file: '07-movimiento-reducido.jpg',
    viewport: DESKTOP,
    section: 'lineup',
    offset: 260,
    query: '?reduced=1',
  },
  { file: '08-movil.jpg', viewport: PHONE, section: 'inicio', scale: 2 },
  {
    file: '09-movil-lineup.jpg',
    viewport: PHONE,
    section: 'lineup',
    offset: 300,
    scale: 2,
  },
  {
    file: '10-english.jpg',
    viewport: DESKTOP,
    section: 'programa',
    offset: 260,
    lang: 'en',
  },
]

const browser = await chromium.launch({
  channel: 'chrome',
  args: ['--enable-unsafe-swiftshader', '--use-angle=metal'],
})
await mkdir(OUT, { recursive: true })

async function open(viewport, query = '', lang = 'es', scale = 1) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: scale,
    locale: lang === 'en' ? 'en-GB' : 'es-CL',
  })
  await context.addInitScript((l) => {
    localStorage.setItem('kinetica:lang', l)
  }, lang)
  const page = await context.newPage()
  await page.goto(`${BASE}/${query}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(3000)
  return { context, page }
}

async function go(page, id, offset = 0) {
  await page.evaluate(
    ([target, extra]) => {
      const el = document.getElementById(target)
      if (!el) return
      const y =
        target === 'inicio'
          ? 0
          : el.getBoundingClientRect().top + window.scrollY + extra
      const lenis = window.__lenis
      if (lenis) lenis.scrollTo(y, { immediate: true })
      else window.scrollTo(0, y)
    },
    [id, offset],
  )
  // Park the pointer over the page so the orb and type lean into it.
  await page.mouse.move(
    page.viewportSize().width * 0.62,
    page.viewportSize().height * 0.42,
  )
  await page.waitForTimeout(2600)
}

for (const shot of SHOTS) {
  const { context, page } = await open(
    shot.viewport,
    shot.query,
    shot.lang,
    shot.scale,
  )
  await go(page, shot.section, shot.offset)
  await page.screenshot({
    path: `${OUT}/${shot.file}`,
    type: 'jpeg',
    quality: 82,
  })
  console.log(shot.file)
  await context.close()
}

const { context, page } = await open({ width: 1200, height: 630 })
await go(page, 'inicio')
await page.screenshot({ path: 'public/og.jpg', type: 'jpeg', quality: 84 })
console.log('public/og.jpg')
await context.close()

await browser.close()
