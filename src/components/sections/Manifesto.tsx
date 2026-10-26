import { useRef } from 'react'
import { COPY } from '../../data/copy'
import { useLanguage } from '../../i18n/useLanguage'
import { MQ, gsap, useGSAP } from '../../lib/gsap'
import { Marquee } from '../Marquee'

/**
 * The manifesto lights up word by word as it is read (from `tenue` to
 * `tinta`, both above AA), and the figures count up once. Under reduced motion it is plain text.
 */
export function Manifesto() {
  const { t, n, lang } = useLanguage()
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        // A 0–1 "light" per word, mixed between the scene's two text
        // colours in CSS, so it stays right if the page turns to night.
        gsap.fromTo(
          '[data-encender]',
          { '--luz': 0 },
          {
            '--luz': 1,
            stagger: 0.1,
            ease: 'none',
            scrollTrigger: {
              trigger: '[data-manifiesto]',
              start: 'top 80%',
              end: 'bottom 45%',
              scrub: true,
            },
          },
        )
        gsap.utils.toArray<HTMLElement>('[data-cifra]').forEach((el) => {
          const target = Number(el.dataset.cifra)
          const counter = { v: 0 }
          gsap.to(counter, {
            v: target,
            duration: 1.6,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 90%', once: true },
            onUpdate: () => {
              el.textContent = String(Math.round(counter.v))
            },
          })
        })
      })
      return () => mm.revert()
    },
    { scope: root, dependencies: [lang], revertOnUpdate: true },
  )

  const words = t(COPY.manifesto.text).split(' ')

  return (
    <section
      ref={root}
      id="manifiesto"
      aria-labelledby="manifiesto-titulo"
      className="relative"
    >
      <Marquee />
      <div className="mx-auto grid max-w-[90rem] gap-10 px-4 py-20 md:grid-cols-12 md:px-8 md:py-28">
        <h2
          id="manifiesto-titulo"
          className="etiqueta text-tenue md:col-span-3"
        >
          {t(COPY.manifesto.label)}
        </h2>
        <div className="md:col-span-9">
          <p
            data-manifiesto=""
            className="display text-[clamp(1.7rem,1.2rem+2.4vw,3.6rem)] leading-[1.08] [font-variation-settings:'wght'_420,'wdth'_88,'opsz'_96]"
          >
            {words.map((word, i) => (
              <span key={`${word}-${i}`}>
                <span
                  data-encender=""
                  className="[color:color-mix(in_oklab,var(--tinta)_calc(var(--luz,1)*100%),var(--tenue))]"
                >
                  {word}
                </span>{' '}
              </span>
            ))}
          </p>
          <dl className="mt-14 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-linea pt-8 sm:grid-cols-4">
            {COPY.manifesto.stats.map((stat) => (
              <div key={stat.label.en} className="flex flex-col-reverse gap-1">
                <dt className="etiqueta text-tenue">{t(stat.label)}</dt>
                <dd className="display text-6xl md:text-7xl">
                  <span data-cifra={stat.value}>{n(stat.value)}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
