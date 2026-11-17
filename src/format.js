const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const brlShort = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
})

export const money = (value) => brl.format(value)
export const moneyShort = (value) => brlShort.format(value)
const brlNumber = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

// "19,90", para o preço grande em que o "R$" fica menor ao lado
export const priceNumber = (value) => brlNumber.format(value)
// "R$ 97" quando é redondo, "R$ 9,90" quando tem centavos
export const price = (value) => (Number.isInteger(value) ? moneyShort(value) : money(value))
export const signed = (tipo, valor) => `${tipo === 'receita' ? '+' : '−'}${money(valor)}`
