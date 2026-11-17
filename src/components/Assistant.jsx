import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { PencilLine, RotateCcw, Undo2 } from 'lucide-react'
import Phone from './Phone'
import { MessageBody, Typing, WaBubble, WaHeader, WaInput } from './chat'
import { EASE, Reveal, VIEWPORT } from './motion'

const PROMPTS = [
  { text: 'gastei 50 no mercado', add: { tipo: 'despesa', categoria: 'Mercado', valor: 50 } },
  { text: 'recebi 4.500 de salário', add: { tipo: 'receita', categoria: 'Salário', valor: 4500 } },
  { text: '58,90 no ifood', add: { tipo: 'despesa', categoria: 'Alimentação', valor: 58.9 } },
  { text: 'paguei 189,90 de luz', add: { tipo: 'despesa', categoria: 'Contas da casa', valor: 189.9 } },
  { text: 'uber 23 ontem', add: { tipo: 'despesa', categoria: 'Transporte', valor: 23 } },
  { text: 'errei, foi 3 mil', fix: 3000, icon: PencilLine },
  { text: 'desfaz o último', undo: true, icon: Undo2 },
]

const GREETING = { id: 0, from: 'bot', text: 'Oi! Me conta o que entrou ou saiu que eu lanço pra você.' }

function respond(prompt, entries) {
  if (prompt.add) {
    const entry = { ...prompt.add }
    return { entries: [...entries, entry], reply: { kind: 'added', entry } }
  }

  const last = entries.at(-1)
  if (!last) {
    const text = prompt.fix
      ? 'Ainda não tem lançamento para corrigir. Tente “gastei 50 no mercado”.'
      : 'Não tem nada para desfazer por aqui.'
    return { entries, reply: { text } }
  }

  if (prompt.fix) {
    const entry = { ...last, valor: prompt.fix }
    return { entries: [...entries.slice(0, -1), entry], reply: { kind: 'fixed', entry, before: last.valor } }
  }

  return { entries: entries.slice(0, -1), reply: { kind: 'undone', entry: last } }
}

export default function Assistant() {
  const [messages, setMessages] = useState([GREETING])
  const [entries, setEntries] = useState([])
  const [typing, setTyping] = useState(false)
  const nextId = useRef(1)
  const timer = useRef()
  const chatBody = useRef()
  const section = useRef()
  const started = useRef(false)

  function send(prompt) {
    if (typing) return
    started.current = true
    setMessages((list) => [...list, { id: nextId.current++, from: 'me', text: prompt.text }])
    setTyping(true)
    timer.current = setTimeout(() => {
      // Os botões ficam travados enquanto digita, então `entries` não muda até aqui
      const result = respond(prompt, entries)
      setEntries(result.entries)
      setMessages((list) => [...list, { id: nextId.current++, from: 'bot', ...result.reply }])
      setTyping(false)
    }, 800)
  }

  function reset() {
    clearTimeout(timer.current)
    setTyping(false)
    setEntries([])
    setMessages([GREETING])
  }

  useEffect(() => () => clearTimeout(timer.current), [])

  // Primeira mensagem sai sozinha quando a seção aparece
  useEffect(() => {
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          send(PROMPTS[0])
          io.disconnect()
        }
      },
      { threshold: 0.5 },
    )
    io.observe(section.current)
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const el = chatBody.current
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages, typing])

  return (
    <section className="section section--light" id="assistente" data-tone="light" ref={section}>
      <div className="container assistant-grid">
        <Reveal className="assistant-copy">
          <h2 className="title">Se você sabe mandar uma mensagem no WhatsApp, já sabe usar o Dinn.</h2>
          <p className="lead">
            Toque em qualquer pedido e acompanhe a resposta na hora, do jeito que acontece no
            WhatsApp.
          </p>
        </Reveal>

        <div className="chips">
          {PROMPTS.map((prompt, i) => {
            const Icon = prompt.icon
            return (
              <motion.button
                type="button"
                className="chip"
                key={prompt.text}
                onClick={() => send(prompt)}
                disabled={typing}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.04, ease: EASE }}
              >
                {Icon && <Icon size={15} strokeWidth={1.75} />}
                {prompt.text}
              </motion.button>
            )
          })}
          {messages.length > 3 && (
            <button type="button" className="chip chip--ghost" onClick={reset}>
              <RotateCcw size={15} strokeWidth={1.75} />
              Recomeçar
            </button>
          )}
        </div>

        <Reveal className="assistant-stage" delay={0.1}>
          <span className="assistant-circle" aria-hidden="true" />
          <Phone className="phone--chat" screen="phone-screen--wa-light">
            <div className="wa wa--light">
              <WaHeader status={typing ? 'digitando…' : 'online'} />
              <div className="wa-body" ref={chatBody} aria-live="polite">
                <span className="wa-day">Hoje</span>
                {messages.map((message) => (
                  <WaBubble key={message.id} from={message.from} className="pop">
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
        </Reveal>
      </div>
    </section>
  )
}
