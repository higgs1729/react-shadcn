import {
  CollectionTableScreen,
  type CollectionState,
} from "@/app/collection-01/collection-screen"

const STATES: readonly CollectionState[] = ["default", "loading", "empty", "error"]

function resolveState(raw: string | string[] | undefined): CollectionState {
  return STATES.includes(raw as CollectionState) ? (raw as CollectionState) : "default"
}

// The invoice-list step's stateCoveragePlan (default/loading/empty/error) is
// reachable through the route via `?state=`; an absent or unrecognized value
// falls back to "default". CollectionTableScreen implements all four states.
export default async function InvoiceListPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string | string[] }>
}) {
  const { state } = await searchParams
  return <CollectionTableScreen state={resolveState(state)} />
}
