import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig } from 'motion/react'
import Checkout from './components/Checkout'
import TestBanner from './components/TestBanner'
import './styles.css'
import './checkout.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <Checkout />
      <TestBanner />
    </MotionConfig>
  </StrictMode>,
)
