import type { Localized } from '../types'

/** Interface and section copy. Content lists live in their own files. */
export const COPY = {
  skip: { es: 'Saltar al contenido', en: 'Skip to content' },
  language: { es: 'Idioma', en: 'Language' },
  menu: { es: 'Menú', en: 'Menu' },
  sections: { es: 'Secciones', en: 'Sections' },
  siteMap: { es: 'Mapa del sitio', en: 'Site map' },
  close: { es: 'Cerrar', en: 'Close' },
  home: { es: 'Kinetica, inicio', en: 'Kinetica, home' },
  tickets: { es: 'Entradas', en: 'Tickets' },
  motionOff: { es: 'Pausar movimiento', en: 'Pause motion' },
  motionOn: { es: 'Activar movimiento', en: 'Play motion' },

  nav: {
    programa: { es: 'Programa', en: 'Programme' },
    lineup: { es: 'Line-up', en: 'Line-up' },
    instalaciones: { es: 'Instalaciones', en: 'Installations' },
    recinto: { es: 'Recinto', en: 'Venue' },
    entradas: { es: 'Entradas', en: 'Tickets' },
    faq: { es: 'Preguntas', en: 'FAQ' },
  },

  hero: {
    kicker: {
      es: 'Festival de arte, luz, sonido y movimiento',
      en: 'A festival of art, light, sound and motion',
    },
    // The visible wordmark is split into letters; this is what is read.
    title: { es: 'Kinetica 2027', en: 'Kinetica 2027' },
    dates: { es: '18—21 mar 2027', en: '18—21 Mar 2027' },
    datesLong: {
      es: 'Del 18 al 21 de marzo de 2027',
      en: '18 to 21 March 2027',
    },
    place: {
      es: 'Arsenal Norte, Puerto de Valdora',
      en: 'Arsenal Norte, Port of Valdora',
    },
    lede: {
      es: 'Cuatro días en un arsenal portuario donde la luz se escucha, el sonido se mueve y las obras te responden. Doce artistas, cuatro instalaciones, una sola marea.',
      en: 'Four days in a harbour arsenal where light can be heard, sound moves and the works answer back. Twelve artists, four installations, one tide.',
    },
    cta: { es: 'Reservar entradas', en: 'Book tickets' },
    secondary: { es: 'Ver el programa', en: 'See the programme' },
    countdown: { es: 'Faltan', en: 'Starts in' },
    units: {
      days: { es: 'días', en: 'days' },
      hours: { es: 'horas', en: 'hours' },
      minutes: { es: 'min', en: 'min' },
      seconds: { es: 'seg', en: 'sec' },
    },
    countdownSr: {
      es: 'Faltan {n} días para el festival.',
      en: '{n} days until the festival.',
    },
    orbHint: {
      es: 'Mueve el cursor: el orbe te sigue',
      en: 'Move the cursor: the orb follows you',
    },
    scroll: { es: 'Desliza', en: 'Scroll' },
  },

  marquee: [
    { es: 'Luz', en: 'Light' },
    { es: 'Sonido', en: 'Sound' },
    { es: 'Movimiento', en: 'Motion' },
    { es: 'Arte', en: 'Art' },
    { es: 'Marea', en: 'Tide' },
    { es: 'Cuerpo', en: 'Body' },
  ],

  manifesto: {
    label: { es: 'Manifiesto', en: 'Manifesto' },
    text: {
      es: 'Kinetica no se mira desde una silla. Las obras cambian cuando caminas, cuando hablas, cuando la marea sube. Venimos a un arsenal donde se armaban barcos para armar otra cosa: un lugar donde el arte se mueve contigo.',
      en: 'Kinetica is not watched from a seat. The works change when you walk, when you speak, when the tide comes in. We came to an arsenal where ships were built to build something else: a place where art moves with you.',
    },
    stats: [
      { value: 4, label: { es: 'días', en: 'days' } },
      { value: 12, label: { es: 'artistas', en: 'artists' } },
      { value: 4, label: { es: 'instalaciones', en: 'installations' } },
      { value: 6, label: { es: 'espacios', en: 'spaces' } },
    ],
  },

  program: {
    label: { es: 'Programa', en: 'Programme' },
    title: { es: 'Cuatro días, cuatro estados', en: 'Four days, four states' },
    lede: {
      es: 'Cada día tiene su propio tono. Elige uno y las partículas arman la fecha.',
      en: 'Every day has its own tone. Pick one and the particles assemble the date.',
    },
    tabs: { es: 'Días del festival', en: 'Festival days' },
  },

  lineup: {
    label: { es: 'Line-up', en: 'Line-up' },
    title: { es: 'Doce artistas en órbita', en: 'Twelve artists in orbit' },
    lede: {
      es: 'Arrastra el anillo, usa las flechas o toca una tarjeta. Cada obra de las tarjetas se genera a partir del nombre del artista.',
      en: 'Drag the ring, use the arrows or tap a card. The art on each card is generated from the artist’s name.',
    },
    previous: { es: 'Artista anterior', en: 'Previous artist' },
    next: { es: 'Artista siguiente', en: 'Next artist' },
    carousel: { es: 'Line-up de artistas', en: 'Artist line-up' },
    slide: { es: '{n} de {total}', en: '{n} of {total}' },
    drag: { es: 'Arrastra', en: 'Drag' },
    day: { es: 'Día', en: 'Day' },
    stage: { es: 'Espacio', en: 'Space' },
  },

  installations: {
    label: { es: 'Instalaciones', en: 'Installations' },
    title: {
      es: 'Obras que te responden',
      en: 'Works that answer back',
    },
    lede: {
      es: 'Abiertas los cuatro días, de 12:00 a 02:00. No hay fila para mirar: hay fila para entrar en ellas.',
      en: 'Open all four days, 12:00 to 02:00. There is no queue to look: there is a queue to step inside.',
    },
    where: { es: 'Dónde', en: 'Where' },
  },

  venue: {
    label: { es: 'Recinto', en: 'Venue' },
    title: {
      es: 'Un arsenal convertido en escenario',
      en: 'An arsenal turned into a stage',
    },
    lede: {
      es: 'Seis espacios a orillas de la dársena. Elige uno en el mapa o en la lista.',
      en: 'Six spaces along the dock. Pick one on the map or in the list.',
    },
    mapLabel: {
      es: 'Mapa del recinto Arsenal Norte',
      en: 'Map of the Arsenal Norte venue',
    },
    spaces: { es: 'Espacios', en: 'Spaces' },
    hours: { es: 'Horario', en: 'Hours' },
    capacity: { es: 'Aforo', en: 'Capacity' },
    people: { es: 'personas', en: 'people' },
    walk: {
      es: '{n} min a pie desde la entrada',
      en: '{n} min walk from the entrance',
    },
    entrance: { es: 'Entrada', en: 'Entrance' },
    water: { es: 'Dársena', en: 'Dock' },
  },

  ticketsSection: {
    label: { es: 'Entradas', en: 'Tickets' },
    title: { es: 'Elige tu frecuencia', en: 'Pick your frequency' },
    lede: {
      es: 'Precios con todo incluido. Estudiantes y mayores de 65 pagan la mitad con credencial en puerta.',
      en: 'All-in prices. Students and over-65s pay half with ID at the door.',
    },
    quantity: { es: 'Cantidad', en: 'Quantity' },
    less: { es: 'Una entrada menos', en: 'One ticket fewer' },
    more: { es: 'Una entrada más', en: 'One ticket more' },
    total: { es: 'Total', en: 'Total' },
    reserve: { es: 'Reservar', en: 'Reserve' },
    popular: { es: 'El más elegido', en: 'Most chosen' },
    dialogTitle: {
      es: 'Kinetica es un festival ficticio',
      en: 'Kinetica is a fictional festival',
    },
    dialogBody: {
      es: 'Esta página es una pieza de portafolio: no hay entradas a la venta ni se guarda ningún dato. Si fuera real, ahora irías al pago de {qty} × {tier} por {total}.',
      en: 'This page is a portfolio piece: no tickets are on sale and no data is stored. If it were real, you would now go to checkout for {qty} × {tier} at {total}.',
    },
    dialogOk: { es: 'Entendido', en: 'Got it' },
  },

  faq: {
    label: { es: 'Preguntas', en: 'FAQ' },
    title: { es: 'Antes de venir', en: 'Before you come' },
  },

  footer: {
    tagline: {
      es: 'Arte, luz, sonido y movimiento. 18—21 de marzo de 2027.',
      en: 'Art, light, sound and motion. 18—21 March 2027.',
    },
    fiction: {
      es: 'Kinetica, Valdora y sus artistas son ficticios. Pieza de portafolio de Benjamín Peña, hecha desde cero: el orbe, las partículas y las obras de las tarjetas se generan en el navegador.',
      en: 'Kinetica, Valdora and its artists are fictional. A portfolio piece by Benjamín Peña, built from scratch: the orb, the particles and the card art are generated in the browser.',
    },
    source: { es: 'Código fuente', en: 'Source code' },
    top: { es: 'Volver arriba', en: 'Back to top' },
  },
} as const satisfies Record<string, unknown>

export type Copy = typeof COPY
export type { Localized }
