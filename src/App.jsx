import { useCallback, useState } from 'react'
import FloatingHearts from './components/FloatingHearts'
import IntroScreen from './components/IntroScreen'
import ProposalCard from './components/ProposalCard'
import SuccessScreen from './components/SuccessScreen'
import { notifyAnswer } from './lib/webhook'

const STAGE = { INTRO: 'intro', ASK: 'ask', SUCCESS: 'success' }

export default function App() {
  const [stage, setStage] = useState(STAGE.INTRO)

  // dodgeCount is passed up from ProposalCard when she clicks Yes
  const handleYes = useCallback((dodgeCount = 0) => {
    setStage(STAGE.SUCCESS)
    notifyAnswer('yes', dodgeCount) // fire-and-forget — saves to MongoDB + sends email
  }, [])

  return (
    <div className="relative min-h-svh w-full overflow-hidden bg-linear-to-b from-rose-100 via-pink-50 to-orange-50">
      <FloatingHearts />
      {stage === STAGE.INTRO && <IntroScreen onContinue={() => setStage(STAGE.ASK)} />}
      {stage === STAGE.ASK && <ProposalCard onYes={handleYes} />}
      {stage === STAGE.SUCCESS && <SuccessScreen />}
    </div>
  )
}
