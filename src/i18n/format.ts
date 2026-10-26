import type { Lang, Localized } from '../types'

/**
 * Spanish writes 1.200 and 4,5; English writes 1,200 and 4.5. Every figure on
 * the page goes through here, so the two languages cannot disagree.
 */
const LOCALES: Record<Lang, string> = {
  es: 'es-CL',
  en: 'en-GB',
}

/** Cached because counters call this on every animation frame. */
const formatterCache = new Map<string, Intl.NumberFormat>()

function getFormatter(lang: Lang, decimals: number): Intl.NumberFormat {
  const key = `${lang}:${decimals}`
  const cached = formatterCache.get(key)
  if (cached) return cached

  const formatter = new Intl.NumberFormat(LOCALES[lang], {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  formatterCache.set(key, formatter)
  return formatter
}

export function formatNumber(value: number, lang: Lang, decimals = 0): string {
  return getFormatter(lang, decimals).format(value)
}

/** Prices are fictional, in euros, written the local way: 48 € or €48. */
export function formatPrice(value: number, lang: Lang): string {
  return new Intl.NumberFormat(LOCALES[lang], {
    style: 'currency',
    currency: 'EUR',
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: 0,
  }).format(value)
}

/** Pick the current language out of a Localized pair. */
export function t(entry: Localized, lang: Lang): string {
  return entry[lang]
}

/**
 * Fill {name} placeholders. Used instead of concatenation because word order
 * differs between the two languages — "3 de 7" and "3 of 7" happen to match,
 * but "faltan {n} días" and "{n} days to go" do not.
 */
export function fill(
  template: string,
  vars: Readonly<Record<string, string | number>>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = vars[key]
    return value === undefined ? match : String(value)
  })
}
