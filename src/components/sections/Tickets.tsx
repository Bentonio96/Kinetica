import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { COPY } from '../../data/copy'
import { TIERS } from '../../data/festival'
import { useFinePointer, useReducedMotion } from '../../hooks/useMediaQuery'
import { fill, formatPrice } from '../../i18n/format'
import { useLanguage } from '../../i18n/useLanguage'
import { Magnetic } from '../Magnetic'
import { Reveal } from '../Reveal'

const MAX = 8

/**
 * Three passes as a radio group. Each card is a holographic foil that tilts
 * and catches the light under the pointer. "Reserve" opens a native dialog
 * that says plainly the festival is fictional.
 */
export function Tickets() {
  const { t, lang } = useLanguage()
  const fine = useFinePointer()
  const reduced = useReducedMotion()
  const [tier, setTier] = useState('festival')
  const [qty, setQty] = useState(2)
  const dialog = useRef<HTMLDialogElement>(null)

  const chosen = TIERS.find((x) => x.id === tier) ?? TIERS[0]!
  const total = formatPrice(chosen.price * qty, lang)

  const onMove = (event: ReactPointerEvent<HTMLLabelElement>) => {
    const el = event.currentTarget
    const r = el.getBoundingClientRect()
    const x = (event.clientX - r.left) / r.width
    const y = (event.clientY - r.top) / r.height
    el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`)
    el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`)
    el.style.setProperty('--giro', `${(x * 220).toFixed(0)}deg`)
    if (fine && !reduced)
      el.style.transform = `perspective(900px) rotateX(${((0.5 - y) * 10).toFixed(2)}deg) rotateY(${((x - 0.5) * 12).toFixed(2)}deg)`
  }
  const onLeave = (event: ReactPointerEvent<HTMLLabelElement>) => {
    event.currentTarget.style.transform = ''
  }

  return (
    <section
      id="entradas"
      aria-labelledby="entradas-titulo"
      className="relative"
    >
      <div className="mx-auto max-w-[90rem] px-4 py-20 md:px-8 md:py-28">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <p className="etiqueta text-tenue md:col-span-3">
            {t(COPY.ticketsSection.label)}
          </p>
          <Reveal
            id="entradas-titulo"
            text={t(COPY.ticketsSection.title)}
            className="titulo md:col-span-6"
          />
          <p className="prosa text-tenue md:col-span-3">
            {t(COPY.ticketsSection.lede)}
          </p>
        </div>

        <fieldset className="mt-12">
          <legend className="sr-only">{t(COPY.ticketsSection.title)}</legend>
          <div className="grid gap-5 md:grid-cols-3">
            {TIERS.map((x) => {
              const on = x.id === tier
              return (
                <label
                  key={x.id}
                  onPointerMove={onMove}
                  onPointerLeave={onLeave}
                  className={`group relative flex cursor-pointer flex-col rounded-3xl border p-6 transition-[transform,border-color,box-shadow] duration-500 ease-salida has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-acento md:p-7 ${on ? 'border-tinta shadow-[0_18px_40px_-24px_rgb(20_18_23/0.6)]' : 'border-linea hover:border-tinta/50'}`}
                >
                  <input
                    type="radio"
                    name="pase"
                    value={x.id}
                    checked={on}
                    onChange={() => setTier(x.id)}
                    className="sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={`foil pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-500 ${on ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'}`}
                  />
                  <span className="relative flex items-start justify-between gap-4">
                    <span className="display text-3xl">{t(x.name)}</span>
                    <span
                      aria-hidden="true"
                      className={`mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-tinta ${on ? 'bg-tinta' : ''}`}
                    >
                      {on && <span className="size-2 rounded-full bg-fondo" />}
                    </span>
                  </span>
                  {x.popular && (
                    <span className="etiqueta relative mt-3 w-fit rounded-full bg-tinta px-3 py-1 text-fondo">
                      {t(COPY.ticketsSection.popular)}
                    </span>
                  )}
                  <span className="display relative mt-8 text-6xl">
                    {formatPrice(x.price, lang)}
                  </span>
                  <span className="relative mt-1 text-sm text-tenue">
                    {t(x.note)}
                  </span>
                  <ul className="relative mt-6 space-y-2 border-t border-tinta/15 pt-5 text-[0.95rem]">
                    {x.perks.map((perk) => (
                      <li key={perk.en} className="flex gap-3">
                        <span
                          aria-hidden="true"
                          className="mt-2 size-1.5 shrink-0 rounded-full bg-tinta"
                        />
                        {t(perk)}
                      </li>
                    ))}
                  </ul>
                </label>
              )
            })}
          </div>
        </fieldset>

        <div className="mt-8 flex flex-col gap-6 rounded-3xl border border-linea p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
          <div className="flex items-center gap-4">
            <span id="cantidad" className="etiqueta text-tenue">
              {t(COPY.ticketsSection.quantity)}
            </span>
            <div
              role="group"
              aria-labelledby="cantidad"
              className="flex items-center rounded-full border border-linea"
            >
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                aria-label={t(COPY.ticketsSection.less)}
                className="size-11 cursor-pointer rounded-full text-xl disabled:cursor-not-allowed disabled:text-tenue"
              >
                <span aria-hidden="true">−</span>
              </button>
              <output
                aria-live="polite"
                className="cifra w-8 text-center text-lg"
              >
                {qty}
              </output>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(MAX, q + 1))}
                disabled={qty >= MAX}
                aria-label={t(COPY.ticketsSection.more)}
                className="size-11 cursor-pointer rounded-full text-xl disabled:cursor-not-allowed disabled:text-tenue"
              >
                <span aria-hidden="true">+</span>
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between gap-6 sm:justify-end">
            <p>
              <span className="etiqueta block text-tenue">
                {t(COPY.ticketsSection.total)}
              </span>
              <span className="display text-3xl" aria-live="polite">
                {total}
              </span>
            </p>
            <Magnetic>
              <button
                type="button"
                onClick={() => dialog.current?.showModal()}
                className="inline-flex min-h-12 cursor-pointer items-center gap-3 rounded-full bg-tinta px-7 font-medium text-fondo transition-colors duration-300 hover:bg-acento"
              >
                {t(COPY.ticketsSection.reserve)}
                <span aria-hidden="true">→</span>
              </button>
            </Magnetic>
          </div>
        </div>
      </div>

      <dialog
        ref={dialog}
        aria-labelledby="ficticio-titulo"
        className="m-auto w-[min(92vw,30rem)] rounded-3xl bg-papel p-0 text-tinta-papel"
      >
        <div className="relative overflow-hidden rounded-3xl p-7">
          <span
            aria-hidden="true"
            className="foil absolute inset-x-0 top-0 h-2"
          />
          <h2 id="ficticio-titulo" className="display text-3xl">
            {t(COPY.ticketsSection.dialogTitle)}
          </h2>
          <p className="prosa mt-3 text-grafito">
            {fill(t(COPY.ticketsSection.dialogBody), {
              qty,
              tier: t(chosen.name),
              total,
            })}
          </p>
          <form method="dialog" className="mt-6">
            <button
              type="submit"
              autoFocus
              className="inline-flex min-h-12 cursor-pointer items-center rounded-full bg-tinta-papel px-6 font-medium text-papel"
            >
              {t(COPY.ticketsSection.dialogOk)}
            </button>
          </form>
        </div>
      </dialog>
    </section>
  )
}
