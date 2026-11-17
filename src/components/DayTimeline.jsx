import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { LogoMark } from './Logo'
import { MessageBody, WaBubble } from './chat'
import { EASE, Reveal } from './motion'
import { APP_URL } from '../config'
import { print } from '../prints'

const DURATION = 5000

function Notification({ time, text }) {
  return (
    <div className="scene-card scene-note">
      <span className="scene-note-icon">
        <LogoMark size={18} />
      </span>
      <div>
        <div className="scene-note-head">
          <strong>Dinn</strong>
          <span>{time}</span>
        </div>
        <p>{text}</p>
      </div>
    </div>
  )
}

function Exchange({ ask, reply, time }) {
  return (
    <div className="wa wa--light scene-chat">
      <WaBubble from="me" time={time}>
        {ask}
      </WaBubble>
      <WaBubble from="bot" time={time}>
        <MessageBody message={{ from: 'bot', kind: 'added', entry: reply }} />
      </WaBubble>
    </div>
  )
}

// Cada momento do dia traz a tela do app que combina com ele
const STEPS = [
  {
    time: '07:40',
    title: 'O aviso da fatura chega antes do café.',
    img: 'cel-03-contas-e-cartoes',
    label: 'Contas e cartões',
    scene: <Notification time="7:40" text="A fatura do Nubank vence hoje: R$ 1.081,23." />,
  },
  {
    time: '12:30',
    title: 'Pediu o almoço? Manda no WhatsApp e está lançado.',
    img: 'cel-02-lancamentos',
    label: 'Lançamentos',
    scene: (
      <Exchange
        time="12:30"
        ask="42 no ifood"
        reply={{ tipo: 'despesa', categoria: 'Alimentação', valor: 42 }}
      />
    ),
  },
  {
    time: '22:00',
    title: 'Antes de dormir, você sabe quanto sobrou.',
    img: 'cel-01-inicio',
    label: 'Início',
    scene: (
      <div className="scene-card scene-summary">
        <span className="app-label">Sobrou em outubro</span>
        <strong className="num">R$ 1.257,37</strong>
      </div>
    ),
  },
]

export default function DayTimeline() {
  const [active, setActive] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.35 })
  const reduce = useReducedMotion()
  const playing = inView && !reduce

  // Avança sozinho enquanto a seção está na tela
  useEffect(() => {
    if (!playing) return
    const t = setTimeout(() => setActive((a) => (a + 1) % STEPS.length), DURATION)
    return () => clearTimeout(t)
  }, [active, playing])

  return (
    <section
      className="section section--dark section--tight"
      id="como-funciona"
      data-tone="dark"
      ref={ref}
    >
      <div className="container">
        <Reveal className="day-card">
          <div className="day-copy">
            <h2>Um dia comum. Só que com o dinheiro no lugar.</h2>

            <ol className="day-list">
              {STEPS.map((step, i) => {
                const isActive = i === active
                return (
                  <li key={step.time} className={`day-item${isActive ? ' is-active' : ''}`}>
                    <button
                      type="button"
                      className="day-button"
                      aria-pressed={isActive}
                      onClick={() => setActive(i)}
                    >
                      <span className="day-time num">{step.time}</span>
                      <span className="day-title">{step.title}</span>
                    </button>
                    <span className="day-progress">
                      {isActive && (
                        <motion.span
                          key={`${active}-${playing}`}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: playing ? 1 : 0 }}
                          transition={{ duration: DURATION / 1000, ease: 'linear' }}
                        />
                      )}
                    </span>
                  </li>
                )
              })}
            </ol>

            {/* No celular a lista vira três horários e só o momento ativo aparece escrito */}
            <p className="day-now" aria-hidden="true">
              {STEPS[active].title}
            </p>

            <a className="link-arrow day-link" href={APP_URL}>
              Começar agora
              <ArrowRight size={16} strokeWidth={1.75} />
            </a>
          </div>

          {/* A mensagem do momento fica ao lado do celular, sem cobrir a tela */}
          <div className="day-stage">
            <div className="day-message" aria-live="polite">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  {STEPS[active].scene}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="day-phone">
              {STEPS.map(({ img, label }, i) => (
                <img
                  key={img}
                  className={i === active ? 'is-active' : undefined}
                  src={print(img)}
                  alt={i === active ? `Tela de ${label} no app Dinn` : ''}
                  width="620"
                  height="1299"
                  loading="lazy"
                />
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
