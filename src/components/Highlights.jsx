import { BellRing, DatabaseBackup, LockKeyhole, MessageCircle, Monitor, Smartphone, SunMoon } from 'lucide-react'
import { IconDot } from './ui'

const ITEMS = [
  { icon: MessageCircle, title: 'Assistente no WhatsApp', text: 'Lança por mensagem' },
  { icon: Monitor, title: 'Sistema no computador', text: 'Direto no navegador' },
  { icon: Smartphone, title: 'App no celular', text: 'Sem passar pela loja' },
  { icon: BellRing, title: 'Avisos de vencimento', text: 'Notificação no celular' },
  { icon: LockKeyhole, title: 'Bloqueio por PIN', text: 'Só você abre' },
  { icon: SunMoon, title: 'Tema claro e escuro', text: 'Do jeito que preferir' },
  { icon: DatabaseBackup, title: 'Backup dos dados', text: 'Guarde uma cópia' },
]

function Group({ hidden }) {
  return (
    <ul className="marquee-group" aria-hidden={hidden || undefined}>
      {ITEMS.map(({ icon, title, text }) => (
        <li className="highlight" key={title}>
          <IconDot icon={icon} />
          <div>
            <strong>{title}</strong>
            <span>{text}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default function Highlights() {
  return (
    <section className="highlights" aria-label="Destaques do Dinn" data-tone="dark">
      <div className="marquee">
        <Group />
        <Group hidden />
      </div>
    </section>
  )
}
