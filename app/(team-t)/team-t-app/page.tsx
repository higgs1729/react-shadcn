import { TeamTAppShell } from "@/components/team-t-app/team-t-app-shell"
import { apiCatalog } from "@/lib/team-t-app/catalog"

export default function TeamTAppPage() {
  return <TeamTAppShell catalog={apiCatalog} />
}
