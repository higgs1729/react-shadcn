"use client"

import {
  useEffect,
  useState,
  type ComponentProps,
  type CSSProperties,
} from "react"
import { useTheme } from "next-themes"
import { AccessibilityIcon, PaletteIcon } from "lucide-react"

import {
  SettingsSection,
  type SettingsSectionRow,
} from "@/components/blocks/settings-section-01"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"

type ThemeChoice = "system" | "dark" | "light"
type SettingsSectionId = "appearance" | "behavior"

const accents = [
  {
    id: "indigo",
    label: "インディゴ",
    primary: "oklch(0.457 0.24 277.023)",
    sidebar: "oklch(0.511 0.262 276.966)",
  },
  {
    id: "violet",
    label: "バイオレット",
    primary: "oklch(0.49 0.23 303)",
    sidebar: "oklch(0.55 0.24 303)",
  },
  {
    id: "cyan",
    label: "シアン",
    primary: "oklch(0.5 0.15 220)",
    sidebar: "oklch(0.56 0.16 220)",
  },
  {
    id: "emerald",
    label: "エメラルド",
    primary: "oklch(0.49 0.14 155)",
    sidebar: "oklch(0.55 0.15 155)",
  },
  {
    id: "amber",
    label: "アンバー",
    primary: "oklch(0.58 0.15 80)",
    sidebar: "oklch(0.63 0.16 80)",
  },
] as const

type AccentId = (typeof accents)[number]["id"]

const defaultPreferences: SettingsSectionRow[] = [
  {
    id: "reduce-motion",
    label: "動きを減らす",
    description: "画面遷移やコンポーネントのアニメーションを抑えます。",
    checked: false,
  },
  {
    id: "pointer-cursor",
    label: "ポインターカーソルを表示",
    description:
      "クリックできるボタンや操作要素で、手の形のカーソルを表示します。",
    checked: true,
  },
]

function applyAccent(accentId: AccentId) {
  const accent = accents.find((item) => item.id === accentId) ?? accents[0]
  const root = document.documentElement
  root.dataset.accent = accent.id
  root.style.setProperty("--primary", accent.primary)
  root.style.setProperty("--sidebar-primary", accent.sidebar)
  root.style.setProperty("--ring", accent.sidebar)
  root.style.setProperty("--sidebar-ring", accent.sidebar)
}

function mergePreferences(saved: SettingsSectionRow[]) {
  return defaultPreferences.map((defaultPreference) => {
    const storedPreference = saved.find(
      (preference) => preference.id === defaultPreference.id
    )
    return storedPreference
      ? { ...defaultPreference, checked: storedPreference.checked }
      : defaultPreference
  })
}

const themeLabels: Record<ThemeChoice, string> = {
  system: "システム",
  light: "ライト",
  dark: "ダーク",
}

function ThemePreview({
  choice,
  selected,
  onSelect,
}: {
  choice: ThemeChoice
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`rounded-lg border p-2 text-left outline-hidden transition-colors focus-visible:ring-2 focus-visible:ring-ring ${selected ? "border-primary bg-primary/5 ring-2 ring-primary/30" : "border-border hover:bg-muted/60"}`}
    >
      <span
        className={`relative block h-20 overflow-hidden rounded-md border ${choice === "dark" ? "bg-zinc-800" : choice === "system" ? "from-1/2 to-1/2 bg-linear-to-r from-zinc-100 to-zinc-700" : "bg-zinc-100"}`}
      >
        <span
          className={`absolute top-3 left-1/2 h-1 w-14 -translate-x-1/2 rounded-full ${choice === "dark" ? "bg-zinc-500" : "bg-zinc-400"}`}
        />
        <span
          className={`absolute inset-x-3 top-7 h-10 rounded-t-md ${choice === "dark" ? "bg-zinc-100" : "bg-white"}`}
        />
        <span className="absolute top-9 left-5 h-1 w-9 rounded-full bg-muted-foreground/35" />
        <span className="absolute top-12 left-5 h-1 w-14 rounded-full bg-muted-foreground/25" />
      </span>
      <span className="mt-2 block text-center text-sm font-medium">
        {themeLabels[choice]}
      </span>
    </button>
  )
}

function AccentPreview({ accent }: { accent: (typeof accents)[number] }) {
  return (
    <div
      className="mt-5 overflow-hidden rounded-lg border bg-background"
      style={{ "--preview-accent": accent.primary } as CSSProperties}
    >
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <span className="size-2 rounded-full bg-[var(--preview-accent)]" />
        <span className="h-2 w-20 rounded-full bg-muted" />
        <span className="ml-auto h-2 w-8 rounded-full bg-muted" />
      </div>
      <div className="grid grid-cols-[5rem_1fr]">
        <div className="space-y-2 border-r bg-muted/40 p-3">
          <span className="block h-2 rounded-full bg-muted-foreground/25" />
          <span className="block h-2 rounded-full bg-[var(--preview-accent)]" />
          <span className="block h-2 rounded-full bg-muted-foreground/25" />
        </div>
        <div className="space-y-3 p-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="block h-2 w-24 rounded-full bg-foreground/70" />
              <span className="block h-1.5 w-36 rounded-full bg-muted-foreground/25" />
            </div>
            <span className="h-5 w-14 rounded-md bg-[var(--preview-accent)]" />
          </div>
          <div className="h-7 rounded-md border border-[var(--preview-accent)] bg-[color-mix(in_oklab,var(--preview-accent)_10%,transparent)]" />
        </div>
      </div>
      <p className="border-t px-3 py-2 text-xs text-muted-foreground">
        選択中のメニュー、主要ボタン、入力フォーカスに反映されます。
      </p>
    </div>
  )
}

export function SettingsPage({
  embedded = false,
  section,
}: {
  embedded?: boolean
  section?: SettingsSectionId
}) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [accent, setAccent] = useState<AccentId>("indigo")
  const [emphasizeBorders, setEmphasizeBorders] = useState(false)
  const [preferences, setPreferences] = useState(defaultPreferences)
  const pointerCursor =
    preferences.find((preference) => preference.id === "pointer-cursor")
      ?.checked ?? true

  useEffect(() => {
    const storedAccent = window.localStorage.getItem(
      "studio-accent"
    ) as AccentId | null
    const storedPreferences = window.localStorage.getItem("studio-preferences")
    const nextAccent = accents.some((item) => item.id === storedAccent)
      ? storedAccent!
      : "indigo"
    setAccent(nextAccent)
    applyAccent(nextAccent)
    const storedEmphasizeBorders =
      window.localStorage.getItem("studio-emphasize-borders") === "true"
    setEmphasizeBorders(storedEmphasizeBorders)
    document.documentElement.dataset.emphasizeBorders = String(
      storedEmphasizeBorders
    )
    if (storedPreferences) {
      try {
        setPreferences(
          mergePreferences(
            JSON.parse(storedPreferences) as SettingsSectionRow[]
          )
        )
      } catch {
        window.localStorage.removeItem("studio-preferences")
      }
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    applyAccent(accent)
    window.localStorage.setItem("studio-accent", accent)
  }, [accent, mounted])

  useEffect(() => {
    if (!mounted) return
    document.documentElement.dataset.emphasizeBorders = String(emphasizeBorders)
    window.localStorage.setItem(
      "studio-emphasize-borders",
      String(emphasizeBorders)
    )
  }, [emphasizeBorders, mounted])

  useEffect(() => {
    if (!mounted) return
    const reduceMotion =
      preferences.find((preference) => preference.id === "reduce-motion")
        ?.checked ?? false
    document.documentElement.dataset.reduceMotion = String(reduceMotion)
    document.documentElement.dataset.pointerCursor = String(pointerCursor)
    window.localStorage.setItem(
      "studio-preferences",
      JSON.stringify(preferences)
    )
  }, [mounted, pointerCursor, preferences])

  const activeAccent = accents.find((item) => item.id === accent) ?? accents[0]

  return (
    <div
      className={
        embedded
          ? "flex flex-col gap-6 p-6"
          : "flex flex-1 flex-col gap-6 p-4 md:p-6"
      }
    >
      <div className={embedded ? "hidden" : undefined}>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <Badge variant="outline">Local preferences</Badge>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          表示と操作の好みを、このブラウザ内で管理します。
        </p>
      </div>

      {section !== "behavior" ? (
        <section>
          <div className="mb-5">
            <h1 className="text-2xl font-semibold tracking-tight">外観</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              アプリ全体の明るさと、操作を示す色を調整します。
            </p>
          </div>
          <div id="appearance" className="space-y-8">
            <section aria-labelledby="theme-label">
              <h2 id="theme-label" className="text-base font-semibold">
                テーマ
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                端末の設定に合わせるか、明るさを固定します。
              </p>
              <div
                className="mt-4 grid max-w-2xl grid-cols-3 gap-3"
                role="group"
                aria-label="テーマ"
              >
                {(["system", "light", "dark"] as ThemeChoice[]).map(
                  (choice) => (
                    <ThemePreview
                      key={choice}
                      choice={choice}
                      selected={theme === choice}
                      onSelect={() => setTheme(choice)}
                    />
                  )
                )}
              </div>
            </section>
            <section aria-labelledby="accent-label" className="border-t pt-8">
              <h2 id="accent-label" className="text-base font-semibold">
                アクセント
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                選択状態、主要なアクション、フォーカス表示に使う色です。
              </p>
              <div
                className="mt-4 flex flex-wrap gap-2"
                role="group"
                aria-label="アクセント"
              >
                {accents.map((item) => (
                  <Button
                    key={item.id}
                    type="button"
                    variant={accent === item.id ? "default" : "outline"}
                    aria-pressed={accent === item.id}
                    onClick={() => setAccent(item.id)}
                  >
                    <span
                      className="size-3 rounded-full"
                      style={{ backgroundColor: item.primary }}
                    />
                    {item.label}
                  </Button>
                ))}
              </div>
              <AccentPreview accent={activeAccent} />
            </section>
            <section aria-labelledby="borders-label" className="border-t pt-8">
              <h2 id="borders-label" className="text-base font-semibold">
                枠線
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                境界線を強調して輪郭を見やすくする
              </p>
              <Field
                orientation="horizontal"
                className="mt-4 max-w-2xl rounded-lg border p-4"
              >
                <FieldLabel htmlFor="emphasize-borders">
                  <FieldContent>
                    <span>枠線を強調する</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      カードや表、入力欄などの枠線を濃く表示します。
                    </span>
                  </FieldContent>
                  <Switch
                    id="emphasize-borders"
                    checked={emphasizeBorders}
                    onCheckedChange={setEmphasizeBorders}
                  />
                </FieldLabel>
              </Field>
            </section>
          </div>
        </section>
      ) : null}

      {section !== "appearance" ? (
        <section>
          <div className="mb-5">
            <h1 className="text-2xl font-semibold tracking-tight">操作</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              ポインターとアニメーションに関する、見やすさの設定です。
            </p>
          </div>
          <div id="behavior">
            <SettingsSection
              title="ポインターとモーション"
              description="表示の負荷を抑えるための設定です。"
              settings={preferences}
              borderless
              onToggle={(id, checked) =>
                setPreferences((current) =>
                  current.map((item) =>
                    item.id === id ? { ...item, checked } : item
                  )
                )
              }
            />
          </div>
        </section>
      ) : null}
    </div>
  )
}

export function SettingsDialog({
  open,
  onOpenChange,
}: ComponentProps<typeof Dialog>) {
  const [activeSection, setActiveSection] =
    useState<SettingsSectionId>("appearance")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="h-[min(44rem,calc(100dvh-2rem))] max-w-[calc(100%-2rem)] gap-0 overflow-hidden p-0 sm:max-w-5xl"
        showCloseButton
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage local appearance and accessibility preferences.
          </DialogDescription>
        </DialogHeader>
        <div className="grid min-h-0 flex-1 grid-cols-[11rem_minmax(0,1fr)]">
          <aside className="border-r bg-muted/30 p-3">
            <p className="px-2 py-1 text-sm font-semibold">Settings</p>
            <nav aria-label="Settings sections" className="mt-3 space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start data-[active=true]:bg-primary/10"
                data-active={activeSection === "appearance"}
                onClick={() => setActiveSection("appearance")}
              >
                <PaletteIcon /> 外観
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start data-[active=true]:bg-primary/10"
                data-active={activeSection === "behavior"}
                onClick={() => setActiveSection("behavior")}
              >
                <AccessibilityIcon /> 操作
              </Button>
            </nav>
            <p className="hidden px-2 pt-8 text-xs text-muted-foreground sm:block">
              この端末のローカル設定
            </p>
          </aside>
          <div className="min-h-0 overflow-y-auto">
            <SettingsPage embedded section={activeSection} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
