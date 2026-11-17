import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import Logo from './Logo'
import { EASE } from './motion'
import { APP_URL } from '../config'

const LINKS = [
  ['Como funciona', '#como-funciona'],
  ['O que pedir', '#assistente'],
  ['Funcionalidades', '#funcionalidades'],
  ['No computador', '#computador'],
  ['Planos', '#planos'],
  ['Perguntas', '#perguntas'],
]

export default function Nav() {
  const [tone, setTone] = useState('dark')

  // Acompanha o tom da seção que está passando por baixo do menu
  useEffect(() => {
    let raf = 0
    function update() {
      raf = 0
      const sections = document.querySelectorAll('[data-tone]')
      for (const section of sections) {
        const r = section.getBoundingClientRect()
        if (r.top <= 40 && r.bottom > 40) {
          setTone(section.dataset.tone)
          return
        }
      }
    }
    function onScroll() {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <motion.header
      className={`nav nav--${tone}`}
      initial={{ y: -90, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, ease: EASE }}
    >
      <div className="container nav-inner">
        <a href="#topo" aria-label="Dinn, início">
          <Logo tone={tone === 'dark' ? 'light' : 'dark'} />
        </a>
        <nav className="nav-links" aria-label="Seções">
          {LINKS.map(([label, href]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
        <a className="nav-cta" href={APP_URL}>
          Começar agora
          <ArrowRight size={15} strokeWidth={1.75} />
        </a>
      </div>
    </motion.header>
  )
}
