import Logo from './Logo'
import { APP_URL } from '../config'

const COLUMNS = [
  {
    title: 'Produto',
    links: [
      ['Como funciona', '#como-funciona'],
      ['O que pedir', '#assistente'],
      ['Funcionalidades', '#funcionalidades'],
      ['No computador', '#computador'],
      ['Avisos', '#avisos'],
      ['Planos', '#planos'],
    ],
  },
  {
    title: 'Ajuda',
    links: [
      ['Perguntas frequentes', '#perguntas'],
      ['Começar agora', APP_URL],
    ],
  },
]

export default function Footer() {
  return (
    <footer className="footer" data-tone="dark">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Logo tone="light" />
          <p>
            Assistente financeiro no WhatsApp, com sistema no computador e app no celular. Veja
            quanto entra, quanto sai, quanto você deve e quanto falta para as suas metas.
          </p>
        </div>
        {COLUMNS.map(({ title, links }) => (
          <nav key={title} aria-label={title}>
            <h4>{title}</h4>
            <ul>
              {links.map(([label, href]) => (
                <li key={label}>
                  <a href={href}>{label}</a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Dinn. Seu dinheiro rende mais.</span>
        <span>Cada real no lugar, cada conta em dia.</span>
      </div>
    </footer>
  )
}
