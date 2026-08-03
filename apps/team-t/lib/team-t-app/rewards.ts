export const teamTRewardStorageKey = "team-t:v1:reward"

export const interactionsPerCoin = 5

export interface TeamTRewardState {
  coins: number
  progress: number
}

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">

export const defaultTeamTRewardState: TeamTRewardState = {
  coins: 0,
  progress: 0,
}

function isSafeNonNegativeInteger(
  value: unknown,
  maximum: number
): value is number {
  return (
    Number.isInteger(value) &&
    typeof value === "number" &&
    value >= 0 &&
    value <= maximum
  )
}

export function readTeamTReward(storage: StorageLike): TeamTRewardState {
  try {
    const raw = storage.getItem(teamTRewardStorageKey)
    if (!raw) return defaultTeamTRewardState

    const value: unknown = JSON.parse(raw)
    if (!value || typeof value !== "object") return defaultTeamTRewardState

    const candidate = value as Partial<TeamTRewardState>
    return {
      coins: isSafeNonNegativeInteger(candidate.coins, 9999)
        ? candidate.coins
        : defaultTeamTRewardState.coins,
      progress: isSafeNonNegativeInteger(
        candidate.progress,
        interactionsPerCoin - 1
      )
        ? candidate.progress
        : defaultTeamTRewardState.progress,
    }
  } catch {
    return defaultTeamTRewardState
  }
}

export function writeTeamTReward(
  storage: StorageLike,
  reward: TeamTRewardState
) {
  try {
    storage.setItem(teamTRewardStorageKey, JSON.stringify(reward))
  } catch {
    // Keep the current session state when storage is unavailable.
  }
}

export function resetTeamTReward(storage: StorageLike) {
  try {
    storage.removeItem(teamTRewardStorageKey)
  } catch {
    // Keep the current session state when storage is unavailable.
  }
}

export function recordPreviewInteraction(reward: TeamTRewardState) {
  const nextProgress = reward.progress + 1
  const earnedCoin = nextProgress >= interactionsPerCoin

  return {
    earnedCoin,
    reward: {
      coins: earnedCoin ? reward.coins + 1 : reward.coins,
      progress: earnedCoin ? 0 : nextProgress,
    } satisfies TeamTRewardState,
  }
}

export function spendTeamTCoins(reward: TeamTRewardState, amount: number) {
  if (!Number.isInteger(amount) || amount < 1 || reward.coins < amount) {
    return undefined
  }

  return { ...reward, coins: reward.coins - amount }
}

export function addTeamTCoins(reward: TeamTRewardState, amount: number) {
  if (!Number.isInteger(amount) || amount < 0) return reward

  return { ...reward, coins: Math.min(9999, reward.coins + amount) }
}
