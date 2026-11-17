import { motion } from 'motion/react'
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Fuel,
  Gauge,
  Nfc,
  PiggyBank,
  ShoppingCart,
  Wallet,
  Zap,
} from 'lucide-react'
import { LogoMark } from './Logo'
import { WaBubble } from './chat'
import { CountUp, EASE, Reveal, TiltCard, VIEWPORT } from './motion'
import Swipe from './Swipe'
import { APP_URL } from '../config'
import { money, signed } from '../format'
import bbLogo from '../assets/brands/bb.svg'
import itauLogo from '../assets/brands/itau.svg'
import nubankLogo from '../assets/brands/nubank.svg'
import ifoodLogo from '../assets/brands/ifood.webp'

/* ---------- Cartões escuros ---------- */

const appear = (delay) => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: VIEWPORT,
  transition: { duration: 0.8, delay, ease: EASE },
})

function BankCards() {
  return (
    <div className="banks">
      <motion.div className="bank bank--bb" {...appear(0.1)}>
        <span
          className="bank-bb-logo"
          role="img"
          aria-label="Banco do Brasil"
          style={{ maskImage: `url(${bbLogo})`, WebkitMaskImage: `url(${bbLogo})` }}
        />
        <svg className="bank-wave" viewBox="0 0 260 164" aria-hidden="true">
          <path d="M120 0 C 150 60, 130 110, 210 164" />
        </svg>
      </motion.div>

      <motion.div className="bank bank--itau" {...appear(0.2)}>
        <img className="bank-itau-logo" src={itauLogo} alt="Itaú" />
      </motion.div>

      <motion.div className="bank bank--nu" {...appear(0.3)}>
        <span className="bank-emv" aria-hidden="true" />
        <Nfc className="bank-nfc" size={20} strokeWidth={1.5} aria-hidden="true" />
        <span className="bank-holder">Marina Souza</span>
        <img className="bank-nu-logo" src={nubankLogo} alt="Nubank" />
      </motion.div>
    </div>
  )
}

const MERCHANTS = [
  {
    key: 'mercado',
    tile: <ShoppingCart size={34} strokeWidth={1.5} />,
    label: 'Supermercado',
    price: 187.4,
    category: 'Mercado',
  },
  {
    key: 'ifood',
    tile: <img src={ifoodLogo} alt="iFood" />,
    price: 58.9,
    category: 'Alimentação',
    className: 'merchant-tile--ifood',
  },
  {
    key: 'posto',
    tile: <Fuel size={32} strokeWidth={1.5} />,
    label: 'Posto',
    price: 120,
    category: 'Transporte',
  },
]

function Merchants() {
  return (
    <div className="merchants">
      {MERCHANTS.map(({ key, tile, label, price, category, className = '' }, i) => (
        <div className="merchant" key={key}>
          <motion.span
            className={`merchant-tile ${className}`}
            aria-label={label}
            initial={{ opacity: 0, scale: 0.7 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={VIEWPORT}
            transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.15 + i * 0.12 }}
          >
            {tile}
          </motion.span>
          <motion.span
            className="num merchant-price"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.5, delay: 0.4 + i * 0.12 }}
          >
            {money(price)}
          </motion.span>
          <motion.span
            className="merchant-line"
            style={{ originY: 0 }}
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.5, delay: 0.7 + i * 0.12, ease: EASE }}
          />
          <motion.span
            className="merchant-cat"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.5, delay: 1 + i * 0.12, ease: EASE }}
          >
            {category}
          </motion.span>
        </div>
      ))}
    </div>
  )
}

const FOOD_MONTHS = [
  ['Setembro', 386.2],
  ['Outubro', 441.7],
  ['Novembro', 412.3],
]

function WhatsAppCard() {
  const max = Math.max(...FOOD_MONTHS.map(([, v]) => v))
  return (
    <div className="wa wa--dark wa-card">
      <div className="wa-card-head">
        <span className="wa-avatar">
          <LogoMark size={16} />
        </span>
        <div>
          <strong>Dinn</strong>
          <span>online</span>
        </div>
      </div>

      <motion.div {...appear(0.2)} className="wa-card-row wa-card-row--me">
        <WaBubble from="me" time="09:41">
          gastei 58,90 no ifood
        </WaBubble>
      </motion.div>

      <motion.div {...appear(0.7)} className="wa-card-row">
        <WaBubble from="bot" time="09:41">
          <span className="wa-card-from">
            <LogoMark size={12} />
            Dinn · Assistente
          </span>
          <p>
            Lancei <b>R$ 58,90</b> em <b>Alimentação</b>. No mês, são <b>R$ 412,30</b> nessa
            categoria.
          </p>
          <div className="wa-bars">
            {FOOD_MONTHS.map(([month, value], i) => (
              <div key={month} className="wa-bar-col">
                <div className="wa-bar-area">
                  <motion.span
                    className={`wa-bar${i === FOOD_MONTHS.length - 1 ? ' is-current' : ''}`}
                    style={{ height: `${(value / max) * 100}%`, originY: 1 }}
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={VIEWPORT}
                    transition={{ duration: 0.7, delay: 1 + i * 0.1, ease: EASE }}
                  />
                </div>
                <span className="num">{money(value)}</span>
                <span>{month}</span>
              </div>
            ))}
          </div>
        </WaBubble>
      </motion.div>
    </div>
  )
}

const MONEY_CARDS = [
  {
    title: 'Todos os seus cartões e contas num só lugar.',
    text: 'Banco do Brasil, Itaú, Nubank: cada cartão aparece com a logo do banco, o saldo e a fatura do mês.',
    Visual: BankCards,
  },
  {
    title: 'Cada gasto já entra na categoria certa.',
    text: 'Mandou “58,90 no ifood” no WhatsApp? O Dinn lança em Alimentação, sem você escolher nada.',
    Visual: Merchants,
  },
  {
    title: 'Tudo resolvido numa mensagem no WhatsApp.',
    text: 'Lance, corrija ou desfaça escrevendo do seu jeito. A resposta chega na hora, com os seus números.',
    Visual: WhatsAppCard,
  },
]

export function MoneySection() {
  return (
    <section className="section section--dark" id="recursos" data-tone="dark">
      <div className="container">
        <Reveal className="section-head">
          <h2 className="title">
            Saiba exatamente para onde vai o seu dinheiro, sem somar fatura na mão.
          </h2>
        </Reveal>

        <Swipe className="cards-grid">
          {MONEY_CARDS.map(({ title, text, Visual }, i) => (
            <TiltCard
              className="card card--dark"
              key={title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT}
              transition={{ duration: 0.8, delay: i * 0.08, ease: EASE }}
            >
              <div className="card-visual">
                <Visual />
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </TiltCard>
          ))}
        </Swipe>

        <Reveal className="section-foot">
          <a className="link-arrow" href={APP_URL}>
            Começar agora
            <ArrowRight size={16} strokeWidth={1.75} />
          </a>
        </Reveal>
      </div>
    </section>
  )
}

/* ---------- Funcionalidades: o pedaço principal de cada tela do app ---------- */

// Cada linha entra um pouco depois da anterior
const rise = (i, base = 0.25) => ({
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: VIEWPORT,
  transition: { duration: 0.6, delay: base + i * 0.12, ease: EASE },
})

// Barra de progresso que enche quando aparece
function Bar({ value, tone = 'pos', delay = 0.5, mark }) {
  return (
    <span className="ui-track">
      <motion.span
        className={`ui-fill ui-fill--${tone}`}
        initial={{ width: 0 }}
        whileInView={{ width: `${value}%` }}
        viewport={VIEWPORT}
        transition={{ duration: 1.3, delay, ease: EASE }}
      />
      {mark !== undefined && <span className="ui-mark" style={{ left: `${mark}%` }} />}
    </span>
  )
}

const ENTRIES = [
  { Icon: Briefcase, name: 'Salário', cat: 'Receita', tipo: 'receita', valor: 7400 },
  { Icon: ShoppingCart, name: 'Mercado', cat: 'Compras', tipo: 'despesa', valor: 312.4 },
  { Icon: Zap, name: 'Conta de luz', cat: 'Contas da casa', tipo: 'despesa', valor: 189.9 },
]

function EntriesUI() {
  return (
    <div className="ui ui-list">
      {ENTRIES.map(({ Icon, name, cat, tipo, valor }, i) => (
        <motion.div className="ui-row" key={name} {...rise(i)}>
          <span className="ui-icon">
            <Icon size={16} strokeWidth={1.75} />
          </span>
          <span className="ui-name">
            <strong>{name}</strong>
            <span>{cat}</span>
          </span>
          <span className={`num ${tipo === 'receita' ? 'pos' : 'neg'}`}>{signed(tipo, valor)}</span>
        </motion.div>
      ))}
    </div>
  )
}

const ACCOUNTS = [
  { name: 'Nubank', kind: 'Conta corrente', valor: 2997.86, logo: nubankLogo, className: 'ui-icon--nu' },
  { name: 'Itaú', kind: 'Conta corrente', valor: 5500.78, logo: itauLogo, className: 'ui-icon--logo' },
  { name: 'Carteira', kind: 'Dinheiro', valor: 845.22 },
]

function AccountsUI() {
  return (
    <div className="ui ui-list">
      {ACCOUNTS.map(({ name, kind, valor, logo, className = '' }, i) => (
        <motion.div className="ui-row" key={name} {...rise(i)}>
          <span className={`ui-icon ${className}`}>
            {logo ? <img src={logo} alt="" /> : <Wallet size={16} strokeWidth={1.75} />}
          </span>
          <span className="ui-name">
            <strong>{name}</strong>
            <span>{kind}</span>
          </span>
          <span className="num">{money(valor)}</span>
        </motion.div>
      ))}
    </div>
  )
}

function BudgetUI() {
  return (
    <div className="ui">
      <div className="ui-head">
        <span className="ui-icon ui-icon--tint">
          <Gauge size={16} strokeWidth={1.75} />
        </span>
        <strong>Limite do mês</strong>
        <span className="ui-chip">No controle</span>
      </div>
      <div className="ui-big pos">
        <CountUp value={68} format={(v) => `${Math.round(v)}%`} delay={0.3} />
      </div>
      <div className="ui-sub">
        <span className="num">R$ 2.367,19</span> de <span className="num">R$ 3.470,00</span>
      </div>
      <Bar value={68} mark={52} />
    </div>
  )
}

function GoalUI() {
  return (
    <div className="ui-stack">
      <div className="ui ui--ghost" aria-hidden="true" />
      <div className="ui">
        <div className="ui-head">
          <span className="ui-icon">
            <PiggyBank size={16} strokeWidth={1.75} />
          </span>
          <span className="ui-name">
            <strong>Reserva de emergência</strong>
            <span>R$ 600,00 por mês</span>
          </span>
        </div>
        <div className="ui-split">
          <span className="ui-mid num">
            <CountUp value={10800} format={money} delay={0.3} />
          </span>
          <span className="ui-sub">
            de <span className="num">R$ 24.000,00</span> · <b>45%</b>
          </span>
        </div>
        <Bar value={45} />
      </div>
    </div>
  )
}

function DebtsUI() {
  return (
    <div className="ui-pair">
      <motion.div className="ui" {...rise(0)}>
        <span className="ui-icon ui-icon--neg">
          <ArrowUpRight size={16} strokeWidth={1.75} />
        </span>
        <span className="ui-label">Eu devo</span>
        <span className="num ui-value">{money(35643.62)}</span>
      </motion.div>
      <motion.div className="ui" {...rise(1)}>
        <span className="ui-icon ui-icon--tint">
          <ArrowDownLeft size={16} strokeWidth={1.75} />
        </span>
        <span className="ui-label">Me devem</span>
        <span className="num ui-value pos">{money(900)}</span>
      </motion.div>
    </div>
  )
}

const FLOW = [
  { label: 'Receitas', valor: 7400, tone: 'pos' },
  { label: 'Despesas', valor: 6142.63, tone: 'neg' },
]

function ReportUI() {
  return (
    <div className="ui">
      {FLOW.map(({ label, valor, tone }, i) => (
        <div className="ui-flow" key={label}>
          <span className="ui-flow-head">
            <span>{label}</span>
            <span className="num">{money(valor)}</span>
          </span>
          <Bar value={(valor / FLOW[0].valor) * 100} tone={tone} delay={0.4 + i * 0.15} />
        </div>
      ))}
      <div className="ui-foot">
        Sobrou <b className="num pos">R$ 1.257,37</b> no mês.
      </div>
    </div>
  )
}

const FEATURES = [
  {
    title: 'Lançamentos',
    text: 'Receitas, despesas e transferências do mês, com o que já foi pago e o que falta pagar.',
    Visual: EntriesUI,
  },
  {
    title: 'Contas e cartões',
    text: 'O saldo de cada conta e a fatura de cada cartão, com a logo do banco.',
    Visual: AccountsUI,
  },
  {
    title: 'Orçamento',
    text: 'Um limite para cada categoria e quanto ainda dá para gastar por dia até o fim do mês.',
    Visual: BudgetUI,
  },
  {
    title: 'Metas',
    text: 'Quanto você já guardou, quanto falta e a previsão de quando chega lá.',
    Visual: GoalUI,
  },
  {
    title: 'Dívidas',
    text: 'O que você deve e o que te devem, com parcelas, vencimentos e lembrete no WhatsApp.',
    Visual: DebtsUI,
  },
  {
    title: 'Relatórios',
    text: 'Receitas, despesas, fluxo de caixa e taxa de economia, com exportação em PDF e planilha.',
    Visual: ReportUI,
  },
]

export function FeatureGrid() {
  return (
    <section className="section section--alt" id="funcionalidades" data-tone="light">
      <div className="container">
        <Reveal className="section-head">
          <h2 className="title">Tudo o que você lança fica organizado para consultar quando quiser.</h2>
          <p className="lead">
            Cada mensagem ajuda a montar o retrato completo do seu dinheiro, no app e no
            computador.
          </p>
        </Reveal>

        <Swipe className="cards-grid">
          {FEATURES.map(({ title, text, Visual }, i) => (
            <TiltCard
              className="card card--light feat-card"
              key={title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT}
              transition={{ duration: 0.8, delay: (i % 3) * 0.08, ease: EASE }}
            >
              <div className="card-visual feat-visual">
                <div className="feat-ui">
                  <Visual />
                </div>
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
