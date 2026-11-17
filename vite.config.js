import { resolve } from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { handleCheckout } from './server/checkout.js'

// /quiz e /assinar sem a barra no fim também abrem a página, no servidor local e no preview
const PAGES = ['/quiz', '/assinar']

function pageRoutes() {
  const rewrite = (req, _res, next) => {
    for (const page of PAGES) {
      if (req.url === page || req.url.startsWith(`${page}?`)) req.url = req.url.replace(page, `${page}/`)
    }
    next()
  }
  return {
    name: 'page-routes',
    configureServer(server) {
      server.middlewares.use(rewrite)
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewrite)
    },
  }
}

// O servidor do pagamento (server/checkout.js) rodando dentro do Vite, para testar no computador.
// A chave vem do arquivo .env.local (ASAAS_API_KEY e ASAAS_ENV), que nunca vai para o navegador:
// o Vite só entrega ao navegador variáveis que começam com VITE_
function checkoutApi(env) {
  const handler = async (req, res, next) => {
    if (req.url !== '/api/checkout') return next()
    res.setHeader('Content-Type', 'application/json')
    if (req.method !== 'POST') {
      res.statusCode = 405
      return res.end(JSON.stringify({ ok: false, error: 'Use POST.' }))
    }
    let raw = ''
    for await (const chunk of req) {
      raw += chunk
      if (raw.length > 20_000) {
        res.statusCode = 413
        return res.end(JSON.stringify({ ok: false, error: 'Pedido grande demais.' }))
      }
    }
    let body
    try {
      body = JSON.parse(raw)
    } catch {
      res.statusCode = 400
      return res.end(JSON.stringify({ ok: false, error: 'Pedido inválido.' }))
    }
    const forwarded = String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim()
    const remoteIp = (forwarded || req.socket.remoteAddress || '').replace(/^::ffff:/, '').replace(/^::1$/, '127.0.0.1')
    const result = await handleCheckout(body, {
      apiKey: env.ASAAS_API_KEY,
      env: env.ASAAS_ENV,
      remoteIp,
    })
    res.statusCode = result.ok ? 200 : 400
    res.end(JSON.stringify(result))
  }
  return {
    name: 'checkout-api',
    configureServer(server) {
      server.middlewares.use(handler)
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler)
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, import.meta.dirname, 'ASAAS_')
  return {
    plugins: [react(), pageRoutes(), checkoutApi(env)],
    build: {
      rollupOptions: {
        // A página principal, o quiz em /quiz e o pagamento em /assinar
        input: {
          main: resolve(import.meta.dirname, 'index.html'),
          quiz: resolve(import.meta.dirname, 'quiz/index.html'),
          assinar: resolve(import.meta.dirname, 'assinar/index.html'),
        },
      },
    },
  }
})
