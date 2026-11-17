import { Children, useRef, useState } from 'react'

// No celular os cartões ficam lado a lado e a pessoa arrasta; no computador é grade normal
export default function Swipe({ className = '', children }) {
  const ref = useRef(null)
  const [active, setActive] = useState(0)
  const count = Children.count(children)

  function onScroll() {
    const el = ref.current
    const first = el.firstElementChild
    if (!first) return
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0
    setActive(Math.round(el.scrollLeft / (first.offsetWidth + gap)))
  }

  return (
    <>
      <div ref={ref} className={`swipe ${className}`} onScroll={onScroll}>
        {children}
      </div>
      <div className="swipe-dots" aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
          <span key={i} className={i === active ? 'is-active' : undefined} />
        ))}
      </div>
    </>
  )
}
