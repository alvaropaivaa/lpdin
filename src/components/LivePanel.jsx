import { Monitor } from 'lucide-react'
import { money, signed } from '../format'

// Painel do sistema que acompanha, na hora, o que foi mandado no WhatsApp
export default function LivePanel({ entrou, saiu, last, className = '', ...props }) {
  return (
    <div className={`live ${className}`} {...props}>
      <div className="live-head">
        <Monitor size={14} strokeWidth={1.75} />
        Sistema Dinn
        <span className="live-badge">
          <span className="live-dot" />
          sincronizado
        </span>
      </div>
      <span className="live-month">Outubro</span>
      <dl className="live-rows">
        <div>
          <dt>Entrou</dt>
          <dd key={entrou} className="num pos tick">
            {money(entrou)}
          </dd>
        </div>
        <div>
          <dt>Saiu</dt>
          <dd key={saiu} className="num neg tick">
            {money(saiu)}
          </dd>
        </div>
        <div className="live-total">
          <dt>Saldo</dt>
          <dd key={entrou - saiu} className="num tick">
            {money(entrou - saiu)}
          </dd>
        </div>
      </dl>
      {last && (
        <div className="live-last" key={`${last.categoria}-${last.valor}`}>
          <span>Último lançamento · via WhatsApp</span>
          <strong>
            {last.categoria}
            <span className={`num ${last.tipo === 'receita' ? 'pos' : 'neg'}`}>
              {signed(last.tipo, last.valor)}
            </span>
          </strong>
        </div>
      )}
    </div>
  )
}
