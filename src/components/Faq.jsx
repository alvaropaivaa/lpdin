import { useState } from 'react'
import { motion } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import { EASE, Reveal, VIEWPORT } from './motion'

const QUESTIONS = [
  {
    q: 'Como funciona o assistente no WhatsApp?',
    a: 'Você manda uma mensagem para o Dinn no WhatsApp, do jeito que falaria, como “gastei 50 no mercado”. Ele cria o lançamento na categoria certa e responde confirmando.',
  },
  {
    q: 'Onde eu vejo os meus lançamentos?',
    a: 'No sistema, pelo navegador do computador, e no app do celular. O que você manda no WhatsApp aparece nos dois.',
  },
  {
    q: 'Preciso baixar o app na loja?',
    a: 'Não. No celular, dá para instalar o Dinn direto pelo navegador, sem passar pela App Store ou pelo Google Play.',
  },
  {
    q: 'Errei um lançamento. Como corrijo?',
    a: 'Escreva para o assistente, por exemplo “errei, foi 3 mil”, e ele ajusta o valor. Se quiser voltar atrás, peça para desfazer.',
  },
  {
    q: 'Consigo acompanhar a fatura do cartão?',
    a: 'Sim. Cada cartão aparece com a logo do banco, e o Dinn mostra o valor da fatura e a data de vencimento.',
  },
  {
    q: 'O Dinn me avisa quando uma conta vai vencer?',
    a: 'Avisa. Você recebe uma notificação no celular antes do vencimento das contas e das dívidas que cadastrou.',
  },
  {
    q: 'Como meus dados ficam protegidos?',
    a: 'Você pode bloquear o app com um PIN, para que só você abra, e fazer backup dos seus dados quando quiser.',
  },
  {
    q: 'Tem tema escuro?',
    a: 'Tem. Você escolhe entre o tema claro e o escuro.',
  },
]

export default function Faq() {
  const [open, setOpen] = useState(0)
  const half = Math.ceil(QUESTIONS.length / 2)
  const columns = [QUESTIONS.slice(0, half), QUESTIONS.slice(half)]

  return (
    <section className="section section--alt" id="perguntas" data-tone="light">
      <div className="container">
        <Reveal className="section-head">
          <h2 className="title">Perguntas frequentes.</h2>
          <p className="lead">O que as pessoas mais perguntam antes de começar.</p>
        </Reveal>

        <div className="faq-grid">
          {columns.map((column, c) => (
            <div className="faq-col" key={c}>
              {column.map(({ q, a }, j) => {
                const i = c * half + j
                const isOpen = open === i
                return (
                  <motion.div
                    className={`faq-item${isOpen ? ' is-open' : ''}`}
                    key={q}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={VIEWPORT}
                    transition={{ duration: 0.6, delay: j * 0.06 + c * 0.04, ease: EASE }}
                  >
                    <h3>
                      <button
                        type="button"
                        className="faq-q"
                        aria-expanded={isOpen}
                        aria-controls={`faq-${i}`}
                        onClick={() => setOpen(isOpen ? -1 : i)}
                      >
                        {q}
                        <ChevronDown size={18} strokeWidth={1.75} />
                      </button>
                    </h3>
                    <div className="faq-a" id={`faq-${i}`} role="region" aria-hidden={!isOpen}>
                      <div>
                        <p>{a}</p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
