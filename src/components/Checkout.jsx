import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  ArrowLeft,
  CalendarCheck,
  Check,
  CircleAlert,
  Copy,
  CreditCard,
  LoaderCircle,
  Lock,
  QrCode,
  ShieldCheck,
} from 'lucide-react'
import Logo from './Logo'
import { EASE } from './motion'
import { WhatsAppIcon } from './ui'
import { APP_URL, PLANS, TEST_MODE, TRIAL_DAYS } from '../config'
import { money, price } from '../format'
import { isCardNumber, isCep, isCpf, isCvv, isEmail, isExpiry, isFullName, isPhone } from '../validate'
import artCompleto from '../assets/quiz/quiz-jeito.webp'
import artBasico from '../assets/quiz/quiz-anota.webp'
import artPago from '../assets/quiz/quiz-objetivo.webp'

/* ---------- Planos ---------- */

const { basico, completo } = PLANS
const COMPLETO_TOTAL = Math.round(completo.parcelas * completo.parcela * 100) / 100

const BASICO_LINES = [
  'Sistema no computador e app no celular',
  'Contas, cartões, orçamento, metas e dívidas',
  'Relatórios e avisos de vencimento',
]

// As abas Cartão e Pix do Básico: o mensal é só no cartão e o Pix é só o anual,
// então trocar de aba troca de plano
const BASICO_TABS = [
  { method: 'CREDIT_CARD', plan: 'basico', label: 'Cartão', note: `${money(basico.mensal)} por mês` },
  { method: 'PIX', plan: 'basico-pix', label: 'Pix', note: `${price(basico.pixAnual)} por ano` },
]

// Só para mostrar. O valor cobrado de verdade é decidido no servidor (server/checkout.js)
const PLAN_INFO = {
  completo: {
    name: 'Plano Completo',
    tag: 'Com IA no WhatsApp',
    art: artCompleto,
    lines: ['IA no WhatsApp que lança por você', 'Lance por mensagem, áudio ou foto', 'Tudo do Básico: sistema, app e relatórios'],
    total: COMPLETO_TOTAL,
    maxInstallments: completo.parcelas,
    big: `${completo.parcelas}x ${money(completo.parcela)}`,
    small: `no cartão, sem juros, ou ${money(completo.pixAnual)} à vista no Pix`,
    pixNote: `Um ano de acesso por ${money(completo.pixAnual)}, à vista.`,
    tabs: [
      { method: 'CREDIT_CARD', label: 'Cartão', note: `até ${completo.parcelas}x sem juros` },
      { method: 'PIX', label: 'Pix', note: `${money(completo.pixAnual)} à vista` },
    ],
  },
  basico: {
    name: 'Plano Básico',
    tag: 'Mensal no cartão',
    art: artBasico,
    lines: BASICO_LINES,
    total: basico.mensal,
    big: `${money(basico.mensal)}/mês`,
    small: `no cartão, ou ${price(basico.pixAnual)} por ano no Pix`,
    tabs: BASICO_TABS,
  },
  'basico-pix': {
    name: 'Plano Básico',
    tag: 'Anual no Pix',
    art: artBasico,
    lines: BASICO_LINES,
    total: basico.pixAnual,
    big: price(basico.pixAnual),
    small: `por um ano no Pix, ou ${money(basico.mensal)}/mês no cartão`,
    pixNote: `Um ano de acesso por ${price(basico.pixAnual)}.`,
    tabs: BASICO_TABS,
  },
}

const params = () => new URLSearchParams(window.location.search)

function planFromUrl() {
  const plan = params().get('plano')
  return PLAN_INFO[plan] ? plan : 'completo'
}

// /assinar/?plano=completo&pagamento=pix já abre com o Pix escolhido
const methodFromUrl = () => (params().get('pagamento') === 'pix' ? 'PIX' : 'CREDIT_CARD')

/* ---------- Máscaras dos campos ---------- */

const only = (value, size) => value.replace(/\D/g, '').slice(0, size)

const MASKS = {
  cpf: (v) =>
    only(v, 11)
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2'),
  phone: (v) => {
    const d = only(v, 11)
    if (d.length <= 2) return d.length ? `(${d}` : ''
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  },
  number: (v) => only(v, 19).replace(/(\d{4})(?=\d)/g, '$1 '),
  expiry: (v) => {
    const d = only(v, 4)
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
  },
  ccv: (v) => only(v, 4),
  postalCode: (v) => only(v, 8).replace(/(\d{5})(\d)/, '$1-$2'),
}

const EMPTY = {
  name: '',
  email: '',
  cpf: '',
  phone: '',
  number: '',
  holderName: '',
  expiry: '',
  ccv: '',
  postalCode: '',
  addressNumber: '',
}

// Mesmas regras do servidor, para a pessoa ver o erro antes de enviar
function validate(form, method) {
  const errors = {}
  if (!isFullName(form.name)) errors.name = 'Digite o seu nome completo.'
  if (!isEmail(form.email)) errors.email = 'Digite um e-mail válido.'
  if (!isCpf(form.cpf)) errors.cpf = 'Confira o CPF.'
  if (!isPhone(form.phone)) errors.phone = 'Digite o celular com DDD.'
  if (method === 'CREDIT_CARD') {
    if (!isCardNumber(form.number)) errors.number = 'Confira o número do cartão.'
    if (form.holderName.trim().length < 3) errors.holderName = 'Digite o nome como está no cartão.'
    if (!isExpiry(form.expiry)) errors.expiry = 'Validade inválida.'
    if (!isCvv(form.ccv)) errors.ccv = 'CVV inválido.'
    if (!isCep(form.postalCode)) errors.postalCode = 'Digite o CEP.'
    if (!form.addressNumber.trim()) errors.addressNumber = 'Digite o número.'
  }
  return errors
}

async function api(body) {
  try {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return await res.json()
  } catch {
    return { ok: false, error: 'Sem conexão com o pagamento. Confira a internet e tente de novo.' }
  }
}

/* ---------- Peças ---------- */

function Field({ id, label, error, hint, className = '', ...input }) {
  return (
    <div className={`co-field ${className}`}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        {...input}
      />
      {error ? (
        <span className="co-error" id={`${id}-error`}>
          {error}
        </span>
      ) : (
        hint && (
          <span className="co-hint" id={`${id}-hint`}>
            {hint}
          </span>
        )
      )}
    </div>
  )
}

const fade = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
}

// Resumo do plano, com a troca entre Completo e Básico
function Summary({ plan, onPlan }) {
  const info = PLAN_INFO[plan]
  const isBasico = plan !== 'completo'
  return (
    <aside className="co-summary">
      <div className="co-switch" role="tablist" aria-label="Plano">
        {[
          ['completo', 'Completo'],
          ['basico', 'Básico'],
        ].map(([value, label]) => {
          const on = value === 'completo' ? !isBasico : isBasico
          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={on}
              className={on ? 'is-on' : undefined}
              onClick={() => onPlan(value === 'basico' && isBasico ? plan : value)}
            >
              {value === 'completo' && <WhatsAppIcon size={14} />}
              {label}
            </button>
          )
        })}
      </div>

      <div className="co-plan">
        <img src={info.art} alt="" width="484" height="511" />
        <div>
          <span className="co-plan-tag">{info.tag}</span>
          <strong>{info.name}</strong>
        </div>
      </div>

      <div className="co-price">
        <span className="co-price-big">{info.big}</span>
        <span className="co-price-small">{info.small}</span>
      </div>

      <ul className="co-lines">
        {info.lines.map((line) => (
          <li key={line}>
            <Check size={14} strokeWidth={2.5} />
            {line}
          </li>
        ))}
      </ul>

      <div className="co-trial">
        <CalendarCheck size={18} strokeWidth={1.75} />
        <span>
          <strong>{TRIAL_DAYS} dias de teste grátis</strong>
          contados depois da compra
        </span>
      </div>
    </aside>
  )
}

/* ---------- Formulário ---------- */

function PaymentForm({ plan, onPlan, onPix, onPaid }) {
  const info = PLAN_INFO[plan]
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  // No Completo a pessoa escolhe cartão ou Pix. No Básico a aba é o próprio plano (mensal ou anual)
  const [chosen, setChosen] = useState(methodFromUrl)
  const method = plan === 'basico' ? 'CREDIT_CARD' : plan === 'basico-pix' ? 'PIX' : chosen
  const [installments, setInstallments] = useState(info.maxInstallments || 1)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const formRef = useRef(null)

  // Trocou de plano: volta para as parcelas que ele aceita
  useEffect(() => {
    setInstallments(info.maxInstallments || 1)
    setServerError('')
  }, [plan, info.maxInstallments])

  function pickTab(tab) {
    if (tab.plan) onPlan(tab.plan)
    else setChosen(tab.method)
    setServerError('')
  }

  const set = (key) => (event) => {
    const value = MASKS[key] ? MASKS[key](event.target.value) : event.target.value
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const field = (key) => ({ value: form[key], onChange: set(key), error: errors[key] })

  async function submit(event) {
    event.preventDefault()
    if (loading) return
    const found = validate(form, method)
    setErrors(found)
    setServerError('')
    const first = Object.keys(EMPTY).find((key) => found[key])
    if (first) {
      formRef.current?.querySelector(`#${first}`)?.focus()
      return
    }

    setLoading(true)
    const result = await api({
      action: 'pay',
      plan,
      method,
      customer: { name: form.name, email: form.email, cpf: form.cpf, phone: form.phone },
      card:
        method === 'CREDIT_CARD'
          ? {
              number: form.number,
              holderName: form.holderName,
              expiry: form.expiry,
              ccv: form.ccv,
              postalCode: form.postalCode,
              addressNumber: form.addressNumber,
              installments,
            }
          : undefined,
    })
    setLoading(false)

    if (!result.ok) return setServerError(result.error)
    if (result.redirect) return window.location.assign(result.redirect)
    if (result.pix) return onPix({ ...result.pix, paymentId: result.paymentId }, form)
    if (result.paid) return onPaid(form)
    setServerError('O pagamento ficou em análise. Você recebe a confirmação por e-mail.')
  }

  const perInstallment = Math.round((info.total / installments) * 100) / 100
  const isCard = method === 'CREDIT_CARD'
  const button = !isCard
    ? `Gerar Pix de ${price(info.total)}`
    : plan === 'basico'
      ? `Assinar por ${money(info.total)}/mês`
      : installments > 1
        ? `Pagar ${installments}x de ${money(perInstallment)}`
        : `Pagar ${money(info.total)}`

  return (
    <form className="co-card" onSubmit={submit} noValidate ref={formRef}>
      <section className="co-section">
        <h2>
          <span className="co-step">1</span>
          Seus dados
        </h2>
        <div className="co-grid2">
          <Field id="name" label="Nome completo" autoComplete="name" className="co-span2" {...field('name')} />
          <Field
            id="email"
            label="E-mail"
            type="email"
            autoComplete="email"
            inputMode="email"
            hint="O comprovante chega aqui."
            className="co-span2"
            {...field('email')}
          />
          <Field id="cpf" label="CPF" inputMode="numeric" placeholder="000.000.000-00" {...field('cpf')} />
          <Field
            id="phone"
            label="Celular (WhatsApp)"
            type="tel"
            autoComplete="tel-national"
            inputMode="numeric"
            placeholder="(00) 00000-0000"
            {...field('phone')}
          />
        </div>
      </section>

      <section className="co-section">
        <h2>
          <span className="co-step">2</span>
          Pagamento
        </h2>

        <div className="co-methods" role="radiogroup" aria-label="Forma de pagamento">
          {info.tabs.map((tab) => (
            <button
              key={tab.method}
              type="button"
              role="radio"
              aria-checked={method === tab.method}
              className={method === tab.method ? 'is-on' : undefined}
              onClick={() => pickTab(tab)}
            >
              <span className="co-method-name">
                {tab.method === 'CREDIT_CARD' ? (
                  <CreditCard size={18} strokeWidth={1.75} />
                ) : (
                  <QrCode size={18} strokeWidth={1.75} />
                )}
                {tab.label}
              </span>
              <small>{tab.note}</small>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {isCard ? (
            <motion.div key="card" className="co-grid2" {...fade}>
              <Field
                id="number"
                label="Número do cartão"
                autoComplete="cc-number"
                inputMode="numeric"
                placeholder="0000 0000 0000 0000"
                className="co-span2"
                {...field('number')}
              />
              <Field
                id="holderName"
                label="Nome impresso no cartão"
                autoComplete="cc-name"
                className="co-span2"
                {...field('holderName')}
              />
              <Field
                id="expiry"
                label="Validade"
                autoComplete="cc-exp"
                inputMode="numeric"
                placeholder="MM/AA"
                {...field('expiry')}
              />
              <Field id="ccv" label="CVV" autoComplete="cc-csc" inputMode="numeric" placeholder="123" {...field('ccv')} />
              {info.maxInstallments > 1 && (
                <div className="co-field co-span2">
                  <label htmlFor="installments">Parcelas</label>
                  <select
                    id="installments"
                    value={installments}
                    onChange={(e) => setInstallments(Number(e.target.value))}
                  >
                    {Array.from({ length: info.maxInstallments }, (_, i) => info.maxInstallments - i).map((n) => (
                      <option key={n} value={n}>
                        {n}x de {money(Math.round((info.total / n) * 100) / 100)}
                        {n > 1 ? ' sem juros' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <Field
                id="postalCode"
                label="CEP"
                autoComplete="postal-code"
                inputMode="numeric"
                placeholder="00000-000"
                hint="Do endereço de quem é o cartão."
                {...field('postalCode')}
              />
              <Field id="addressNumber" label="Número" autoComplete="address-line2" {...field('addressNumber')} />
            </motion.div>
          ) : (
            <motion.div key="pix" className="co-pix-info" {...fade}>
              <QrCode size={22} strokeWidth={1.75} />
              <p>
                {info.pixNote} O QR Code aparece na próxima tela e a confirmação sai na hora.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <div className="co-total">
        <span>Total</span>
        <strong>
          {isCard && installments > 1 ? `${installments}x de ${money(perInstallment)}` : price(info.total)}
          {plan === 'basico' && <small>/mês</small>}
        </strong>
      </div>

      {serverError && (
        <div className="co-alert" role="alert">
          <CircleAlert size={18} strokeWidth={1.75} />
          {serverError}
        </div>
      )}

      <button type="submit" className="btn btn--primary btn--block btn--shine co-submit" disabled={loading}>
        {loading ? (
          <>
            <LoaderCircle size={18} strokeWidth={2} className="co-spin" />
            Processando…
          </>
        ) : (
          <>
            <Lock size={16} strokeWidth={2} />
            {button}
          </>
        )}
      </button>

      {loading && isCard && (
        <p className="co-wait-note" aria-live="polite">
          O banco está confirmando o cartão. Pode levar alguns segundos, não feche a página.
        </p>
      )}

      <p className="co-safe">
        <ShieldCheck size={15} strokeWidth={1.75} />
        Pagamento processado com segurança pelo Asaas. O Dinn não guarda os dados do cartão.
      </p>
    </form>
  )
}

/* ---------- Pix e confirmação ---------- */

function PixStep({ pix, plan, onPaid }) {
  const [copied, setCopied] = useState(false)

  // Pergunta ao servidor a cada 4 segundos se o Pix já caiu
  useEffect(() => {
    let alive = true
    const timer = setInterval(async () => {
      const result = await api({ action: 'status', paymentId: pix.paymentId })
      if (alive && result.ok && result.paid) onPaid()
    }, 4000)
    return () => {
      alive = false
      clearInterval(timer)
    }
  }, [pix.paymentId, onPaid])

  async function copy() {
    try {
      await navigator.clipboard.writeText(pix.payload)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <motion.div className="co-card co-card--center" {...fade}>
      <span className="co-badge">
        <QrCode size={14} strokeWidth={2} />
        Pix de {price(PLAN_INFO[plan].total)}
      </span>
      <h1>Pague com o Pix</h1>
      <p className="co-lead">Abra o app do seu banco, escolha Pix e leia o QR Code ou cole o código.</p>

      <div className="co-qr">
        <img src={`data:image/png;base64,${pix.image}`} alt="QR Code do Pix" width="220" height="220" />
      </div>

      <button type="button" className="btn btn--outline btn--block co-copy" onClick={copy}>
        {copied ? <Check size={16} strokeWidth={2.5} /> : <Copy size={16} strokeWidth={1.75} />}
        {copied ? 'Código copiado' : 'Copiar código Pix'}
      </button>

      <div className="co-waiting" aria-live="polite">
        <LoaderCircle size={16} strokeWidth={2} className="co-spin" />
        Esperando o pagamento. Esta tela muda sozinha quando o Pix cair.
      </div>

      {TEST_MODE && (
        <p className="co-test-hint">
          No sandbox o Pix não cai sozinho: confirme o pagamento em sandbox.asaas.com, em Cobranças.
        </p>
      )}
    </motion.div>
  )
}

function PaidStep({ plan, customer }) {
  const firstName = customer?.name.trim().split(' ')[0]
  return (
    <motion.div className="co-card co-card--center co-card--paid" {...fade}>
      <motion.img
        className="co-paid-art"
        src={artPago}
        alt=""
        width="484"
        height="511"
        initial={{ scale: 0.6, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 160, damping: 12, delay: 0.15 }}
      />
      <span className="co-badge co-badge--ok">
        <Check size={14} strokeWidth={2.75} />
        Pagamento confirmado
      </span>
      <h1>{firstName ? `Tudo certo, ${firstName}!` : 'Tudo certo!'}</h1>
      <p className="co-lead">
        Você assinou o {PLAN_INFO[plan].name}. O comprovante foi para <b>{customer?.email}</b>.
      </p>
      <div className="co-trial co-trial--light">
        <CalendarCheck size={18} strokeWidth={1.75} />
        <span>
          <strong>Você tem {TRIAL_DAYS} dias para testar</strong>
          contados a partir de hoje
        </span>
      </div>
      {APP_URL !== '#' ? (
        <a className="btn btn--primary btn--block btn--shine" href={APP_URL}>
          Abrir o Dinn
        </a>
      ) : (
        <a className="btn btn--outline btn--block" href="/">
          Voltar para o site
        </a>
      )}
    </motion.div>
  )
}

/* ---------- Página ---------- */

export default function Checkout() {
  const [plan, setPlan] = useState(planFromUrl)
  const [step, setStep] = useState('form')
  const [pix, setPix] = useState(null)
  const [customer, setCustomer] = useState(null)

  // Guarda o plano no endereço, para o link continuar valendo se a pessoa recarregar
  function choosePlan(value) {
    setPlan(value)
    const url = new URL(window.location.href)
    url.searchParams.set('plano', value)
    window.history.replaceState(null, '', url)
  }

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [step])

  const paid = useRef(() => setStep('paid')).current

  return (
    <div className="co">
      <span className="co-glow" aria-hidden="true" />
      <header className="co-top">
        <a className="co-back" href="/#planos" aria-label="Voltar para os planos">
          <ArrowLeft size={18} strokeWidth={1.75} />
          <span>Voltar</span>
        </a>
        <a href="/" aria-label="Dinn, voltar para o site">
          <Logo tone="light" />
        </a>
        <span className="co-secure">
          <Lock size={13} strokeWidth={2} />
          <span>Pagamento seguro</span>
        </span>
      </header>

      <main className="co-main">
        <AnimatePresence mode="wait">
          {step === 'form' && (
            <motion.div key="form" className="co-layout" {...fade}>
              <Summary plan={plan} onPlan={choosePlan} />
              <PaymentForm
                plan={plan}
                onPlan={choosePlan}
                onPix={(data, form) => {
                  setPix(data)
                  setCustomer(form)
                  setStep('pix')
                }}
                onPaid={(form) => {
                  setCustomer(form)
                  setStep('paid')
                }}
              />
            </motion.div>
          )}
          {step === 'pix' && (
            <motion.div key="pix" className="co-narrow" {...fade}>
              <PixStep pix={pix} plan={plan} onPaid={paid} />
            </motion.div>
          )}
          {step === 'paid' && (
            <motion.div key="paid" className="co-narrow" {...fade}>
              <PaidStep plan={plan} customer={customer} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
