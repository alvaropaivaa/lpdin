import icon from '../assets/dinn-icone.webp'

// Símbolo do Dinn: o D com a seta, no quadrado verde aceso
export function LogoMark({ size = 24 }) {
  return <img className="logo-mark" src={icon} alt="" width={size} height={size} />
}

export default function Logo({ tone = 'dark' }) {
  return (
    <span className={`logo logo--${tone}`}>
      <LogoMark size={28} />
      Dinn
    </span>
  )
}
