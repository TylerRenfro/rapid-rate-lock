import { useEffect } from "react"
import { AppNavbar } from "@/components/app-navbar"
import { ProfilePanel } from "@/components/profile-panel"
import { ResultsArea } from "@/components/results-area"
import { readSpeed } from "@/lib/clock"
import { syncAcrossTabs } from "@/lib/store"

export default function App() {
  useEffect(() => syncAcrossTabs(), [])

  useEffect(() => {
    const speed = readSpeed()
    if (speed > 1) console.info(`[rapid-rate-lock] ?speed=${speed}: new quote windows run ${speed}× faster.`)
  }, [])

  return (
    <div className="flex min-h-dvh flex-col lg:h-dvh">
      <AppNavbar />
      <main className="flex flex-1 flex-col lg:min-h-0 lg:flex-row">
        <h1 className="sr-only">Quick Quote</h1>
        <ProfilePanel />
        <ResultsArea />
      </main>
    </div>
  )
}
