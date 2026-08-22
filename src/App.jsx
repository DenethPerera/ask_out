import { useCallback, useState } from 'react'
import FloatingHearts from './components/FloatingHearts'
import IntroScreen from './components/IntroScreen'
import ProposalCard from './components/ProposalCard'
import SuccessScreen from './components/SuccessScreen'
import { notifyAnswer } from './lib/webhook'

const STAGE = { INTRO: 'intro', ASK: 'ask', SUCCESS: 'success', NO: 'no' }

export default function App() {
  const [stage, setStage] = useState(STAGE.INTRO)

  // dodgeCount is passed up from ProposalCard when she clicks Yes
  const handleYes = useCallback((dodgeCount = 0) => {
    setStage(STAGE.SUCCESS)
    notifyAnswer('yes', dodgeCount) // fire-and-forget — saves to MongoDB + sends email
  }, [])

  // After 10 dodges the No button becomes real — notify and show a gentle screen
  const handleNo = useCallback((dodgeCount = 0) => {
    setStage(STAGE.NO)
    notifyAnswer('no', dodgeCount)
  }, [])

  return (
    <div className="relative min-h-svh w-full overflow-hidden bg-linear-to-b from-rose-100 via-pink-50 to-orange-50">
      <FloatingHearts />
      {stage === STAGE.INTRO && <IntroScreen onContinue={() => setStage(STAGE.ASK)} />}
      {stage === STAGE.ASK && <ProposalCard onYes={handleYes} onNo={handleNo} />}
      {stage === STAGE.SUCCESS && <SuccessScreen />}
      {stage === STAGE.NO && (
        <div className="flex min-h-svh w-full flex-col items-center justify-center gap-6 px-6 text-center">
          <p className="text-6xl">💔</p>
          <h1 className="font-script text-4xl font-bold text-gray-500 sm:text-5xl">That's okay...</h1>
          <p className="text-base text-gray-400">Thanks for being honest. Maybe one day 🌸</p>
        </div>
      )}
    </div>
  )
}

