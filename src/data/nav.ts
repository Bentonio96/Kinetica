import { COPY } from './copy'

/** Section ids and their labels, in page order: header, menu and footer. */
export const SECTIONS = [
  ['programa', COPY.nav.programa],
  ['lineup', COPY.nav.lineup],
  ['instalaciones', COPY.nav.instalaciones],
  ['recinto', COPY.nav.recinto],
  ['entradas', COPY.nav.entradas],
  ['preguntas', COPY.nav.faq],
] as const
