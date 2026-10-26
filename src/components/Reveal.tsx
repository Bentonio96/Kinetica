import { useRef, type ElementType } from 'react'
import { MQ, ScrollTrigger, gsap, useGSAP } from '../lib/gsap'

/**
 * A heading whose words rise and turn into place as it scrolls in. Only
 * transforms animate: the words are never transparent and never masked, so
 * a slow device or a screenshot mid-animation still shows the whole text,
 * and nothing can be clipped. Screen readers get the sentence once.
 */
export function Reveal({
  text,
  as: Tag = 'h2',
  className = '',
  id,
}: {
  text: string
  as?: ElementType
  className?: string
  id?: string
}) {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        const words = root.current?.querySelectorAll('[data-palabra]')
        if (!words?.length) return
        gsap.from(words, {
          yPercent: 55,
          rotate: 5,
          duration: 1.2,
          stagger: 0.07,
          scrollTrigger: {
            trigger: root.current,
            start: 'top 88%',
            once: true,
          },
        })
      })
      // Language changes re-split the text; let triggers re-measure.
      ScrollTrigger.refresh()
      return () => mm.revert()
    },
    { dependencies: [text], scope: root, revertOnUpdate: true },
  )

  const words = text.split(' ')
  return (
    <Tag ref={root} id={id} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, i) => (
          <span key={`${word}-${i}`}>
            <span data-palabra="" className="inline-block origin-bottom-left">
              {word}
            </span>
            {i < words.length - 1 ? ' ' : null}
          </span>
        ))}
      </span>
    </Tag>
  )
}
