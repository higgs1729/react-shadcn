import { StudioPortfolioNavigation } from "./flow-navigation"

export default function StudioPortfolioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pb-28 sm:pb-16">
      {children}
      <StudioPortfolioNavigation />
    </div>
  )
}
