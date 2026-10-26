import { COPY } from '../../data/copy'
import { SECTIONS } from '../../data/nav'
import { useLanguage } from '../../i18n/useLanguage'
import { scrollToTarget } from '../../lib/scroll'
import { KineticWord } from '../KineticWord'
import { Magnetic } from '../Magnetic'

export function Footer() {
  const { t } = useLanguage()
  return (
    <footer
      data-escena="noche"
      className="escena-noche relative overflow-x-clip"
    >
      <div className="mx-auto max-w-[90rem] px-4 pt-20 pb-10 md:px-8 md:pt-28">
        <div className="grid gap-10 md:grid-cols-12">
          <p className="display text-3xl md:col-span-5 md:text-4xl">
            {t(COPY.footer.tagline)}
          </p>
          <nav
            aria-label={t(COPY.siteMap)}
            className="md:col-span-3 md:col-start-7"
          >
            <ul className="space-y-1">
              {SECTIONS.map(([id, label]) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className="inline-flex min-h-8 items-center text-tenue no-underline transition-colors hover:text-tinta"
                  >
                    {t(label)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex flex-col items-start gap-4 md:col-span-3">
            <a
              href="https://github.com/Bentonio96/Kinetica"
              className="inline-flex min-h-11 items-center text-tinta underline decoration-linea underline-offset-4 transition-colors hover:decoration-acento"
            >
              {t(COPY.footer.source)}
            </a>
            <Magnetic>
              <button
                type="button"
                onClick={() => scrollToTarget(0)}
                className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-linea px-5 transition-colors hover:border-tinta"
              >
                {t(COPY.footer.top)} <span aria-hidden="true">↑</span>
              </button>
            </Magnetic>
          </div>
        </div>

        <p className="display mt-16 text-center text-[clamp(3.6rem,19.5vw,17rem)] uppercase md:mt-24">
          <KineticWord
            text="Kinetica"
            label="Kinetica"
            className="block"
            rest={{ wght: 250, wdth: 75 }}
          />
        </p>

        <p className="mt-8 max-w-3xl text-sm text-tenue">
          {t(COPY.footer.fiction)}
        </p>
      </div>
    </footer>
  )
}
