// Troque pelo endereço do app (ex.: a URL do PWA)
export const APP_URL = '#'

// Preços dos planos, usados na seção de planos do site e no fim do quiz
export const PLANS = {
  // Sistema no computador e app no celular, sem a IA no WhatsApp
  basico: { mensal: 9.9, pixAnual: 97 },
  // Tudo do Básico mais a IA no WhatsApp, no plano anual em 12x no cartão ou à vista no Pix
  completo: { parcelas: 12, parcela: 19.9, pixAnual: 238.8 },
}

// Dias de teste grátis, contados depois da compra (vale para os dois planos)
export const TRIAL_DAYS = 7

// Links de pagamento do Asaas, um por plano. São públicos e podem ficar aqui.
// A chave da API do Asaas NUNCA entra neste projeto: tudo daqui vai para o navegador
const CHECKOUT_PRODUCAO = {
  // Cartão em até 12x de R$ 19,90 (R$ 238,80 no ano)
  completo: 'https://www.asaas.com/000/c/b5qadslhqcgkk94p',
  // R$ 238,80 à vista no Pix. Falta cadastrar a chave Pix na conta de produção para criar
  completoPix: null,
  // Assinatura de R$ 9,90 por mês, só no cartão
  basicoMensal: 'https://www.asaas.com/000/c/257jf064ccefbrwd',
  // R$ 97 por um ano no Pix. Falta cadastrar a chave Pix na conta de produção para criar
  basicoPixAnual: null,
}

// A tela de pagamento do próprio Dinn (/assinar). Ela precisa do servidor em server/checkout.js:
// no computador ele roda junto com o Vite e usa a chave do sandbox que está no .env.local
const CHECKOUT_PROPRIO = {
  completo: '/assinar/?plano=completo',
  completoPix: '/assinar/?plano=completo&pagamento=pix',
  basicoMensal: '/assinar/?plano=basico',
  basicoPixAnual: '/assinar/?plano=basico-pix',
}

// `npm run dev` e `npm run build:teste` usam a tela própria com o sandbox.
// `npm run build` (produção) continua nos links do Asaas até o servidor ir para o ar
export const TEST_MODE = import.meta.env.MODE !== 'production'
export const CHECKOUT = TEST_MODE ? CHECKOUT_PROPRIO : CHECKOUT_PRODUCAO
