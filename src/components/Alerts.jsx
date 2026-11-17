import { motion } from 'motion/react'
import { LogoMark } from './Logo'
import { WaBubble } from './chat'
import { EASE, Reveal, TiltCard, VIEWPORT } from './motion'
import Swipe from './Swipe'
import { WhatsAppIcon } from './ui'

const NOTES = [
  { time: 'agora', text: 'A fatura do Nubank vence hoje: R$ 1.081,23.' },
  { time: '7:30', text: 'A parcela do Banco do Brasil vence amanhã: R$ 937,99.' },
  { time: 'ontem', text: 'Compras chegou a 94% do limite do mês.' },
]

// Tela de bloqueio solta no cartão, com os avisos chegando um por um
function LockVisual() {
  return (
    <div className="alert-lock">
      <div className="lock-date">sexta-feira, 31 de outubro</div>
      <div className="lock-time">7:40</div>
      <div className="lock-notes">
        {NOTES.map((note, i) => (
          <motion.div
            key={note.text}
            className="lock-note"
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={VIEWPORT}
            transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.4 + i * 0.35 }}
          >
            <span className="lock-note-icon">
              <LogoMark size={15} />
            </span>
            <div>
              <div className="lock-note-head">
                <strong>Dinn</strong>
                <span>{note.time}</span>
              </div>
              <p>{note.text}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// A dívida do Lucas: o toque em "Lembrar no WhatsApp" manda a mensagem, e a cena se repete
function RemindVisual() {
  return (
    <div className="remind">
      <div className="remind-debt">
        <div className="remind-head">
          <span className="remind-avatar">LI</span>
          <span className="remind-name">
            <strong>Lucas (irmão)</strong>
            <span>Dívida pessoal · Mensal</span>
          </span>
          <span className="remind-chip">Atrasado</span>
        </div>
        <div className="remind-row">
          <span>
            <small>Parcela</small>
            <b className="num">R$ 300,00</b>
          </span>
          <span>
            <small>Pagas</small>
            <b className="num">2 de 5</b>
          </span>
          <span>
            <small>Venceu em</small>
            <b className="num neg">18/09</b>
          </span>
        </div>
        <span className="remind-btn">
          <WhatsAppIcon size={14} />
          Lembrar no WhatsApp
          <span className="remind-tap" aria-hidden="true" />
        </span>
      </div>

      <div className="wa wa--light remind-chat">
        <WaBubble from="me" time="09:12">
          Oi, Lucas! Passando para lembrar da parcela de <b>R$ 300,00</b> que venceu dia 18/09.
        </WaBubble>
      </div>
    </div>
  )
}

const ITEMS = [
  {
    title: 'Avisos de vencimento no celular.',
    text: 'Contas, faturas e dívidas avisam antes de vencer, sem você precisar lembrar.',
    Visual: LockVisual,
  },
  {
    title: 'Cobre quem te deve pelo WhatsApp.',
    text: 'Na tela de dívidas, um toque em “Lembrar no WhatsApp” manda o lembrete para quem te deve.',
    Visual: RemindVisual,
  },
]

export default function Alerts() {
  return (
    <section className="section section--dark alerts" id="avisos" data-tone="dark">
      <div className="container">
        <Reveal className="section-head">
          <h2 className="title">O Dinn lembra do que vence e de quem te deve.</h2>
          <p className="lead">
            Avisos no celular antes de cada vencimento e um lembrete pronto para mandar no
            WhatsApp.
          </p>
        </Reveal>

        <Swipe className="cards-grid alerts-grid">
          {ITEMS.map(({ title, text, Visual }, i) => (
            <TiltCard
              key={title}
              className="card card--dark"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT}
              transition={{ duration: 0.8, delay: i * 0.1, ease: EASE }}
            >
              <div className="card-visual alert-visual">
                <Visual />
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </TiltCard>
          ))}
        </Swipe>
      </div>
    </section>
  )
}
