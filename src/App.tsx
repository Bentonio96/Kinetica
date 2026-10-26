import { Cursor } from './components/Cursor'
import { Header } from './components/Header'
import { SmoothScroll } from './components/SmoothScroll'
import { Faq } from './components/sections/Faq'
import { Footer } from './components/sections/Footer'
import { Hero } from './components/sections/Hero'
import { Installations } from './components/sections/Installations'
import { Lineup } from './components/sections/Lineup'
import { Manifesto } from './components/sections/Manifesto'
import { Program } from './components/sections/Program'
import { Tickets } from './components/sections/Tickets'
import { Venue } from './components/sections/Venue'
import { LanguageProvider } from './i18n/LanguageProvider'
import { MQ, ScrollTrigger, gsap, useGSAP } from './lib/gsap'

/**
 * The lights going down: while a night section holds the middle of the
 * screen, the whole page turns to `noche`, and back to paper after it. Under
 * reduced motion (and before JS) night sections paint themselves instead.
 */
function useSceneFlip() {
  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add(MQ.motion, () => {
      const html = document.documentElement
      html.dataset.flip = ''
      const active = new Set<Element>()
      const triggers = gsap.utils
        .toArray<HTMLElement>('[data-escena="noche"]')
        .map((el) =>
          ScrollTrigger.create({
            trigger: el,
            start: 'top 55%',
            end: 'bottom 55%',
            onToggle: (self) => {
              if (self.isActive) active.add(el)
              else active.delete(el)
              if (active.size) html.dataset.escena = 'noche'
              else delete html.dataset.escena
            },
          }),
        )
      return () => {
        triggers.forEach((trigger) => trigger.kill())
        delete html.dataset.flip
        delete html.dataset.escena
      }
    })
    return () => mm.revert()
  })
}

function Page() {
  useSceneFlip()
  return (
    <>
      <Header />
      <main id="contenido" tabIndex={-1} className="outline-none">
        <Hero />
        <Manifesto />
        <Program />
        <Lineup />
        <Installations />
        <Venue />
        <Tickets />
        <Faq />
      </main>
      <Footer />
      <Cursor />
    </>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <SmoothScroll>
        <Page />
      </SmoothScroll>
    </LanguageProvider>
  )
}
