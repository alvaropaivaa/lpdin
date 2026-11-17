import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  ArrowRight,
  BadgeCheck,
  BellRing,
  CalendarCheck,
  Camera,
  ChartPie,
  Check,
  CheckCheck,
  ChevronLeft,
  CircleHelp,
  CircleOff,
  Clock,
  CreditCard,
  Eye,
  HandCoins,
  Landmark,
  ListChecks,
  Mic,
  Monitor,
  NotebookPen,
  PiggyBank,
  Plane,
  RotateCcw,
  Sheet,
  ShieldCheck,
  Smartphone,
  Timer,
  TrendingDown,
} from 'lucide-react'
import Logo, { LogoMark } from './Logo'
import { EASE } from './motion'
import { WhatsAppIcon } from './ui'
import { CHECKOUT, PLANS, TRIAL_DAYS } from '../config'
import { price, priceNumber } from '../format'
import mascotWaving from '../assets/mascote-acenando.webp'
import mascotWavingHand from '../assets/mascote-mao.webp'
import mascotPointing from '../assets/mascote-apontando.webp'
import mascotPointingHand from '../assets/mascote-apontando-mao.webp'
import mascotPointingFinger from '../assets/mascote-apontando-dedo.webp'
import artHoje from '../assets/quiz/quiz-hoje.webp'
import artAnota from '../assets/quiz/quiz-anota.webp'
import artCartoes from '../assets/quiz/quiz-cartoes.webp'
import artEsquece from '../assets/quiz/quiz-esquece.webp'
import artObjetivo from '../assets/quiz/quiz-objetivo.webp'
import artJeito from '../assets/quiz/quiz-jeito.webp'

// Cada pergunta tem o mascote numa pose ligada ao assunto
const QUESTIONS = [
  {
    id: 'hoje',
    art: artHoje,
    title: 'Como está o seu dinheiro hoje?',
    options: [
      { value: 'some', label: 'No fim do mês, não sei para onde foi', Icon: CircleHelp },
      { value: 'trabalho', label: 'Até sei, mas anotar dá muito trabalho', Icon: Clock },
      { value: 'guardar', label: 'Tenho controle, mas quero guardar mais', Icon: PiggyBank },
      { value: 'dividas', label: 'Estou com dívidas e quero sair delas', Icon: TrendingDown },
    ],
  },
  {
    id: 'anota',
    art: artAnota,
    title: 'Como você anota os seus gastos hoje?',
    options: [
      { value: 'planilha', label: 'Numa planilha', Icon: Sheet },
      { value: 'caderno', label: 'No caderno ou no bloco de notas', Icon: NotebookPen },
      { value: 'banco', label: 'Só olho o app do banco', Icon: Landmark },
      { value: 'nada', label: 'Não anoto', Icon: CircleOff },
    ],
  },
  {
    id: 'cartoes',
    art: artCartoes,
    title: 'Quantos cartões de crédito você usa?',
    hint: 'Contando os de todos os bancos.',
    options: [
      { value: 0, label: 'Nenhum' },
      { value: 1, label: '1 cartão' },
      { value: 2, label: '2 ou 3 cartões' },
      { value: 4, label: '4 ou mais' },
    ],
  },
  {
    id: 'esquece',
    art: artEsquece,
    title: 'Já esqueceu de pagar uma conta ou fatura?',
    options: [
      { value: 'nunca', label: 'Nunca' },
      { value: 'as-vezes', label: 'Uma vez ou outra' },
      { value: 'sempre', label: 'Acontece com frequência' },
    ],
  },
  {
    id: 'objetivo',
    art: artObjetivo,
    title: 'O que você mais quer agora?',
    options: [
      { value: 'reserva', label: 'Montar uma reserva de emergência', Icon: ShieldCheck },
      { value: 'dividas', label: 'Sair das dívidas', Icon: HandCoins },
      { value: 'gastos', label: 'Parar de gastar sem perceber', Icon: Eye },
      { value: 'sonho', label: 'Juntar para um sonho: viagem, carro ou casa', Icon: Plane },
    ],
  },
  {
    id: 'jeito',
    art: artJeito,
    title: 'Qual jeito de lançar um gasto seria mais fácil para você?',
    options: [
      { value: 'mensagem', label: 'Mandando uma mensagem no WhatsApp', Icon: WhatsAppIcon },
      { value: 'audio', label: 'Mandando um áudio', Icon: Mic },
      { value: 'foto', label: 'Tirando foto do comprovante', Icon: Camera },
      { value: 'computador', label: 'Pelo computador', Icon: Monitor },
    ],
  },
]

/* ---------- Resultado montado a partir das respostas ---------- */

const PROFILES = {
  some: {
    name: 'Dinheiro que some',
    text: 'Você recebe, paga as contas e, no fim do mês, não sabe para onde foi o resto. O primeiro passo é enxergar cada gasto, sem esforço.',
  },
  trabalho: {
    name: 'Organizado sem tempo',
    text: 'Você sabe que precisa controlar, mas anotar tudo cansa. O Dinn faz essa parte por você.',
  },
  guardar: {
    name: 'Pronto para guardar',
    text: 'O controle você já tem. Agora é fazer o dinheiro sobrar e ver a meta chegar mais perto a cada mês.',
  },
  dividas: {
    name: 'Saindo das dívidas',
    text: 'Dá para sair. Com tudo o que você deve num só lugar, fica claro o que pagar primeiro e quando.',
  },
}

// O primeiro item é sempre a IA do Dinn no WhatsApp, do jeito que a pessoa prefere lançar
const BY_JEITO = {
  mensagem: {
    Icon: WhatsAppIcon,
    title: 'IA no WhatsApp que lança por você',
    text: 'Mande “58,90 no ifood” no WhatsApp e a IA do Dinn lança na categoria certa.',
  },
  audio: {
    Icon: Mic,
    title: 'Lance por áudio no WhatsApp',
    text: 'Mande um áudio para a IA do Dinn no WhatsApp e o gasto está lançado.',
  },
  foto: {
    Icon: Camera,
    title: 'Lance com uma foto no WhatsApp',
    text: 'Mande a foto do comprovante no WhatsApp e a IA do Dinn lê e lança.',
  },
  computador: {
    Icon: WhatsAppIcon,
    title: 'IA no WhatsApp e tudo no computador',
    text: 'Lance pelo WhatsApp com a IA do Dinn e veja tudo no navegador do computador.',
  },
}

const BY_OBJETIVO = {
  reserva: {
    Icon: PiggyBank,
    title: 'Meta de reserva de emergência',
    text: 'Veja quanto já guardou, quanto falta e quando chega lá.',
  },
  dividas: {
    Icon: HandCoins,
    title: 'Dívidas numa tela só',
    text: 'Parcelas, vencimentos e quanto falta, com lembrete no WhatsApp.',
  },
  gastos: {
    Icon: ChartPie,
    title: 'Limite para cada categoria',
    text: 'Saiba quanto ainda dá para gastar por dia até o fim do mês.',
  },
  sonho: {
    Icon: Plane,
    title: 'Meta para o seu sonho',
    text: 'Defina o valor e a data, e veja quanto guardar por mês.',
  },
}

// Esquecer contas pesa mais; sem esse problema, entram os cartões ou as contas
function middleItem({ esquece, cartoes }) {
  if (esquece !== 'nunca') {
    return {
      Icon: BellRing,
      title: 'Aviso antes de vencer',
      text: 'O Dinn avisa no celular antes de cada conta e fatura vencer.',
    }
  }
  if (cartoes > 1) {
    return {
      Icon: CreditCard,
      title: 'Todas as faturas juntas',
      text: 'A fatura de cada cartão, com a logo do banco, num lugar só.',
    }
  }
  if (cartoes === 1) {
    return {
      Icon: CreditCard,
      title: 'A fatura sem surpresa',
      text: 'Veja quanto já foi no cartão antes de a fatura fechar.',
    }
  }
  return {
    Icon: Landmark,
    title: 'Todas as contas juntas',
    text: 'O saldo de cada banco e da carteira, somado num lugar só.',
  }
}

const BY_ANOTA = {
  planilha: 'Trocando a planilha por mensagens',
  caderno: 'Trocando o caderno por mensagens',
  banco: 'Juntando todos os bancos num lugar',
  nada: 'Montando o seu controle do zero',
}

const STEP_MS = 900

/* ---------- Fundo: brilhos, a linha subindo e as barras do logo ---------- */

const TREND = 'M -20 700 C 60 660, 90 720, 150 610 S 250 560, 290 430 S 360 340, 420 220'
const BARS = [38, 52, 44, 66, 58, 80]

function QuizBackdrop() {
  const reduce = useReducedMotion()
  return (
    <div className="quiz-bg" aria-hidden="true">
      <span className="quiz-blob" />
      <span className="quiz-blob" />
      <svg className="quiz-trend" viewBox="0 0 400 860" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="quiz-trend-stroke" x1="0" x2="1" y1="1" y2="0">
            <stop offset="0" stopColor="#86EFAC" stopOpacity="0" />
            <stop offset="1" stopColor="#86EFAC" stopOpacity="0.55" />
          </linearGradient>
        </defs>
        <path className="quiz-trend-line" d={TREND} pathLength="1" fill="none" stroke="url(#quiz-trend-stroke)" strokeWidth="2" />
        {!reduce && (
          <g className="quiz-trend-dot">
            <circle r="12" fill="#86EFAC" opacity="0.18">
              <animateMotion dur="8s" repeatCount="indefinite" path={TREND} />
            </circle>
            <circle r="4" fill="#86EFAC">
              <animateMotion dur="8s" repeatCount="indefinite" path={TREND} />
            </circle>
          </g>
        )}
      </svg>
      {['left', 'right'].map((side) => (
        <div key={side} className={`quiz-bars quiz-bars--${side}`}>
          {(side === 'left' ? BARS : [...BARS].reverse()).map((h, i) => (
            <span key={i} style={{ height: `${h}%`, animationDelay: `${i * -0.7}s` }} />
          ))}
        </div>
      ))}
    </div>
  )
}

/* ---------- Telas ---------- */

const slide = {
  initial: (dir) => ({ opacity: 0, x: dir * 40 }),
  animate: { opacity: 1, x: 0, transition: { duration: 0.45, ease: EASE } },
  exit: (dir) => ({ opacity: 0, x: dir * -40, transition: { duration: 0.25, ease: EASE } }),
}

// As mãos recortadas ficam na frente do cartão, no mesmo lugar da imagem:
// uma segura a borda e o dedo que aponta não fica cortado.
// Todas as peças balançam em volta do mesmo ponto (o pé do mascote), então se mexem juntas
function Mascot({ src, alt, width, height, parts = [], className = '' }) {
  return (
    <div className={`quiz-mascot ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        width={width}
        height={height}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 70, damping: 13, delay: 0.25 }}
      />
      {parts.map((part) => (
        <motion.img
          key={part.src}
          className="quiz-mascot-grip"
          src={part.src}
          alt=""
          style={{
            left: `${(part.x / width) * 100}%`,
            top: `${(part.y / height) * 100}%`,
            width: `${(part.w / width) * 100}%`,
            transformOrigin: `${((width / 2 - part.x) / part.w) * 100}% ${((height - part.y) / part.h) * 100}%`,
          }}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 1.05, ease: EASE }}
        />
      ))}
    </div>
  )
}

// Balões de WhatsApp que surgem ao redor do mascote e ficam flutuando
const pop = (delay) => ({
  initial: { opacity: 0, scale: 0.6, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  transition: { type: 'spring', stiffness: 260, damping: 18, delay },
})

const PERKS = [
  { Icon: ListChecks, label: `${QUESTIONS.length} perguntas` },
  { Icon: Timer, label: '1 minuto' },
  { Icon: BadgeCheck, label: 'Plano na hora' },
]

function Intro({ onStart }) {
  return (
    <div className="quiz-stack quiz-intro">
      <div className="quiz-hero">
        <span className="quiz-halo" aria-hidden="true">
          <span />
          <span />
        </span>
        <Mascot
          src={mascotWaving}
          alt="Mascote do Dinn acenando"
          width={900}
          height={602}
          parts={[{ src: mascotWavingHand, x: 715, y: 525, w: 174, h: 105 }]}
        />

        <motion.div className="quiz-float quiz-float--me" aria-hidden="true" {...pop(1.1)}>
          gastei 58,90 no ifood
          <span className="quiz-float-meta">
            10:15
            <CheckCheck size={14} strokeWidth={2} />
          </span>
        </motion.div>
        <motion.div className="quiz-float quiz-float--bot" aria-hidden="true" {...pop(1.7)}>
          <WhatsAppIcon size={14} />
          <span>
            Anotado: <b>R$ 58,90</b>
          </span>
        </motion.div>
      </div>

      <div className="quiz-card">
        <span className="quiz-pill">
          <span className="quiz-pill-dot" />
          Quiz gratuito
        </span>
        <h1>
          Descubra como deixar o seu dinheiro <span className="quiz-accent">no lugar.</span>
        </h1>
        <p>
          Responda {QUESTIONS.length} perguntas rápidas e, no final, veja o plano do Dinn feito
          para você.
        </p>
        <ul className="quiz-pillars quiz-perks">
          {PERKS.map(({ Icon, label }) => (
            <li key={label}>
              <span className="quiz-plan-icon">
                <Icon size={16} strokeWidth={1.75} />
              </span>
              {label}
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="btn btn--primary btn--block btn--shine quiz-cta"
          onClick={onStart}
        >
          Começar o quiz
          <ArrowRight size={18} strokeWidth={1.75} />
        </button>
        <span className="quiz-note">Não precisa de cadastro para responder.</span>
      </div>
    </div>
  )
}

function Question({ question, chosen, onPick }) {
  const heading = useRef(null)

  // Leva o foco para a pergunta nova, para quem navega pelo teclado ou leitor de tela
  useEffect(() => {
    heading.current?.focus({ preventScroll: true })
  }, [])

  return (
    <div className="quiz-question">
      {/* Mascote grande no centro, com o mesmo brilho e anéis da tela de abertura */}
      <div className="quiz-question-art" aria-hidden="true">
        <span className="quiz-halo quiz-halo--art">
          <span />
          <span />
        </span>
        <motion.img
          src={question.art}
          alt=""
          width="484"
          height="511"
          initial={{ opacity: 0, y: 30, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 160, damping: 13, delay: 0.1 }}
        />
      </div>
      <h2 ref={heading} tabIndex={-1}>
        {question.title}
      </h2>
      {question.hint && <p className="quiz-hint">{question.hint}</p>}

      <div className="quiz-options">
        {question.options.map(({ value, label, Icon }, i) => {
          const on = chosen === value
          return (
            <motion.button
              key={label}
              type="button"
              className={`quiz-option${on ? ' is-on' : ''}`}
              aria-pressed={on}
              onClick={() => onPick(value)}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.06, ease: EASE }}
            >
              <span className="quiz-option-icon" aria-hidden="true">
                {Icon ? <Icon size={18} strokeWidth={1.75} /> : String.fromCharCode(65 + i)}
              </span>
              <span className="quiz-option-label">{label}</span>
              <span className="quiz-radio" aria-hidden="true">
                {on && <Check size={13} strokeWidth={2.75} />}
              </span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

function Loading({ steps, done }) {
  return (
    <div className="quiz-loading" aria-live="polite">
      <div className="quiz-loader">
        <LogoMark size={96} />
      </div>
      <h2>Montando o seu plano…</h2>
      <ul className="quiz-steps">
        {steps.map((step, i) => (
          <li key={step} className={i < done ? 'is-done' : i === done ? 'is-active' : undefined}>
            <span className="quiz-step-dot">
              {i < done && <Check size={12} strokeWidth={2.75} />}
            </span>
            {step}
          </li>
        ))}
      </ul>
    </div>
  )
}

// As três formas de usar o Dinn, todas no plano
const PILLARS = [
  { Icon: WhatsAppIcon, label: 'IA no WhatsApp', whatsapp: true },
  { Icon: Monitor, label: 'Sistema no computador' },
  { Icon: Smartphone, label: 'App no celular' },
]

// O quiz recomenda o Completo, com o que a IA faz por esta pessoa; o Básico aparece embaixo
function Plan({ items }) {
  const { parcelas, parcela, pixAnual } = PLANS.completo

  return (
    <motion.div
      className="quiz-offer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.35, ease: EASE }}
    >
      <div className="quiz-offer-head">
        <span className="quiz-offer-tag">Recomendado</span>
        <strong>Plano Completo</strong>
      </div>

      <div className="quiz-price">
        <span className="quiz-price-small">{parcelas}x de</span>
        <span className="quiz-price-main">
          <span className="quiz-price-cur">R$</span>
          <span className="num">{priceNumber(parcela)}</span>
          <span className="quiz-price-per">/mês</span>
        </span>
        <span className="quiz-price-small quiz-price-total">
          no plano anual
          {CHECKOUT.completoPix && (
            <>
              {' '}
              ou{' '}
              <a href={CHECKOUT.completoPix}>
                <b>{price(pixAnual)} no Pix</b>
              </a>
            </>
          )}
        </span>
      </div>

      <div className="quiz-trial">
        <CalendarCheck size={20} strokeWidth={1.75} />
        <span>
          <strong>{TRIAL_DAYS} dias de teste grátis</strong>
          <small>contados depois da compra</small>
        </span>
      </div>

      <ul className="quiz-pillars">
        {PILLARS.map(({ Icon, label, whatsapp }) => (
          <li key={label}>
            <span className={`quiz-plan-icon${whatsapp ? ' quiz-plan-icon--wa' : ''}`}>
              <Icon size={16} strokeWidth={1.75} />
            </span>
            {label}
          </li>
        ))}
      </ul>

      <span className="quiz-offer-label">No seu plano</span>
      <ul className="quiz-plan">
        {items.map(({ Icon, title, text, whatsapp }, i) => (
          <motion.li
            key={title}
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.55 + i * 0.1, ease: EASE }}
          >
            <span className={`quiz-plan-icon${whatsapp ? ' quiz-plan-icon--wa' : ''}`}>
              <Icon size={16} strokeWidth={1.75} />
            </span>
            <span>
              <strong>{title}</strong>
              <span>{text}</span>
            </span>
          </motion.li>
        ))}
      </ul>
      <p className="quiz-offer-more">E todo o resto liberado: orçamento, metas, dívidas e relatórios.</p>

      <a className="btn btn--primary btn--block btn--shine" href={CHECKOUT.completo}>
        Assinar o Completo
        <ArrowRight size={18} strokeWidth={1.75} />
      </a>
      <span className="quiz-offer-note">No celular, abra pelo navegador e toque em instalar.</span>
    </motion.div>
  )
}

// Quem não quer a IA ainda tem o Básico, com sistema e app
function BasicOption() {
  const { mensal, pixAnual } = PLANS.basico
  return (
    <div className="quiz-basic">
      <p>
        <strong>Prefere sem a IA?</strong> No Plano Básico você tem o sistema e o app por{' '}
        <b>{price(mensal)}/mês</b> ou{' '}
        {CHECKOUT.basicoPixAnual ? (
          <a href={CHECKOUT.basicoPixAnual}>
            <b>{price(pixAnual)} no Pix</b>
          </a>
        ) : (
          <b>{price(pixAnual)} no Pix</b>
        )}{' '}
        pelo ano, também com{' '}
        {TRIAL_DAYS} dias de teste grátis.
      </p>
      <a href={CHECKOUT.basicoMensal}>
        Assinar o Básico
        <ArrowRight size={14} strokeWidth={1.75} />
      </a>
    </div>
  )
}

function Result({ answers, onRestart }) {
  const profile = PROFILES[answers.hoje]
  const items = [
    { ...BY_JEITO[answers.jeito], Icon: WhatsAppIcon, whatsapp: true },
    middleItem(answers),
    BY_OBJETIVO[answers.objetivo],
  ]

  return (
    <div className="quiz-stack">
      <Mascot
        src={mascotPointing}
        alt="Mascote do Dinn apontando para o seu plano"
        width={760}
        height={361}
        parts={[
          { src: mascotPointingFinger, x: 231, y: 296, w: 99, h: 37 },
          { src: mascotPointingHand, x: 575, y: 312, w: 96, h: 49 },
        ]}
        className="quiz-mascot--point"
      />
      <div className="quiz-card quiz-card--result">
        <span className="quiz-pill quiz-pill--ok">
          <Check size={13} strokeWidth={2.75} />
          Seu plano está pronto
        </span>
        <span className="quiz-label">Seu perfil</span>
        <h1>{profile.name}</h1>
        <p>{profile.text}</p>

        <Plan items={items} />
        <BasicOption />
      </div>

      <button type="button" className="quiz-restart" onClick={onRestart}>
        <RotateCcw size={14} strokeWidth={1.75} />
        Refazer o quiz
      </button>
    </div>
  )
}

export default function Quiz() {
  const [screen, setScreen] = useState('intro')
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [picked, setPicked] = useState(null)
  const [dir, setDir] = useState(1)
  const [done, setDone] = useState(0)

  const question = QUESTIONS[index]
  const steps = ['Lendo as suas respostas', BY_ANOTA[answers.anota], 'Separando o que mais combina com você']

  // Cada tela nova começa do topo
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [screen, index])

  // Marca as etapas uma a uma e depois mostra o resultado
  useEffect(() => {
    if (screen !== 'loading') return
    if (done < steps.length) {
      const t = setTimeout(() => setDone((d) => d + 1), STEP_MS)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setScreen('result'), 500)
    return () => clearTimeout(t)
  }, [screen, done, steps.length])

  // Mostra a escolha marcada por um instante antes de ir para a próxima
  useEffect(() => {
    if (picked === null) return
    const t = setTimeout(() => {
      setAnswers((a) => ({ ...a, [question.id]: picked }))
      setPicked(null)
      setDir(1)
      if (index === QUESTIONS.length - 1) {
        setDone(0)
        setScreen('loading')
      } else {
        setIndex(index + 1)
      }
    }, 380)
    return () => clearTimeout(t)
  }, [picked, index, question.id])

  function start() {
    setDir(1)
    setIndex(0)
    setScreen('quiz')
  }

  function back() {
    if (picked !== null) return
    setDir(-1)
    if (index === 0) setScreen('intro')
    else setIndex(index - 1)
  }

  function restart() {
    setAnswers({})
    setDir(-1)
    setIndex(0)
    setScreen('intro')
  }

  const key = screen === 'quiz' ? `q${index}` : screen
  const progress = screen === 'quiz' ? (index + (picked !== null ? 1 : 0)) / QUESTIONS.length : 1

  return (
    <div className="quiz">
      <QuizBackdrop />

      <header className="quiz-top">
        <div className="quiz-top-side">
          {screen === 'quiz' && (
            <button type="button" className="quiz-back" onClick={back} aria-label="Voltar">
              <ChevronLeft size={20} strokeWidth={1.75} />
            </button>
          )}
        </div>
        <a href="/" aria-label="Dinn, voltar para o site">
          <Logo tone="light" />
        </a>
        <div className="quiz-top-side quiz-count num">
          {screen === 'quiz' && `${index + 1}/${QUESTIONS.length}`}
        </div>
      </header>

      {screen === 'quiz' && (
        <div
          className="quiz-progress"
          role="progressbar"
          aria-label="Progresso do quiz"
          aria-valuemin={0}
          aria-valuemax={QUESTIONS.length}
          aria-valuenow={index}
        >
          <motion.span
            initial={false}
            animate={{ scaleX: progress }}
            transition={{ duration: 0.5, ease: EASE }}
          />
        </div>
      )}

      <main className="quiz-main">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={key}
            custom={dir}
            variants={slide}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {screen === 'intro' && <Intro onStart={start} />}
            {screen === 'quiz' && (
              <Question
                question={question}
                chosen={picked ?? answers[question.id]}
                onPick={(value) => picked === null && setPicked(value)}
              />
            )}
            {screen === 'loading' && <Loading steps={steps} done={done} />}
            {screen === 'result' && <Result answers={answers} onRestart={restart} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
