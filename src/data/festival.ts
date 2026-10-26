import type { Localized } from '../types'

/** Everything here is fictional: the festival, the port and the artists. */

/** Doors of day one, local time in Valdora (UTC+1 in March). */
export const OPENING = '2027-03-18T18:00:00+01:00'

export type SpaceId =
  'nave' | 'darsena' | 'galeria' | 'torre' | 'gruas' | 'muelle'

export interface Space {
  readonly id: SpaceId
  readonly name: Localized
  readonly role: Localized
  readonly text: Localized
  readonly hours: string
  readonly capacity: number
  readonly walk: number
}

export const SPACES: readonly Space[] = [
  {
    id: 'nave',
    name: { es: 'Nave Central', en: 'Central Hall' },
    role: { es: 'Escenario principal', en: 'Main stage' },
    text: {
      es: 'La antigua nave de montaje: 180 metros de largo, techo de vigas y una sala de espejos que gira hacia quien entra.',
      en: 'The old assembly hall: 180 metres long, a girder roof and a hall of mirrors that turns towards whoever walks in.',
    },
    hours: '19:00—03:00',
    capacity: 4200,
    walk: 4,
  },
  {
    id: 'darsena',
    name: { es: 'Dársena', en: 'The Dock' },
    role: { es: 'Escenario sobre el agua', en: 'Stage on the water' },
    text: {
      es: 'Una plataforma flotante. El público mira desde el muelle y el sonido rebota en el agua.',
      en: 'A floating platform. The audience watches from the quay and the sound bounces off the water.',
    },
    hours: '20:00—01:00',
    capacity: 1800,
    walk: 6,
  },
  {
    id: 'galeria',
    name: { es: 'Galería de Luz', en: 'Light Gallery' },
    role: { es: 'Instalaciones', en: 'Installations' },
    text: {
      es: 'Los antiguos almacenes de velas, oscuros a toda hora. Aquí vive el campo de péndulos.',
      en: 'The old sail stores, dark at every hour. The pendulum field lives here.',
    },
    hours: '12:00—02:00',
    capacity: 600,
    walk: 3,
  },
  {
    id: 'torre',
    name: { es: 'Torre del Reloj', en: 'Clock Tower' },
    role: { es: 'Sonido inmersivo', en: 'Immersive sound' },
    text: {
      es: 'Cuatro pisos y 96 parlantes. Cada piso suena distinto; la cámara de ecos está arriba.',
      en: 'Four floors and 96 speakers. Each floor sounds different; the echo chamber is at the top.',
    },
    hours: '14:00—00:00',
    capacity: 240,
    walk: 5,
  },
  {
    id: 'gruas',
    name: { es: 'Patio de Grúas', en: 'Crane Yard' },
    role: { es: 'Comida y descanso', en: 'Food and rest' },
    text: {
      es: 'Doce cocinas del puerto bajo tres grúas iluminadas. Agua gratis y sombra de día.',
      en: 'Twelve port kitchens under three lit cranes. Free water and shade by day.',
    },
    hours: '12:00—03:00',
    capacity: 2500,
    walk: 2,
  },
  {
    id: 'muelle',
    name: { es: 'Muelle Norte', en: 'North Quay' },
    role: { es: 'Entrada y acreditación', en: 'Entrance and wristbands' },
    text: {
      es: 'La puerta del festival. Pulseras, guardarropa, punto accesible y la información de todo el día.',
      en: 'The festival gate. Wristbands, cloakroom, the accessibility point and the day’s information.',
    },
    hours: '11:30—03:30',
    capacity: 0,
    walk: 0,
  },
]

export interface ProgramItem {
  readonly time: string
  readonly title: Localized
  readonly who: string
  readonly space: SpaceId
}

export interface Day {
  readonly date: number
  readonly weekday: Localized
  readonly name: Localized
  readonly mood: Localized
  readonly items: readonly ProgramItem[]
}

export const DAYS: readonly Day[] = [
  {
    date: 18,
    weekday: { es: 'Jueves', en: 'Thursday' },
    name: { es: 'Ignición', en: 'Ignition' },
    mood: {
      es: 'Se encienden las obras. Una noche corta, para entrar en calor.',
      en: 'The works switch on. A short night, to warm up.',
    },
    items: [
      {
        time: '18:00',
        title: { es: 'Apertura de puertas', en: 'Doors open' },
        who: 'Kinetica',
        space: 'muelle',
      },
      {
        time: '19:30',
        title: {
          es: 'Encendido de la sala de espejos',
          en: 'The mirror hall lights up',
        },
        who: 'Aiko Varn',
        space: 'nave',
      },
      {
        time: '21:00',
        title: {
          es: 'Coro para 40 voces y marea',
          en: 'Choir for 40 voices and tide',
        },
        who: 'Lumen Choir',
        space: 'darsena',
      },
      {
        time: '23:00',
        title: { es: 'Código en vivo', en: 'Live code' },
        who: 'Halvard Ims',
        space: 'nave',
      },
    ],
  },
  {
    date: 19,
    weekday: { es: 'Viernes', en: 'Friday' },
    name: { es: 'Resonancia', en: 'Resonance' },
    mood: {
      es: 'El día del sonido. Todo vibra, incluso el piso.',
      en: 'The day of sound. Everything vibrates, the floor included.',
    },
    items: [
      {
        time: '14:00',
        title: {
          es: 'Escucha profunda, piso por piso',
          en: 'Deep listening, floor by floor',
        },
        who: 'Ondine Brask',
        space: 'torre',
      },
      {
        time: '19:00',
        title: { es: 'Percusión para grúas', en: 'Percussion for cranes' },
        who: 'Nara Okafor',
        space: 'gruas',
      },
      {
        time: '21:30',
        title: { es: 'Drones sobre el agua', en: 'Drones over water' },
        who: 'Duo Parallax',
        space: 'darsena',
      },
      {
        time: '00:00',
        title: { es: 'Láser y niebla', en: 'Laser and fog' },
        who: 'Sorelle Quist',
        space: 'nave',
      },
    ],
  },
  {
    date: 20,
    weekday: { es: 'Sábado', en: 'Saturday' },
    name: { es: 'Deriva', en: 'Drift' },
    mood: {
      es: 'La noche larga. Las obras se mueven por el recinto y tú detrás.',
      en: 'The long night. The works move around the venue and you follow.',
    },
    items: [
      {
        time: '16:00',
        title: {
          es: 'Procesión de luz por el muelle',
          en: 'Light procession along the quay',
        },
        who: 'Ilse Montaro',
        space: 'muelle',
      },
      {
        time: '20:00',
        title: {
          es: 'Danza para cuerpos y robots',
          en: 'Dance for bodies and robots',
        },
        who: 'Teo Kassab',
        space: 'nave',
      },
      {
        time: '22:30',
        title: { es: 'Sintetizadores modulares', en: 'Modular synthesizers' },
        who: 'Vesna Lior',
        space: 'torre',
      },
      {
        time: '01:00',
        title: { es: 'Sesión hasta el amanecer', en: 'Set until sunrise' },
        who: 'Rafe Oduya',
        space: 'nave',
      },
    ],
  },
  {
    date: 21,
    weekday: { es: 'Domingo', en: 'Sunday' },
    name: { es: 'Eco', en: 'Echo' },
    mood: {
      es: 'Lo que queda. Un día lento para volver a cada obra.',
      en: 'What remains. A slow day to go back to every work.',
    },
    items: [
      {
        time: '12:00',
        title: {
          es: 'Recorrido guiado por las instalaciones',
          en: 'Guided walk through the installations',
        },
        who: 'Kinetica',
        space: 'galeria',
      },
      {
        time: '17:00',
        title: { es: 'Cine expandido', en: 'Expanded cinema' },
        who: 'Kito Arambel',
        space: 'nave',
      },
      {
        time: '19:30',
        title: {
          es: 'Cierre: todas las luces, una vez',
          en: 'Closing: every light, once',
        },
        who: 'Aiko Varn · Lumen Choir',
        space: 'darsena',
      },
    ],
  },
]

/** Shape drawn on each artist's card; the colours come from the name. */
export type ArtShape =
  'anillos' | 'ondas' | 'rejilla' | 'orbita' | 'haz' | 'pliegue'

export interface Artist {
  readonly name: string
  readonly discipline: Localized
  readonly from: Localized
  readonly line: Localized
  readonly day: number
  readonly space: SpaceId
  readonly shape: ArtShape
}

export const ARTISTS: readonly Artist[] = [
  {
    name: 'Aiko Varn',
    discipline: { es: 'Luz cinética', en: 'Kinetic light' },
    from: { es: 'Osaka', en: 'Osaka' },
    line: {
      es: 'Trescientos espejos que buscan tu cara.',
      en: 'Three hundred mirrors looking for your face.',
    },
    day: 18,
    space: 'nave',
    shape: 'anillos',
  },
  {
    name: 'Lumen Choir',
    discipline: { es: 'Coro y electrónica', en: 'Choir and electronics' },
    from: { es: 'Tallin', en: 'Tallinn' },
    line: {
      es: 'Cuarenta voces afinadas a la marea.',
      en: 'Forty voices tuned to the tide.',
    },
    day: 18,
    space: 'darsena',
    shape: 'ondas',
  },
  {
    name: 'Halvard Ims',
    discipline: { es: 'Código en vivo', en: 'Live coding' },
    from: { es: 'Bergen', en: 'Bergen' },
    line: {
      es: 'Escribe la música delante de ti, línea por línea.',
      en: 'Writes the music in front of you, line by line.',
    },
    day: 18,
    space: 'nave',
    shape: 'rejilla',
  },
  {
    name: 'Ondine Brask',
    discipline: { es: 'Escucha profunda', en: 'Deep listening' },
    from: { es: 'Copenhague', en: 'Copenhagen' },
    line: {
      es: 'Una pieza que dura lo que tardas en subir la torre.',
      en: 'A piece as long as it takes you to climb the tower.',
    },
    day: 19,
    space: 'torre',
    shape: 'pliegue',
  },
  {
    name: 'Nara Okafor',
    discipline: { es: 'Percusión', en: 'Percussion' },
    from: { es: 'Lagos', en: 'Lagos' },
    line: {
      es: 'Toca las grúas del puerto como si fueran campanas.',
      en: 'Plays the harbour cranes as if they were bells.',
    },
    day: 19,
    space: 'gruas',
    shape: 'haz',
  },
  {
    name: 'Duo Parallax',
    discipline: { es: 'Drone y video', en: 'Drone and video' },
    from: { es: 'Montreal', en: 'Montreal' },
    line: {
      es: 'Dos proyectores, una pantalla de agua.',
      en: 'Two projectors, one screen of water.',
    },
    day: 19,
    space: 'darsena',
    shape: 'orbita',
  },
  {
    name: 'Sorelle Quist',
    discipline: { es: 'Láser y niebla', en: 'Laser and fog' },
    from: { es: 'Róterdam', en: 'Rotterdam' },
    line: {
      es: 'Arquitectura hecha de luz que puedes atravesar.',
      en: 'Architecture made of light you can walk through.',
    },
    day: 19,
    space: 'nave',
    shape: 'haz',
  },
  {
    name: 'Ilse Montaro',
    discipline: { es: 'Performance', en: 'Performance' },
    from: { es: 'Lisboa', en: 'Lisbon' },
    line: {
      es: 'Cien linternas, un recorrido, nadie mira desde afuera.',
      en: 'A hundred lanterns, one route, nobody watches from outside.',
    },
    day: 20,
    space: 'muelle',
    shape: 'orbita',
  },
  {
    name: 'Teo Kassab',
    discipline: { es: 'Danza y robótica', en: 'Dance and robotics' },
    from: { es: 'Beirut', en: 'Beirut' },
    line: {
      es: 'Seis bailarines y seis brazos industriales aprenden a imitarse.',
      en: 'Six dancers and six industrial arms learn to copy each other.',
    },
    day: 20,
    space: 'nave',
    shape: 'pliegue',
  },
  {
    name: 'Vesna Lior',
    discipline: { es: 'Síntesis modular', en: 'Modular synthesis' },
    from: { es: 'Liubliana', en: 'Ljubljana' },
    line: {
      es: 'Un muro de cables que el público puede reconectar.',
      en: 'A wall of patch cables the audience can rewire.',
    },
    day: 20,
    space: 'torre',
    shape: 'rejilla',
  },
  {
    name: 'Rafe Oduya',
    discipline: { es: 'Club', en: 'Club' },
    from: { es: 'Londres', en: 'London' },
    line: {
      es: 'Cuatro horas que terminan cuando sale el sol.',
      en: 'Four hours that end when the sun comes up.',
    },
    day: 20,
    space: 'nave',
    shape: 'ondas',
  },
  {
    name: 'Kito Arambel',
    discipline: { es: 'Cine expandido', en: 'Expanded cinema' },
    from: { es: 'Ciudad de México', en: 'Mexico City' },
    line: {
      es: 'Película en 16 mm proyectada sobre humo y cuerpos.',
      en: '16 mm film projected onto smoke and bodies.',
    },
    day: 21,
    space: 'nave',
    shape: 'anillos',
  },
]

export type InstallationArt = 'pendulos' | 'ecos' | 'marea' | 'espejos'

export interface Installation {
  readonly id: InstallationArt
  readonly title: Localized
  readonly by: string
  readonly text: Localized
  readonly figure: Localized
  readonly space: SpaceId
}

export const INSTALLATIONS: readonly Installation[] = [
  {
    id: 'pendulos',
    title: { es: 'Campo de péndulos', en: 'Pendulum field' },
    by: 'Aiko Varn',
    text: {
      es: 'Sesenta y cuatro péndulos de luz que se desordenan cuando entras y vuelven a ponerse de acuerdo cuando te quedas quieto.',
      en: 'Sixty-four pendulums of light that fall out of step when you walk in and agree again when you stand still.',
    },
    figure: { es: '64 péndulos', en: '64 pendulums' },
    space: 'galeria',
  },
  {
    id: 'ecos',
    title: { es: 'Cámara de ecos', en: 'Echo chamber' },
    by: 'Ondine Brask',
    text: {
      es: 'Hablas y tu voz vuelve como anillos de color que suben por la torre. Los ecos de todo el día quedan girando arriba.',
      en: 'You speak and your voice comes back as rings of colour climbing the tower. The day’s echoes keep circling at the top.',
    },
    figure: { es: '96 parlantes', en: '96 speakers' },
    space: 'torre',
  },
  {
    id: 'marea',
    title: { es: 'Marea cromática', en: 'Chromatic tide' },
    by: 'Duo Parallax',
    text: {
      es: 'Un piso de agua poco profunda que descompone la luz del techo. Cuando sube la marea real, cambian los colores.',
      en: 'A shallow water floor that splits the light from the roof. When the real tide rises, the colours change.',
    },
    figure: { es: '2 mareas al día', en: '2 tides a day' },
    space: 'darsena',
  },
  {
    id: 'espejos',
    title: { es: 'Sala de espejos', en: 'Hall of mirrors' },
    by: 'Aiko Varn',
    text: {
      es: 'Trescientos espejos motorizados que giran hacia la persona más cercana. En grupo, la sala no sabe a quién mirar.',
      en: 'Three hundred motorised mirrors that turn towards the nearest person. In a crowd, the hall cannot decide whom to face.',
    },
    figure: { es: '300 espejos', en: '300 mirrors' },
    space: 'nave',
  },
]

export interface Tier {
  readonly id: string
  readonly name: Localized
  readonly price: number
  readonly note: Localized
  readonly perks: readonly Localized[]
  readonly popular?: boolean
}

export const TIERS: readonly Tier[] = [
  {
    id: 'dia',
    name: { es: 'Pase de un día', en: 'Day pass' },
    price: 48,
    note: { es: 'Eliges el día al entrar', en: 'Pick the day at the gate' },
    perks: [
      { es: 'Acceso a los seis espacios', en: 'All six spaces' },
      { es: 'Las cuatro instalaciones', en: 'All four installations' },
      { es: 'Salida y reingreso', en: 'Leave and come back' },
    ],
  },
  {
    id: 'festival',
    name: { es: 'Pase completo', en: 'Full pass' },
    price: 140,
    note: { es: 'Los cuatro días', en: 'All four days' },
    perks: [
      { es: 'Todo lo del pase de un día', en: 'Everything in the day pass' },
      {
        es: 'Fila propia en las instalaciones',
        en: 'Own queue at the installations',
      },
      { es: 'Recorrido guiado del domingo', en: 'Sunday guided walk' },
      { es: 'Afiche serigrafiado', en: 'Screen-printed poster' },
    ],
    popular: true,
  },
  {
    id: 'noche',
    name: { es: 'Pase nocturno', en: 'Night pass' },
    price: 72,
    note: {
      es: 'Viernes y sábado, desde las 22:00',
      en: 'Friday and Saturday, from 22:00',
    },
    perks: [
      { es: 'Nave Central y Dársena', en: 'Central Hall and the Dock' },
      { es: 'Sesión hasta el amanecer', en: 'The set until sunrise' },
      { es: 'Guardarropa incluido', en: 'Cloakroom included' },
    ],
  },
]

export interface Faq {
  readonly q: Localized
  readonly a: Localized
}

export const FAQS: readonly Faq[] = [
  {
    q: { es: '¿Kinetica existe?', en: 'Is Kinetica real?' },
    a: {
      es: 'No. Kinetica, el Puerto de Valdora y sus artistas son ficticios: esta página es una pieza de portafolio. Nada de lo que reserves aquí se cobra ni se guarda.',
      en: 'No. Kinetica, the Port of Valdora and its artists are fictional: this page is a portfolio piece. Nothing you book here is charged or stored.',
    },
  },
  {
    q: { es: '¿Hay luces intermitentes?', en: 'Are there flashing lights?' },
    a: {
      es: 'Sí, en la Nave Central y en la Dársena después de las 22:00. Cada obra con destellos tiene un aviso en la entrada, y la Galería de Luz y el Patio de Grúas no tienen.',
      en: 'Yes, in the Central Hall and on the Dock after 22:00. Every work with strobes has a sign at its entrance; the Light Gallery and the Crane Yard have none.',
    },
  },
  {
    q: { es: '¿Es accesible?', en: 'Is it accessible?' },
    a: {
      es: 'Todo el recinto es plano o tiene rampa, y la Torre del Reloj tiene ascensor. Hay zona elevada en los dos escenarios, bucle magnético en la torre y sala tranquila junto al Muelle Norte.',
      en: 'The whole venue is level or ramped, and the Clock Tower has a lift. There are raised platforms at both stages, a hearing loop in the tower and a quiet room by the North Quay.',
    },
  },
  {
    q: { es: '¿Desde qué edad se puede venir?', en: 'Is there an age limit?' },
    a: {
      es: 'De día, todas las edades; menores de 16 entran con un adulto. Después de las 22:00, solo mayores de 18.',
      en: 'By day, all ages; under-16s come with an adult. After 22:00, over-18s only.',
    },
  },
  {
    q: { es: '¿Cómo llego?', en: 'How do I get there?' },
    a: {
      es: 'Con el tranvía 4 hasta Arsenal, o en el ferry nocturno desde el centro, que sale cada 20 minutos hasta las 04:00. No hay estacionamiento: hay 600 lugares para bicicletas.',
      en: 'Tram 4 to Arsenal, or the night ferry from the centre every 20 minutes until 04:00. There is no car park: there are 600 bike spaces.',
    },
  },
  {
    q: { es: '¿Puedo devolver mi entrada?', en: 'Can I get a refund?' },
    a: {
      es: 'Hasta 14 días antes del festival, con devolución completa. Después puedes traspasarla a otra persona sin costo.',
      en: 'Up to 14 days before the festival, in full. After that you can transfer it to someone else for free.',
    },
  },
]
