import { DiscoverSections } from "./components/DiscoverSections"
import { HubHeader } from "./components/HubHeader"

export default function DiscoverPage() {
  return (
    <main className="hub-page">
      <HubHeader active="discover" />

      <div className="hub-content hub-discover-content">
        <DiscoverSections />
      </div>
    </main>
  )
}
