import { useEffect, useRef } from 'react'
import { animate, motion, useInView, useReducedMotion, useSpring } from 'motion/react'

export const EASE = [0.22, 1, 0.36, 1]
export const VIEWPORT = { once: true, margin: '0px 0px -6% 0px' }

// Sobe e aparece quando entra na tela
export function Reveal({ as = 'div', delay = 0, y = 24, children, ...props }) {
  const Tag = motion[as]
  return (
    <Tag
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.7, delay, ease: EASE }}
      {...props}
    >
      {children}
    </Tag>
  )
}

// Conta de 0 até o valor quando aparece na tela
export function CountUp({ value, format, duration = 1.6, delay = 0 }) {
  const ref = useRef(null)
  const inView = useInView(ref, VIEWPORT)
  const reduce = useReducedMotion()

  useEffect(() => {
    if (!inView) return
    if (reduce) {
      ref.current.textContent = format(value)
      return
    }
    const controls = animate(0, value, {
      duration,
      delay,
      ease: EASE,
      onUpdate: (v) => {
        ref.current.textContent = format(v)
      },
    })
    return () => controls.stop()
  }, [inView, reduce, value, format, duration, delay])

  return <span ref={ref}>{format(reduce ? value : 0)}</span>
}

// Cartão que inclina em 3D e acende uma luz onde está o mouse
export function TiltCard({ className = '', max = 4, children, ...props }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const spring = { stiffness: 220, damping: 22 }
  const rotateX = useSpring(0, spring)
  const rotateY = useSpring(0, spring)

  function onPointerMove(e) {
    if (reduce || e.pointerType !== 'mouse') return
    const r = ref.current.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    rotateY.set((px - 0.5) * max * 2)
    rotateX.set((0.5 - py) * max * 2)
    ref.current.style.setProperty('--mx', `${px * 100}%`)
    ref.current.style.setProperty('--my', `${py * 100}%`)
  }

  function onPointerLeave() {
    rotateX.set(0)
    rotateY.set(0)
  }

  return (
    <motion.article
      ref={ref}
      className={`tilt ${className}`}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      {...props}
    >
      {children}
      <span className="tilt-glare" aria-hidden="true" />
    </motion.article>
  )
}
