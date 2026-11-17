import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import { EASE, Reveal, VIEWPORT } from './motion'
import { print } from '../prints'

const SCREENS = [
  ['Início', 'pc-01-inicio'],
  ['Lançamentos', 'pc-02-lancamentos'],
  ['Contas e cartões', 'pc-03-contas-e-cartoes'],
  ['Orçamento', 'pc-04-orcamento'],
  ['Metas', 'pc-05-metas'],
  ['Relatórios', 'pc-07-relatorios'],
  ['Assistente', 'pc-08-assistente'],
]

const DURATION = 4500

export default function Desktop() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const ref = useRef(null)
  const tabs = useRef(null)
  const inView = useInView(ref, { amount: 0.4 })
  const reduce = useReducedMotion()

  // Troca de tela sozinho até a pessoa escolher uma aba
  useEffect(() => {
    if (!inView || reduce || paused) return
    const t = setTimeout(() => setActive((a) => (a + 1) % SCREENS.length), DURATION)
    return () => clearTimeout(t)
  }, [active, inView, reduce, paused])

  // No celular as abas rolam de lado; mantém a aba ativa no meio
  useEffect(() => {
    const row = tabs.current
    const tab = row?.children[active]
    if (!tab || row.scrollWidth <= row.clientWidth) return
    row.scrollTo({
      left: tab.offsetLeft - (row.clientWidth - tab.offsetWidth) / 2,
      behavior: reduce ? 'auto' : 'smooth',
    })
  }, [active, reduce])

  return (
    <section className="section section--dark" id="computador" data-tone="dark" ref={ref}>
      <div className="container">
        <Reveal className="section-head">
          <h2 className="title">Quer ver tudo em tela grande? Abra o Dinn no computador.</h2>
          <p className="lead">
            O sistema completo no navegador, com os mesmos dados do WhatsApp e do app do celular.
          </p>
        </Reveal>

        <Reveal
          ref={tabs}
          className="desk-tabs"
          role="tablist"
          aria-label="Telas do sistema"
          delay={0.1}
        >
          {SCREENS.map(([label], i) => (
            <button
              key={label}
              type="button"
              role="tab"
              aria-selected={i === active}
              className={`desk-tab${i === active ? ' is-active' : ''}`}
              onClick={() => {
                setActive(i)
                setPaused(true)
              }}
            >
              {label}
            </button>
          ))}
        </Reveal>

        <motion.div
          className="laptop laptop--dark"
          initial={{ opacity: 0, y: 60, rotateX: 12 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 1, ease: EASE }}
          style={{ transformPerspective: 1800 }}
        >
          <div className="laptop-lid">
            <div className="laptop-display">
              <div className="laptop-pan">
                {SCREENS.map(([label, img], i) => (
                  <img
                    key={img}
                    src={print(img)}
                    alt={i === active ? `Tela de ${label} do Dinn no computador` : ''}
                    width="1600"
                    height="1000"
                    loading="lazy"
                    className={i === active ? 'is-active' : undefined}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="laptop-base" />
        </motion.div>
      </div>
    </section>
  )
}
