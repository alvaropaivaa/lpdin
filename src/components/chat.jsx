import { Camera, CheckCheck, ChevronLeft, Mic, Phone as PhoneIcon, Plus, Video } from 'lucide-react'
import { LogoMark } from './Logo'
import { money } from '../format'

// Resposta do assistente escrita como mensagem comum, com o negrito do WhatsApp
export function Receipt({ kind, entry, before }) {
  const valor = <b>{money(entry.valor)}</b>
  if (kind === 'fixed') {
    return (
      <span>
        Corrigido. {entry.categoria} agora é {valor} (era {money(before)}).
      </span>
    )
  }
  if (kind === 'undone') {
    return (
      <span>
        Desfeito. Tirei <b>{entry.categoria}</b> ({money(entry.valor)}) do mês.
      </span>
    )
  }
  return (
    <span>
      {entry.tipo === 'receita' ? 'Receita anotada' : 'Anotado'}: {valor} em{' '}
      <b>{entry.categoria}</b>.
    </span>
  )
}

export function MessageBody({ message }) {
  if (message.from === 'me' || !message.kind) return message.text
  return <Receipt {...message} />
}

export function Typing() {
  return (
    <span className="typing" aria-label="digitando">
      <span />
      <span />
      <span />
    </span>
  )
}

/* ---------- Peças de uma conversa no WhatsApp ---------- */

export function WaHeader({ status = 'online' }) {
  return (
    <div className="wa-head">
      <span className="wa-back">
        <ChevronLeft size={22} strokeWidth={2} />
        12
      </span>
      <span className="wa-avatar">
        <LogoMark size={18} />
      </span>
      <div className="wa-who">
        <strong>Dinn</strong>
        <span>{status}</span>
      </div>
      <span className="wa-actions">
        <Video size={20} strokeWidth={1.75} />
        <PhoneIcon size={17} strokeWidth={1.75} />
      </span>
    </div>
  )
}

export function WaBubble({ from, time = '10:15', children, className = '' }) {
  return (
    <div className={`wa-msg wa-msg--${from} ${className}`}>
      {children}
      <span className="wa-meta">
        {time}
        {from === 'me' && <CheckCheck size={14} strokeWidth={2} />}
      </span>
    </div>
  )
}

export function WaInput() {
  return (
    <div className="wa-input" aria-hidden="true">
      <Plus size={22} strokeWidth={1.75} />
      <span className="wa-field">Mensagem</span>
      <Camera size={20} strokeWidth={1.75} />
      <span className="wa-mic">
        <Mic size={16} strokeWidth={2} />
      </span>
    </div>
  )
}
