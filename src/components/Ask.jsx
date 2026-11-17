import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, ChartPie, HandCoins, Target } from 'lucide-react'
import { LogoMark } from './Logo'
import { WaBubble } from './chat'
import { EASE, Reveal, VIEWPORT } from './motion'
import { print } from '../prints'

// Respostas montadas com os números das telas reais
const QUESTIONS = [
  {
    icon: ChartPie,
    label: 'Gastos do mês',
    q: 'quanto gastei este mês?',
    a: (
      <>
        Este mês você gastou <b>R$ 6.142,63</b>. Os maiores gastos foram <b>Moradia</b>,{' '}
        <b>Alimentação</b> e <b>Dívidas e empréstimos</b>.
      </>
    ),
  },
  {
    icon: Target,
    label: 'Metas',
    q: 'quanto falta pra minha reserva?',
    a: (
      <>
        Faltam <b>R$ 13.200,00</b> para a Reserva de emergência. Guardando <b>R$ 600,00</b> por
        mês, você chega lá em <b>abr/2028</b>.
      </>
    ),
  },
  {
    icon: HandCoins,
    label: 'Dívidas',
    q: 'quais dívidas estão em aberto?',
    a: (
      <>
        Você deve <b>R$ 35.643,62</b>. A próxima parcela é a do <b>Banco do Brasil</b>, de{' '}
        <b>R$ 937,99</b>, em 13/11. E o Lucas te deve <b>R$ 300,00</b> desde 18/09.
      </>
    ),
  },
]

export default function Ask() {
  const [active, setActive] = useState(0)
  const current = QUESTIONS[active]

  return (
    <section className="section section--dark ask" id="perguntar" data-tone="dark">
      <div className="container ask-grid">
        <motion.div
          className="ask-phone"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 1, ease: EASE }}
        >
          <span className="ask-circle" aria-hidden="true" />
          <img
            src={print('cel-08-assistente')}
            alt="Tela do assistente do Dinn com sugestões como “gastei 45,90 no ifood” e “quanto gastei este mês?”"
            width="620"
            height="1299"
            loading="lazy"
          />
        </motion.div>

        <Reveal>
          <h2 className="title">Pergunte, e o Dinn responde com os seus números.</h2>
          <p className="lead">
            Quanto gastou, quanto falta para a meta, o que está em aberto. É só perguntar no
            WhatsApp ou no app.
          </p>

          <p className="ask-hint">Toque em uma pergunta para ver a resposta.</p>
          <div className="ask-buttons">
            {QUESTIONS.map(({ icon: Icon, label }, i) => (
              <button
                key={label}
                type="button"
                className={`ask-button${i === active ? ' is-active' : ''}`}
                aria-pressed={i === active}
                onClick={() => setActive(i)}
              >
                <Icon size={16} strokeWidth={1.75} />
                {label}
                <ArrowRight size={14} strokeWidth={1.75} />
              </button>
            ))}
          </div>

          <div className="ask-answer" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                className="wa wa--dark ask-chat"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                <WaBubble from="me" time="10:42">
                  {current.q}
                </WaBubble>
                <WaBubble from="bot" time="10:42">
                  <span className="wa-card-from">
                    <LogoMark size={12} />
                    Dinn · Assistente
                  </span>
                  <p>{current.a}</p>
                </WaBubble>
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
