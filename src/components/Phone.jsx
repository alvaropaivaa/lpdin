import { BatteryFull, Signal, Wifi } from 'lucide-react'

export default function Phone({ children, className = '', screen = '' }) {
  return (
    <div className={`phone ${className}`}>
      <div className={`phone-screen ${screen}`}>
        <div className="phone-status" aria-hidden="true">
          <span>10:15</span>
          <span className="phone-island" />
          <span className="phone-icons">
            <Signal size={14} strokeWidth={2.25} />
            <Wifi size={14} strokeWidth={2.25} />
            <BatteryFull size={18} strokeWidth={1.75} />
          </span>
        </div>
        {children}
      </div>
    </div>
  )
}
