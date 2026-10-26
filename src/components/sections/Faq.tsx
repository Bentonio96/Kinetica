import { COPY } from '../../data/copy'
import { FAQS } from '../../data/festival'
import { useLanguage } from '../../i18n/useLanguage'
import { Reveal } from '../Reveal'

/** Native <details>: keyboard and screen readers for free; the height
 * animates with ::details-content where the browser supports it. */
export function Faq() {
  const { t } = useLanguage()
  return (
    <section
      id="preguntas"
      aria-labelledby="preguntas-titulo"
      className="relative"
    >
      <div className="mx-auto grid max-w-[90rem] gap-10 px-4 py-20 md:grid-cols-12 md:px-8 md:py-28">
        <div className="md:col-span-4">
          <p className="etiqueta text-tenue">{t(COPY.faq.label)}</p>
          <Reveal
            id="preguntas-titulo"
            text={t(COPY.faq.title)}
            className="titulo mt-6"
          />
        </div>
        <div className="border-t border-linea md:col-span-8">
          {FAQS.map((item, i) => (
            <details
              key={item.q.en}
              className="pregunta group border-b border-linea"
              open={i === 0}
            >
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-6 py-6 text-lg font-medium md:text-xl">
                {t(item.q)}
                <span
                  aria-hidden="true"
                  className="relative size-4 shrink-0 before:absolute before:inset-x-0 before:top-1/2 before:h-0.5 before:-translate-y-1/2 before:bg-current after:absolute after:inset-y-0 after:left-1/2 after:w-0.5 after:-translate-x-1/2 after:bg-current after:transition-transform after:duration-500 after:ease-salida group-open:after:scale-y-0"
                />
              </summary>
              <p className="prosa max-w-2xl pb-7 text-tenue">{t(item.a)}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
