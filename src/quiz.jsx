import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig } from 'motion/react'
import Quiz from './components/Quiz'
import TestBanner from './components/TestBanner'
import './styles.css'
import './quiz.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <Quiz />
      <TestBanner />
    </MotionConfig>
  </StrictMode>,
)
