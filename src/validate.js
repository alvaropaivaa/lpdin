// Validações usadas na tela de pagamento e no servidor (server/checkout.js), para os dois concordarem

export const digits = (value) => String(value ?? '').replace(/\D/g, '')

export const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value ?? '').trim())

export const isFullName = (value) => {
  const name = String(value ?? '').trim().replace(/\s+/g, ' ')
  return name.split(' ').length >= 2 && name.length <= 100
}

export const isPhone = (value) => [10, 11].includes(digits(value).length)

export function isCpf(value) {
  const cpf = digits(value)
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false
  for (const size of [9, 10]) {
    let sum = 0
    for (let i = 0; i < size; i++) sum += Number(cpf[i]) * (size + 1 - i)
    if (((sum * 10) % 11) % 10 !== Number(cpf[size])) return false
  }
  return true
}

// Algoritmo de Luhn, o dígito verificador dos cartões
export function isCardNumber(value) {
  const number = digits(value)
  if (number.length < 13 || number.length > 19) return false
  let sum = 0
  for (let i = 0; i < number.length; i++) {
    let d = Number(number[number.length - 1 - i])
    if (i % 2 === 1) {
      d *= 2
      if (d > 9) d -= 9
    }
    sum += d
  }
  return sum % 10 === 0
}

// "MM/AA" no futuro (o cartão vale até o fim do mês da validade)
export function isExpiry(value, now = new Date()) {
  const [m, y] = String(value ?? '').split('/').map(digits)
  const month = Number(m)
  if (!(month >= 1 && month <= 12) || y?.length !== 2) return false
  return 2000 + Number(y) > now.getFullYear() || (2000 + Number(y) === now.getFullYear() && month >= now.getMonth() + 1)
}

export const isCvv = (value) => [3, 4].includes(digits(value).length)

export const isCep = (value) => digits(value).length === 8
