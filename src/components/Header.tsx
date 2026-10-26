import { useEffect, useRef, useState } from 'react'
import { COPY } from '../data/copy'
import { useReducedMotion } from '../hooks/useMediaQuery'
import { useLanguage } from '../i18n/useLanguage'
import { scrollToTarget } from '../lib/scroll'
import { SECTIONS } from '../data/nav'
import { LANGUAGES } from '../types'
import { Magnetic } from './Magnetic'

/**
 * Everything on the page that moves on its own (orb, marquee, ring, the
 * installation pieces) stops with this switch, which reloads into the
 * reduced-motion build: WCAG 2.2.2 asks for a way to pause it.
 */
function MotionToggle({ className = '' }: { className?: string }) {
  const { t } = useLanguage()
  const reduced = useReducedMotion()
  const href = () => {
    const url = new URL(window.location.href)
    url.searchParams.set('reduced', reduced ? '0' : '1')
    return url.toString()
  }
  return (
    <button
      type="button"
      onClick={() => window.location.assign(href())}
      className={`etiqueta min-h-11 cursor-pointer items-center gap-2 px-2 text-tenue transition-colors hover:text-tinta ${className}`}
    >
      <span aria-hidden="true" className="relative flex size-2.5">
        {!reduced && (
          <span className="absolute inset-0 animate-ping rounded-full bg-acento/60 motion-reduce:animate-none" />
        )}
        <span
          className={`relative size-2.5 rounded-full ${reduced ? 'border border-current' : 'bg-acento'}`}
        />
      </span>
      {t(reduced ? COPY.motionOn : COPY.motionOff)}
    </button>
  )
}

function go(id: string) {
  scrollToTarget(`#${id}`)
  const heading = document.querySelector<HTMLElement>(`#${id} h2`)
  heading?.setAttribute('tabindex', '-1')
  heading?.focus({ preventScroll: true })
}

export function Header() {
  const { t, lang, setLang } = useLanguage()
  const menu = useRef<HTMLDialogElement>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const languages = (
    <div
      role="group"
      aria-label={t(COPY.language)}
      className="etiqueta flex items-center"
    >
      {LANGUAGES.map((code) => (
        <button
          key={code}
          type="button"
          lang={code}
          aria-pressed={lang === code}
          onClick={() => setLang(code)}
          className={`min-h-11 min-w-11 cursor-pointer px-2 uppercase transition-colors duration-300 ${lang === code ? 'text-acento underline decoration-1 underline-offset-4' : 'text-tenue hover:text-tinta'}`}
        >
          <span aria-hidden="true">{code}</span>
          <span className="sr-only">
            {code === 'es' ? 'Español' : 'English'}
          </span>
        </button>
      ))}
    </div>
  )

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-500 ${scrolled ? 'border-b border-linea bg-fondo' : 'border-b border-transparent'}`}
    >
      <a
        href="#contenido"
        onClick={(event) => {
          event.preventDefault()
          scrollToTarget('#contenido')
          document.getElementById('contenido')?.focus({ preventScroll: true })
        }}
        className="etiqueta sr-only bg-tinta px-3 py-2 text-fondo focus:not-sr-only focus:absolute focus:top-3 focus:left-4"
      >
        {t(COPY.skip)}
      </a>
      <div className="mx-auto flex h-16 max-w-[90rem] items-center justify-between gap-4 px-4 md:h-[4.5rem] md:px-8">
        <a
          href="#inicio"
          aria-label={t(COPY.home)}
          onClick={(event) => {
            event.preventDefault()
            scrollToTarget(0)
          }}
          className="display flex items-center gap-2 text-xl tracking-tight no-underline"
        >
          <span
            aria-hidden="true"
            className="size-4 rounded-full bg-[conic-gradient(from_200deg,#ff9ac8,#ffd59a,#92e3ff,#b7a8ff,#ff9ac8)]"
          />
          Kinetica
        </a>

        <nav aria-label={t(COPY.sections)} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {SECTIONS.map(([id, label]) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={(event) => {
                    event.preventDefault()
                    go(id)
                  }}
                  className="group relative inline-flex min-h-11 items-center px-3 text-sm text-tenue no-underline transition-colors hover:text-tinta"
                >
                  {t(label)}
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-3 bottom-2.5 h-px origin-right scale-x-0 bg-current transition-transform duration-300 ease-salida group-hover:origin-left group-hover:scale-x-100"
                  />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <MotionToggle className="hidden xl:inline-flex" />
          <div className="hidden sm:block">{languages}</div>
          <Magnetic>
            <a
              href="#entradas"
              onClick={(event) => {
                event.preventDefault()
                go('entradas')
              }}
              className="hidden min-h-11 items-center rounded-full bg-tinta px-5 text-sm font-medium text-fondo no-underline transition-colors hover:bg-acento sm:inline-flex"
            >
              {t(COPY.tickets)}
            </a>
          </Magnetic>
          <button
            type="button"
            onClick={() => menu.current?.showModal()}
            aria-haspopup="dialog"
            className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-linea px-4 text-sm lg:hidden"
          >
            {t(COPY.menu)}
          </button>
        </div>
      </div>

      <dialog
        ref={menu}
        aria-label={t(COPY.menu)}
        className="m-0 h-dvh max-h-none w-full max-w-none bg-fondo p-0 text-tinta"
      >
        <div className="flex h-full flex-col px-4 pt-4 pb-8">
          <div className="flex items-center justify-between">
            {languages}
            <button
              type="button"
              onClick={() => menu.current?.close()}
              className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full border border-linea px-4 text-sm"
            >
              {t(COPY.close)}
            </button>
          </div>
          <MotionToggle className="mt-4 inline-flex self-start" />
          <nav aria-label={t(COPY.menu)} className="mt-auto">
            <ul className="space-y-1">
              {SECTIONS.map(([id, label], i) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    onClick={(event) => {
                      event.preventDefault()
                      menu.current?.close()
                      go(id)
                    }}
                    className="titulo flex items-baseline gap-3 py-1 no-underline"
                  >
                    <span className="etiqueta text-tenue">0{i + 1}</span>
                    {t(label)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </dialog>
    </header>
  )
}
