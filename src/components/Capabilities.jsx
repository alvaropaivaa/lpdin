import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'motion/react'
import { Play } from 'lucide-react'
import { Receipt, Typing, WaBubble } from './chat'
import { EASE, Reveal, TiltCard, VIEWPORT } from './motion'
import Swipe from './Swipe'

// Altura de cada barrinha da onda do áudio
const WAVE = [4, 9, 14, 7, 18, 11, 6, 15, 20, 9, 5, 12, 17, 8, 13, 19, 7, 10, 15, 6, 11, 16, 8, 4]

// Quanto cada passo fica na tela: vazio, pedido, digitando, resposta
const STEP_MS = [500, 800, 1100, 4200]

// Conversa curta que se repete sozinha enquanto o cartão está na tela
function ChatLoop({ ask, askClass = '', reply, time, offset = 0 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.5 })
  const reduce = useReducedMotion()
  const [step, setStep] = useState(reduce ? 3 : 1)

  useEffect(() => {
    if (reduce || !inView) return
    // O atraso extra no passo vazio desencontra os cartões entre si
    const wait = STEP_MS[step] + (step === 0 ? offset : 0)
    const t = setTimeout(() => setStep((s) => (s + 1) % STEP_MS.length), wait)
    return () => clearTimeout(t)
  }, [step, inView, reduce, offset])

  const on = (visible) => (visible ? ' is-on' : '')

  return (
    <div className="cap-3d" ref={ref}>
      <div className="wa wa--light cap-chat">
        <WaBubble from="me" time={time} className={`cap-bubble ${askClass}${on(step >= 1)}`}>
          {ask}
        </WaBubble>
        {/* Digitando e resposta ocupam o mesmo lugar, então nada pula */}
        <div className="cap-slot">
          <div className={`wa-msg wa-msg--bot cap-bubble${on(step === 2)}`}>
            <Typing />
          </div>
          <WaBubble from="bot" time={time} className={`cap-bubble${on(step === 3)}`}>
            {reply}
          </WaBubble>
        </div>
      </div>
    </div>
  )
}

function AudioVisual() {
  return (
    <>
      <span className="cap-rings" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <ChatLoop
        time="09:12"
        offset={0}
        ask={
          <span className="wa-audio">
            <Play size={16} strokeWidth={2} fill="currentColor" />
            <span className="wa-wave" aria-hidden="true">
              {WAVE.map((h, i) => (
                <span key={i} style={{ height: h, animationDelay: `${i * 0.05}s` }} />
              ))}
            </span>
            <span className="num">0:07</span>
          </span>
        }
        reply={<Receipt kind="added" entry={{ tipo: 'despesa', categoria: 'Mercado', valor: 312.4 }} />}
      />
    </>
  )
}

function PhotoVisual() {
  return (
    <ChatLoop
      time="18:40"
      offset={300}
      askClass="wa-msg--photo"
      ask={
        <span className="wa-photo" aria-hidden="true">
          <span className="wa-photo-paper">
            <b>FARMÁCIA</b>
            <i />
            <i />
            <i />
            <b className="num">TOTAL 80,64</b>
          </span>
          <span className="wa-photo-scan" />
        </span>
      }
      reply={<Receipt kind="added" entry={{ tipo: 'despesa', categoria: 'Saúde', valor: 80.64 }} />}
    />
  )
}

function InstallmentVisual() {
  return (
    <ChatLoop
      time="20:05"
      offset={600}
      ask="mercado 312,40 no cartão em 3x"
      reply={
        <span>
          Anotado: <b>3x de R$ 104,13</b> no cartão, em <b>Mercado</b>.
        </span>
      }
    />
  )
}

function FixVisual() {
  return (
    <ChatLoop
      time="11:30"
      offset={900}
      ask="errei, foi 3 mil"
      reply={
        <Receipt
          kind="fixed"
          before={3200}
          entry={{ tipo: 'receita', categoria: 'Trabalho', valor: 3000 }}
        />
      }
    />
  )
}

const CARDS = [
  {
    title: 'Fale, e está lançado.',
    text: 'Mande um áudio do jeito que vier na cabeça. O Dinn entende o valor e a categoria e lança na hora.',
    Visual: AudioVisual,
  },
  {
    title: 'A foto do comprovante vira lançamento.',
    text: 'Tirou foto da nota ou recebeu um PDF? Mande no WhatsApp e ele lê e lança por você.',
    Visual: PhotoVisual,
  },
  {
    title: 'Parcelado também entra certo.',
    text: 'Diga em quantas vezes e em qual cartão. O Dinn lança as parcelas sem você fazer conta.',
    Visual: InstallmentVisual,
  },
  {
    title: 'Errou? Corrija numa frase.',
    text: 'Corrija, apague ou desfaça escrevendo normalmente. Tudo dá para voltar atrás.',
    Visual: FixVisual,
  },
]

export default function Capabilities() {
  return (
    <section className="section section--alt" id="lancar" data-tone="light">
      <div className="container">
        <Reveal className="section-head">
          <h2 className="title">O assistente lança por você, do jeito que você mandar.</h2>
          <p className="lead">
            Texto, áudio, foto do comprovante ou PDF. Ele entende, lança na categoria certa e
            responde na hora.
          </p>
        </Reveal>

        <Swipe className="cap-grid">
          {CARDS.map(({ title, text, Visual }, i) => (
            <TiltCard
              key={title}
              className="card card--light cap"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT}
              transition={{ duration: 0.8, delay: (i % 2) * 0.1, ease: EASE }}
            >
              <div className="cap-visual">
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
