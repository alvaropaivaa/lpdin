import { ArrowRight, Check, X } from 'lucide-react'
import { motion } from 'motion/react'
import { Reveal } from './motion'
import { WhatsAppIcon } from './ui'
import { CHECKOUT, PLANS, TRIAL_DAYS } from '../config'
import { price, priceNumber } from '../format'
import mascotWaving from '../assets/mascote-acenando.webp'

const BASIC = [
  { text: 'Sistema completo no computador' },
  { text: 'App no celular, sem passar pela loja' },
  { text: 'Contas, cartões, orçamento, metas e dívidas' },
  { text: 'Relatórios e avisos de vencimento' },
  { text: 'IA no WhatsApp que lança por você', off: true },
]

const FULL = [
  { text: 'IA no WhatsApp que lança, corrige e desfaz', whatsapp: true },
  { text: 'Lance por mensagem, áudio ou foto do comprovante' },
  { text: 'Tudo do Básico: sistema, app, metas, dívidas e relatórios' },
  { text: 'Avisos de vencimento no celular' },
  { text: 'PIN, tema claro e escuro e backup' },
]

function Features({ items }) {
  return (
    <ul className="plan-list">
      {items.map(({ text, off, whatsapp }) => (
        <li key={text} className={off ? 'is-off' : undefined}>
          <span className={`plan-check${whatsapp ? ' plan-check--wa' : ''}`}>
            {off ? (
              <X size={12} strokeWidth={2.5} />
            ) : whatsapp ? (
              <WhatsAppIcon size={12} />
            ) : (
              <Check size={12} strokeWidth={2.5} />
            )}
          </span>
          {text}
        </li>
      ))}
    </ul>
  )
}

// Preço grande com o "R$" menor ao lado
function Price({ before, value }) {
  return (
    <div className="plan-price">
      {before && <span className="plan-price-small">{before}</span>}
      <span className="plan-price-cur">R$</span>
      <span className="num">{priceNumber(value)}</span>
      <span className="plan-price-per">/mês</span>
    </div>
  )
}

export default function Included() {
  const { basico, completo } = PLANS

  return (
    <section className="section section--light" id="planos" data-tone="light">
      <div className="container">
        <Reveal className="section-head">
          <h2 className="title">Escolha como usar o Dinn.</h2>
          <p className="lead">
            Os dois planos têm {TRIAL_DAYS} dias de teste grátis, contados depois da compra.
          </p>
        </Reveal>

        <div className="plans">
          <Reveal className="plan plan--basic" delay={0.05}>
            <div className="plan-card">
              <strong className="plan-name">Básico</strong>
              <span className="plan-desc">Sistema no computador e app no celular, sem a IA.</span>
              <Price value={basico.mensal} />
              <span className="plan-alt">
                ou{' '}
                {CHECKOUT.basicoPixAnual ? (
                  <a href={CHECKOUT.basicoPixAnual}>
                    <b>{price(basico.pixAnual)} no Pix</b>
                  </a>
                ) : (
                  <b>{price(basico.pixAnual)} no Pix</b>
                )}{' '}
                pelo ano
              </span>
              <Features items={BASIC} />
              <a className="btn btn--outline btn--block" href={CHECKOUT.basicoMensal}>
                Assinar o Básico
              </a>
              <p className="plan-note">{TRIAL_DAYS} dias de teste grátis depois da compra.</p>
            </div>
          </Reveal>

          <Reveal className="plan plan--full" delay={0.12}>
            <motion.img
              className="plan-mascot"
              src={mascotWaving}
              alt="Mascote do Dinn acenando"
              width="900"
              height="602"
              loading="lazy"
              initial={{ y: '100%' }}
              whileInView={{ y: 0 }}
              viewport={{ once: true, margin: '0px 0px -20% 0px' }}
              transition={{ type: 'spring', stiffness: 70, damping: 13, delay: 0.3 }}
            />
            <div className="plan-card plan-card--featured">
              <span className="plan-badge">
                <WhatsAppIcon size={13} />
                Com IA no WhatsApp
              </span>
              <strong className="plan-name">Completo</strong>
              <span className="plan-desc">
                A IA lança por você no WhatsApp, e tudo fica no sistema e no app.
              </span>
              <Price before={`${completo.parcelas}x de`} value={completo.parcela} />
              <span className="plan-alt">
                no plano anual
                {CHECKOUT.completoPix && (
                  <>
                    {' '}
                    ou{' '}
                    <a href={CHECKOUT.completoPix}>
                      <b>{price(completo.pixAnual)} no Pix</b>
                    </a>
                  </>
                )}
              </span>
              <Features items={FULL} />
              <a className="btn btn--primary btn--block btn--shine" href={CHECKOUT.completo}>
                Assinar o Completo
                <ArrowRight size={18} strokeWidth={1.75} />
              </a>
              <p className="plan-note">{TRIAL_DAYS} dias de teste grátis depois da compra.</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
