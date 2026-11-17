// Servidor do pagamento: recebe os dados da tela /assinar e fala com o Asaas.
// Roda só no servidor. A chave do Asaas vem de variável de ambiente (ASAAS_API_KEY)
// e nunca vai para o navegador. Os dados do cartão passam por aqui direto para o Asaas
// e não são guardados nem escritos em log.

import { digits, isCardNumber, isCep, isCpf, isCvv, isEmail, isExpiry, isFullName, isPhone } from '../src/validate.js'

const BASES = {
  sandbox: 'https://api-sandbox.asaas.com/v3',
  production: 'https://api.asaas.com/v3',
}

// Os valores cobrados de verdade. A tela só mostra os preços; quem decide quanto cobrar é o servidor.
// Se mudar um preço aqui, mude também em src/config.js
export const PLANS = {
  // Um ano: no cartão em até 12x sem juros ou à vista no Pix
  completo: {
    description: 'Dinn - Plano Completo (anual)',
    total: 238.8,
    maxInstallments: 12,
    methods: ['CREDIT_CARD', 'PIX'],
    recurring: false,
  },
  // Mensal só no cartão. No Pix, o Básico é só o anual (basico-pix)
  basico: {
    description: 'Dinn - Plano Básico (mensal)',
    total: 9.9,
    methods: ['CREDIT_CARD'],
    recurring: true,
  },
  'basico-pix': {
    description: 'Dinn - Plano Básico (anual no Pix)',
    total: 97,
    methods: ['PIX'],
    recurring: false,
  },
}

const PAID = ['CONFIRMED', 'RECEIVED', 'RECEIVED_IN_CASH']

class CheckoutError extends Error {}

// Data de hoje no horário de Brasília, no formato que o Asaas pede (AAAA-MM-DD)
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date())

function check(condition, message) {
  if (!condition) throw new CheckoutError(message)
}

function readCustomer(input = {}) {
  const customer = {
    name: String(input.name ?? '').trim().replace(/\s+/g, ' '),
    email: String(input.email ?? '').trim().toLowerCase(),
    cpfCnpj: digits(input.cpf),
    phone: digits(input.phone),
  }
  check(isFullName(customer.name), 'Digite o seu nome completo.')
  check(isEmail(customer.email), 'Digite um e-mail válido.')
  check(isCpf(customer.cpfCnpj), 'Confira o CPF.')
  check(isPhone(customer.phone), 'Digite o celular com DDD.')
  return customer
}

function readCard(input = {}, customer) {
  const [month, year] = String(input.expiry ?? '').split('/')
  const card = {
    holderName: String(input.holderName ?? '').trim().replace(/\s+/g, ' '),
    number: digits(input.number),
    expiryMonth: digits(month).padStart(2, '0'),
    expiryYear: `20${digits(year)}`,
    ccv: digits(input.ccv),
  }
  const postalCode = digits(input.postalCode)
  const addressNumber = String(input.addressNumber ?? '').trim()

  check(isCardNumber(card.number), 'Confira o número do cartão.')
  check(card.holderName.length >= 3, 'Digite o nome como está no cartão.')
  check(isExpiry(input.expiry), 'Confira a validade do cartão.')
  check(isCvv(card.ccv), 'Confira o código de segurança (CVV).')
  check(isCep(postalCode), 'Digite o CEP de quem é o cartão.')
  check(addressNumber.length > 0 && addressNumber.length <= 10, 'Digite o número do endereço.')

  return {
    creditCard: card,
    creditCardHolderInfo: {
      name: customer.name,
      email: customer.email,
      cpfCnpj: customer.cpfCnpj,
      postalCode,
      addressNumber,
      phone: customer.phone,
      mobilePhone: customer.phone,
    },
  }
}

function client(apiKey, env) {
  const base = BASES[env === 'production' ? 'production' : 'sandbox']
  return async function asaas(path, { method = 'GET', body } = {}) {
    let res
    try {
      res = await fetch(base + path, {
        method,
        headers: {
          access_token: apiKey,
          'Content-Type': 'application/json',
          'User-Agent': 'dinn-checkout',
        },
        body: body ? JSON.stringify(body) : undefined,
        // O Asaas pede para esperar até 60 s e não repetir a cobrança às cegas
        signal: AbortSignal.timeout(60_000),
      })
    } catch {
      throw new CheckoutError('O pagamento demorou para responder. Confira o seu e-mail antes de tentar de novo.')
    }
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      const message = data.errors?.[0]?.description
      throw new CheckoutError(message || 'Não deu para concluir o pagamento. Tente de novo.')
    }
    return data
  }
}

// Usa o cliente que já existe com o mesmo CPF, para não duplicar no Asaas
async function customerId(asaas, customer) {
  const found = await asaas(`/customers?cpfCnpj=${customer.cpfCnpj}&limit=1`)
  if (found.data?.[0]?.id) return found.data[0].id
  const created = await asaas('/customers', {
    method: 'POST',
    body: {
      name: customer.name,
      cpfCnpj: customer.cpfCnpj,
      email: customer.email,
      mobilePhone: customer.phone,
    },
  })
  return created.id
}

async function pixFor(asaas, paymentId) {
  const qr = await asaas(`/payments/${paymentId}/pixQrCode`)
  return { image: qr.encodedImage, payload: qr.payload, expiresAt: qr.expirationDate }
}

async function pay(asaas, body, remoteIp) {
  const plan = PLANS[body.plan]
  check(plan, 'Escolha um plano.')
  check(plan.methods.includes(body.method), 'Escolha a forma de pagamento.')

  const customer = readCustomer(body.customer)
  const card = body.method === 'CREDIT_CARD' ? readCard(body.card, customer) : null
  const installments = Math.min(Math.max(Number(body.card?.installments) || 1, 1), plan.maxInstallments || 1)

  const base = {
    customer: await customerId(asaas, customer),
    billingType: body.method,
    description: plan.description,
    externalReference: body.plan,
  }

  if (plan.recurring) {
    const subscription = await asaas('/subscriptions', {
      method: 'POST',
      body: { ...base, value: plan.total, nextDueDate: today(), cycle: 'MONTHLY', ...card, remoteIp },
    })
    const first = (await asaas(`/subscriptions/${subscription.id}/payments`)).data?.[0]
    return { ok: true, paid: !first || PAID.includes(first.status), paymentId: first?.id }
  }

  const value =
    installments > 1
      ? { installmentCount: installments, totalValue: plan.total }
      : { value: plan.total }
  const payment = await asaas('/payments', {
    method: 'POST',
    body: { ...base, ...value, dueDate: today(), ...card, remoteIp },
  })
  if (body.method === 'PIX') {
    return { ok: true, paid: false, paymentId: payment.id, pix: await pixFor(asaas, payment.id) }
  }
  return {
    ok: true,
    paid: PAID.includes(payment.status),
    paymentId: payment.id,
    // Alguns cartões pedem a confirmação do banco (3D Secure) numa página à parte
    redirect: PAID.includes(payment.status) ? undefined : payment.threeDSecureChallengeUrl,
  }
}

// A tela pergunta de tempos em tempos se o Pix já foi pago. Só devolve o status
async function status(asaas, body) {
  const id = String(body.paymentId ?? '')
  check(/^[a-z0-9_]{6,40}$/i.test(id), 'Pagamento não encontrado.')
  const payment = await asaas(`/payments/${id}`)
  return { ok: true, paid: PAID.includes(payment.status) }
}

// Ponto de entrada, igual em qualquer servidor: recebe o corpo JSON e devolve a resposta
export async function handleCheckout(body, { apiKey, env, remoteIp }) {
  if (!apiKey) return { ok: false, error: 'O pagamento ainda não está configurado no servidor.' }
  const asaas = client(apiKey, env)
  try {
    if (body?.action === 'status') return await status(asaas, body)
    if (body?.action === 'pay') return await pay(asaas, body, remoteIp)
    return { ok: false, error: 'Pedido inválido.' }
  } catch (error) {
    if (error instanceof CheckoutError) return { ok: false, error: error.message }
    console.error('[checkout]', error?.message)
    return { ok: false, error: 'Não deu para concluir o pagamento. Tente de novo.' }
  }
}
