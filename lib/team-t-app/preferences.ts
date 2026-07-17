export const teamTStorageKeys = {
  preferences: "team-t:v1:preferences",
  profile: "team-t:v1:profile",
  reward: "team-t:v1:reward",
} as const

export interface TeamTPreferences {
  reduceMotion: boolean
}

export interface TeamTProfile {
  displayName: string
}

export const defaultTeamTPreferences: TeamTPreferences = {
  reduceMotion: false,
}

export const defaultTeamTProfile: TeamTProfile = {
  displayName: "",
}

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">

function readJSON(storage: StorageLike, key: string): unknown {
  try {
    const raw = storage.getItem(key)
    return raw ? JSON.parse(raw) : undefined
  } catch {
    return undefined
  }
}

export function readTeamTPreferences(storage: StorageLike): TeamTPreferences {
  const value = readJSON(storage, teamTStorageKeys.preferences)
  if (!value || typeof value !== "object") return defaultTeamTPreferences

  const candidate = value as Partial<TeamTPreferences>
  return {
    reduceMotion:
      typeof candidate.reduceMotion === "boolean"
        ? candidate.reduceMotion
        : defaultTeamTPreferences.reduceMotion,
  }
}

export function readTeamTProfile(storage: StorageLike): TeamTProfile {
  const value = readJSON(storage, teamTStorageKeys.profile)
  if (!value || typeof value !== "object") return defaultTeamTProfile

  const candidate = value as Partial<TeamTProfile>
  return {
    displayName:
      typeof candidate.displayName === "string"
        ? candidate.displayName.slice(0, 40)
        : defaultTeamTProfile.displayName,
  }
}

export function writeTeamTPreferences(
  storage: StorageLike,
  preferences: TeamTPreferences
) {
  try {
    storage.setItem(teamTStorageKeys.preferences, JSON.stringify(preferences))
  } catch {
    // ローカル保存が使えない環境でも、メモリ上の設定は利用できる。
  }
}

export function writeTeamTProfile(storage: StorageLike, profile: TeamTProfile) {
  try {
    storage.setItem(teamTStorageKeys.profile, JSON.stringify(profile))
  } catch {
    // ローカル保存が使えない環境でも、メモリ上の設定は利用できる。
  }
}

export function resetTeamTPreferences(storage: StorageLike) {
  try {
    storage.removeItem(teamTStorageKeys.preferences)
    storage.removeItem(teamTStorageKeys.profile)
    storage.removeItem(teamTStorageKeys.reward)
  } catch {
    // 保存不可の環境では削除も不要。呼び出し側が表示状態を既定値へ戻す。
  }
}
