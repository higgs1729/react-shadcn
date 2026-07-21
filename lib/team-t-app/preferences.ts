export const teamTStorageKeys = {
  preferences: "team-t:v1:preferences",
  profile: "team-t:v1:profile",
  reward: "team-t:v1:reward",
} as const

export const teamTThemes = ["midnight", "dark", "light"] as const

export type TeamTTheme = (typeof teamTThemes)[number]

export const teamTThemeLabels: Record<TeamTTheme, string> = {
  midnight: "ミッドナイトトロフィールーム",
  dark: "ダーク",
  light: "ライト",
}

/** ミッドナイトは配色が固定なので、アクセントは light/dark でだけ効く。 */
export const teamTAccents = [
  {
    id: "violet",
    label: "バイオレット",
    primary: "#4c2378",
    sidebar: "#5a2c8c",
    ring: "#9b6cff",
  },
  {
    id: "indigo",
    label: "インディゴ",
    primary: "oklch(0.457 0.24 277.023)",
    sidebar: "oklch(0.511 0.262 276.966)",
    ring: "oklch(0.511 0.262 276.966)",
  },
  {
    id: "cyan",
    label: "シアン",
    primary: "oklch(0.5 0.15 220)",
    sidebar: "oklch(0.56 0.16 220)",
    ring: "oklch(0.56 0.16 220)",
  },
  {
    id: "emerald",
    label: "エメラルド",
    primary: "oklch(0.49 0.14 155)",
    sidebar: "oklch(0.55 0.15 155)",
    ring: "oklch(0.55 0.15 155)",
  },
  {
    id: "amber",
    label: "アンバー",
    primary: "oklch(0.58 0.15 80)",
    sidebar: "oklch(0.63 0.16 80)",
    ring: "oklch(0.63 0.16 80)",
  },
] as const

export type TeamTAccentId = (typeof teamTAccents)[number]["id"]

export interface TeamTPreferences {
  theme: TeamTTheme
  accent: TeamTAccentId
  emphasizeBorders: boolean
  reduceMotion: boolean
}

export interface TeamTProfile {
  displayName: string
}

export const defaultTeamTPreferences: TeamTPreferences = {
  theme: "midnight",
  accent: "violet",
  emphasizeBorders: false,
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

function isTeamTTheme(value: unknown): value is TeamTTheme {
  return teamTThemes.some((theme) => theme === value)
}

function isTeamTAccentId(value: unknown): value is TeamTAccentId {
  return teamTAccents.some((accent) => accent.id === value)
}

export function getTeamTAccent(id: TeamTAccentId) {
  return teamTAccents.find((accent) => accent.id === id) ?? teamTAccents[0]
}

export function readTeamTPreferences(storage: StorageLike): TeamTPreferences {
  const value = readJSON(storage, teamTStorageKeys.preferences)
  if (!value || typeof value !== "object") return defaultTeamTPreferences

  // 外観設定を足す前に保存された記録には theme/accent が無いので、既定へ落とす。
  const candidate = value as Partial<TeamTPreferences>
  return {
    theme: isTeamTTheme(candidate.theme)
      ? candidate.theme
      : defaultTeamTPreferences.theme,
    accent: isTeamTAccentId(candidate.accent)
      ? candidate.accent
      : defaultTeamTPreferences.accent,
    emphasizeBorders:
      typeof candidate.emphasizeBorders === "boolean"
        ? candidate.emphasizeBorders
        : defaultTeamTPreferences.emphasizeBorders,
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
