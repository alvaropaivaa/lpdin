import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import Phone from './Phone'
import LivePanel from './LivePanel'
import { MessageBody, Typing, WaBubble, WaHeader, WaInput } from './chat'
import { EASE, Reveal, VIEWPORT } from './motion'
import { APP_URL } from '../config'
import { print } from '../prints'
import mascotWaving from '../assets/mascote-acenando.webp'
import mascotHand from '../assets/mascote-mao.webp'

// Valores do mês antes da conversa
const BASE = { entrou: 7400, saiu: 6142.63 }

// Conversa que se repete sozinha no WhatsApp do topo
const SCRIPT = [
  { from: 'me', text: 'gastei 62 na farmácia' },
  { from: 'bot', kind: 'added', entry: { tipo: 'despesa', categoria: 'Saúde', valor: 62 } },
  { from: 'me', text: '58,90 no ifood' },
  { from: 'bot', kind: 'added', entry: { tipo: 'despesa', categoria: 'Alimentação', valor: 58.9 } },
  { from: 'me', text: 'recebi 3.200 do freela' },
  { from: 'bot', kind: 'added', entry: { tipo: 'receita', categoria: 'Trabalho', valor: 3200 } },
  { from: 'me', text: 'errei, foi 3 mil' },
  {
    from: 'bot',
    kind: 'fixed',
    entry: { tipo: 'receita', categoria: 'Trabalho', valor: 3000 },
    before: 3200,
  },
  { from: 'me', text: 'paguei 120 de luz' },
  { from: 'bot', kind: 'added', entry: { tipo: 'despesa', categoria: 'Contas da casa', valor: 120 } },
  { from: 'me', text: 'desfaz o último' },
  { from: 'bot', kind: 'undone', entry: { tipo: 'despesa', categoria: 'Contas da casa', valor: 120 } },
]

const VISIBLE = 7

// Refaz os lançamentos da volta atual da conversa para mostrar os totais no painel
function stateAt(step) {
  const entries = []
  for (let i = 0; i < step % SCRIPT.length; i++) {
    const m = SCRIPT[i]
    if (m.kind === 'added') entries.push(m.entry)
    else if (m.kind === 'fixed') entries[entries.length - 1] = m.entry
    else if (m.kind === 'undone') entries.pop()
  }
  const sum = (tipo) => entries.filter((e) => e.tipo === tipo).reduce((s, e) => s + e.valor, 0)
  return {
    entrou: BASE.entrou + sum('receita'),
    saiu: BASE.saiu + sum('despesa'),
    last: entries.at(-1),
  }
}

const timeOf = (i) => {
  const minutes = 15 + Math.floor(i / 2)
  return `${10 + Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}`
}

function useChatLoop() {
  const reduce = useReducedMotion()
  // Total de mensagens já enviadas; só cresce, e a conversa recomeça sem esvaziar a tela
  const [step, setStep] = useState(reduce ? SCRIPT.length - 2 : 6)
  const typing = !reduce && SCRIPT[step % SCRIPT.length].from === 'bot'

  useEffect(() => {
    if (reduce) return
    const next = SCRIPT[step % SCRIPT.length]
    const t = setTimeout(() => setStep((s) => s + 1), next.from === 'bot' ? 1200 : 1700)
    return () => clearTimeout(t)
  }, [step, reduce])

  const messages = []
  for (let i = Math.max(0, step - VISIBLE); i < step; i++) {
    messages.push({ id: i, ...SCRIPT[i % SCRIPT.length] })
  }
  return { messages, typing, ...stateAt(step) }
}

// Linha de tendência subindo da esquerda para a direita
const TREND =
  'M -40 760 C 160 740 250 650 420 668 S 650 560 820 590 S 1070 470 1220 486 S 1470 330 1660 290'

const LEFT_BARS = [34, 48, 40, 62, 54, 76, 70]
const RIGHT_BARS = [44, 58, 50, 72, 64, 86, 96]

// Fundo animado do topo: luzes, linha de tendência e barras do logo
function HeroBackground() {
  const reduce = useReducedMotion()
  return (
    <div className="hero-bg" aria-hidden="true">
      <span className="hero-blob hero-blob--a" />
      <span className="hero-blob hero-blob--b" />

      <svg className="hero-trend" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="trend-stroke" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#86EFAC" stopOpacity="0" />
            <stop offset="0.35" stopColor="#86EFAC" stopOpacity="0.35" />
            <stop offset="1" stopColor="#86EFAC" stopOpacity="0.75" />
          </linearGradient>
          <linearGradient id="trend-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#16A34A" stopOpacity="0.16" />
            <stop offset="1" stopColor="#16A34A" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path className="hero-trend-area" d={`${TREND} L 1660 900 L -40 900 Z`} fill="url(#trend-fill)" />
        <path
          className="hero-trend-line"
          d={TREND}
          pathLength="1"
          fill="none"
          stroke="url(#trend-stroke)"
          strokeWidth="2"
        />
        {!reduce && (
          <g className="hero-trend-dot">
            <circle r="14" fill="#86EFAC" opacity="0.18">
              <animateMotion dur="9s" repeatCount="indefinite" path={TREND} />
            </circle>
            <circle r="4.5" fill="#86EFAC">
              <animateMotion dur="9s" repeatCount="indefinite" path={TREND} />
            </circle>
          </g>
        )}
      </svg>
    </div>
  )
}

function HeroBars({ heights, side }) {
  return (
    <div className={`hero-bars hero-bars--${side}`} aria-hidden="true">
      {heights.map((h, i) => (
        <span key={i} style={{ height: `${h}%`, animationDelay: `${i * -0.7}s` }} />
      ))}
    </div>
  )
}

// Entra de baixo para cima com um pequeno atraso
const rise = (delay, y = 24) => ({
  initial: { opacity: 0, y },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: EASE },
})

export default function Hero() {
  const { messages, typing, entrou, saiu, last } = useChatLoop()

  return (
    <section className="hero" id="topo" data-tone="dark">
      <HeroBackground />
      <div className="container hero-copy">
        <motion.span className="pill" {...rise(0, 12)}>
          <span className="pill-dot" />
          Assistente financeiro no WhatsApp
        </motion.span>

        <motion.h1 {...rise(0.1)}>
          Seu dinheiro rende mais.{' '}
          <span className="hero-accent">É só mandar um WhatsApp.</span>
        </motion.h1>

        <motion.p className="lead" {...rise(0.2)}>
          Mande texto, áudio ou a foto do comprovante. O Dinn lança, organiza e mostra tudo no
          computador e no celular.
        </motion.p>

        <motion.a className="link-arrow" href={APP_URL} {...rise(0.3)}>
          Começar agora
          <ArrowRight size={16} strokeWidth={1.75} />
        </motion.a>
      </div>

      {/* Celular no centro, mascote de um lado e o painel do sistema do outro */}
      <div className="hero-stage">
        <HeroBars heights={LEFT_BARS} side="left" />
        <HeroBars heights={RIGHT_BARS} side="right" />
        {/* Mascote acenando e segurando a borda do cartão com a outra mão */}
        <div className="hero-mascot">
          <motion.img
            className="hero-mascot-body"
            src={mascotWaving}
            alt="Mascote do Dinn acenando"
            width="900"
            height="602"
            {...rise(0.6, 50)}
          />
          <motion.img
            className="hero-mascot-grip"
            src={mascotHand}
            alt=""
            width="98"
            height="59"
            {...rise(0.6, 50)}
          />
        </div>

        <motion.div className="hero-phone" {...rise(0.25, 80)} aria-hidden="true">
          <Phone screen="phone-screen--wa-light">
            <div className="wa wa--light">
              <WaHeader status={typing ? 'digitando…' : 'online'} />
              <span className="wa-day wa-day--float">Hoje</span>
              <div className="wa-body wa-body--bottom">
                {messages.map((message) => (
                  <WaBubble
                    key={message.id}
                    from={message.from}
                    time={timeOf(message.id)}
                    className="pop"
                  >
                    <MessageBody message={message} />
                  </WaBubble>
                ))}
                {typing && (
                  <div className="wa-msg wa-msg--bot pop">
                    <Typing />
                  </div>
                )}
              </div>
              <WaInput />
            </div>
          </Phone>
        </motion.div>

        <motion.div
          className="hero-live"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.8, ease: EASE }}
          aria-hidden="true"
        >
          <LivePanel className="live--glass" entrou={entrou} saiu={saiu} last={last} />
        </motion.div>
      </div>

      {/* Cartão grande que passa por baixo do celular */}
      <div className="container container--wide">
        <Reveal className="intro-card">
          <div className="intro-copy">
            <h2>Perdeu a conta de onde foi parar o dinheiro?</h2>
            <p>Mande uma mensagem no WhatsApp e veja tudo organizado no computador.</p>
            <a className="link-arrow" href={APP_URL}>
              Começar agora
              <ArrowRight size={16} strokeWidth={1.75} />
            </a>
          </div>
          {/* O print do sistema é o próprio fundo do cartão, de ponta a ponta */}
          <div className="intro-screens">
            <motion.div
              className="intro-screen"
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT}
              transition={{ duration: 1, delay: 0.15, ease: EASE }}
            >
              <img
                src={print('pc-01-inicio-lg')}
                alt="Tela inicial do sistema Dinn no computador, com saldo, receitas, despesas e fluxo de caixa"
                width="2400"
                height="1500"
                loading="lazy"
              />
            </motion.div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
