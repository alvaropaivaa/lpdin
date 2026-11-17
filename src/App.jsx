import { MotionConfig } from 'motion/react'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Highlights from './components/Highlights'
import DayTimeline from './components/DayTimeline'
import Assistant from './components/Assistant'
import { FeatureGrid, MoneySection } from './components/Features'
import Desktop from './components/Desktop'
import Capabilities from './components/Capabilities'
import Ask from './components/Ask'
import Alerts from './components/Alerts'
import Included from './components/Included'
import Faq from './components/Faq'
import Footer from './components/Footer'
import TestBanner from './components/TestBanner'

// Mesma sequência da página de referência, com o conteúdo do Dinn
export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Nav />
      <main>
        <Hero />
        <Highlights />
        <DayTimeline />
        <Assistant />
        <MoneySection />
        <Desktop />
        <Capabilities />
        <Ask />
        <FeatureGrid />
        <Alerts />
        <Included />
        <Faq />
      </main>
      <Footer />
      <TestBanner />
    </MotionConfig>
  )
}
