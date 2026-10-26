/**
 * The Cordillera lesson, as a script: at every width, walk the page section
 * by section, screenshot it, and flag anything that is cut off.
 *
 * Flags:
 *  - horizontal page scroll (document wider than the viewport);
 *  - text whose box is narrower or shorter than its content inside an
 *    element that clips (overflow hidden/clip), including headings;
 *  - text that sticks out past the viewport edge, outside the two places
 *    that clip on purpose (the marquee and the line-up ring).
 *
 * Usage: npm run dev, then node scripts/clip-check.mjs [url] [out-dir]
 * Uses the installed Google Chrome.
 */
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright'

const BASE = process.argv[2] ?? 'http://localhost:5173'
const OUT = process.argv[3] ?? 'docs/.clip'
const QUERY = process.argv[4] ?? ''

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'laptop', width: 1280, height: 720 },
  { name: 'tablet-h', width: 1024, height: 768 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'phone', width: 390, height: 844, mobile: true },
  { name: 'phone-s', width: 360, height: 640, mobile: true },
]

const SECTIONS = [
  'inicio',
  'manifiesto',
  'programa',
  'lineup',
  'instalaciones',
  'recinto',
  'entradas',
  'preguntas',
  'pie',
]

const browser = await chromium.launch({
  channel: 'chrome',
  args: ['--enable-unsafe-swiftshader', '--use-angle=metal'],
})
await mkdir(OUT, { recursive: true })
let problems = 0

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    isMobile: vp.mobile ?? false,
    hasTouch: vp.mobile ?? false,
  })
  const page = await context.newPage()
  await page.goto(`${BASE}/${QUERY}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(2500)

  for (const id of SECTIONS) {
    await page.evaluate((target) => {
      const el =
        target === 'pie'
          ? document.querySelector('footer')
          : document.getElementById(target)
      if (!el) return
      const y = el.getBoundingClientRect().top + window.scrollY
      const lenis = window.__lenis
      if (lenis) lenis.scrollTo(y, { immediate: true })
      else window.scrollTo(0, y)
    }, id)
    await page.waitForTimeout(1600)
    await page.screenshot({
      path: `${OUT}/${vp.name}-${id}.jpg`,
      type: 'jpeg',
      quality: 70,
    })
  }

  const found = await page.evaluate(() => {
    const out = []
    const de = document.documentElement
    if (de.scrollWidth > window.innerWidth + 1)
      out.push(
        `page scrolls sideways: ${de.scrollWidth} > ${window.innerWidth}`,
      )

    const skip = (el) =>
      el.closest('[aria-hidden="true"], .sr-only, dialog:not([open])')
    const describe = (el) =>
      `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''} "${(el.textContent ?? '').trim().slice(0, 40)}"`

    // Every visible text node: measure the glyph boxes themselves, then
    // compare them with each ancestor that clips on that axis.
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
    )
    const range = document.createRange()
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const el = node.parentElement
      if (!el || !node.textContent.trim() || skip(el)) continue
      if (el.closest('[data-cinta]')) continue
      // The ring's side cards leave the screen by design; the front one may not.
      const card = el.closest('[aria-roledescription] [style*="translateZ"]')
      if (card && !card.hasAttribute('aria-current')) continue
      range.selectNodeContents(node)
      const r = range.getBoundingClientRect()
      if (!r.width || !r.height) continue
      for (let a = el; a && a !== document.body; a = a.parentElement) {
        const st = getComputedStyle(a)
        const box = a.getBoundingClientRect()
        if (
          /(hidden|clip)/.test(st.overflowX) &&
          (r.left < box.left - 1 || r.right > box.right + 1)
        )
          out.push(`clipped horizontally by ${describe(a)}: ${describe(el)}`)
        if (
          /(hidden|clip)/.test(st.overflowY) &&
          (r.top < box.top - 1 || r.bottom > box.bottom + 1)
        )
          out.push(`clipped vertically by ${describe(a)}: ${describe(el)}`)
        const cp = st.clipPath
        if (cp && cp !== 'none')
          out.push(`clip-path on ${describe(a)} over ${describe(el)}`)
      }
      if (
        !el.closest('[aria-roledescription]') &&
        (r.right > window.innerWidth + 1 || r.left < -1)
      )
        out.push(
          `past the edge: ${describe(el)} [${Math.round(r.left)}, ${Math.round(r.right)}]`,
        )
    }
    return out
  })
  console.log(`${vp.name} (${vp.width}×${vp.height}): ${found.length} problems`)
  for (const f of found) console.log(`  ${f}`)
  problems += found.length
  await context.close()
}

await browser.close()
process.exit(problems ? 1 : 0)
