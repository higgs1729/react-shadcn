"use client"

import * as React from "react"
import {
  AccessibilityIcon,
  PaletteIcon,
  RotateCcwIcon,
  UserRoundIcon,
} from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  getTeamTAccent,
  teamTAccents,
  teamTThemeLabels,
  teamTThemes,
  type TeamTPreferences,
  type TeamTProfile,
  type TeamTTheme,
} from "@/lib/team-t-app/preferences"

type SettingsSection = "appearance" | "profile"

interface TeamTSettingsDialogProps {
  open: boolean
  preferences: TeamTPreferences
  profile: TeamTProfile
  onOpenChange: (open: boolean) => void
  onPreferencesChange: (update: Partial<TeamTPreferences>) => void
  onProfileChange: (profile: TeamTProfile) => void
  onReset: () => void
}

export function TeamTSettingsDialog({
  open,
  preferences,
  profile,
  onOpenChange,
  onPreferencesChange,
  onProfileChange,
  onReset,
}: TeamTSettingsDialogProps) {
  const [section, setSection] = React.useState<SettingsSection>("appearance")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[min(38rem,calc(100dvh-2rem))] max-w-[calc(100%-2rem)] gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="sr-only">
          <DialogTitle>設定</DialogTitle>
          <DialogDescription>
            表示とプロフィールを変更します。
          </DialogDescription>
        </DialogHeader>
        <div className="grid min-h-0 grid-cols-[9rem_minmax(0,1fr)]">
          <aside className="border-r bg-muted/30 p-3">
            <p className="px-2 py-1 text-sm font-semibold">設定</p>
            <nav aria-label="設定セクション" className="mt-3 space-y-1">
              <SettingsNavButton
                active={section === "appearance"}
                icon={PaletteIcon}
                label="外観"
                onClick={() => setSection("appearance")}
              />
              <SettingsNavButton
                active={section === "profile"}
                icon={UserRoundIcon}
                label="プロフィール"
                onClick={() => setSection("profile")}
              />
            </nav>
          </aside>
          <div className="min-h-0 overflow-y-auto p-5 sm:p-6">
            {section === "appearance" ? (
              <AppearanceSettings
                preferences={preferences}
                onPreferencesChange={onPreferencesChange}
              />
            ) : (
              <ProfileSettings
                profile={profile}
                onProfileChange={onProfileChange}
              />
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-10"
              onClick={onReset}
            >
              <RotateCcwIcon data-icon="inline-start" />
              この端末の設定をリセット
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function SettingsNavButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean
  icon: typeof PaletteIcon
  label: string
  onClick: () => void
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      className="w-full justify-start data-[active=true]:bg-primary/10"
      data-active={active}
      onClick={onClick}
    >
      <Icon data-icon="inline-start" />
      {label}
    </Button>
  )
}

function ThemePreview({
  theme,
  selected,
  onSelect,
}: {
  theme: TeamTTheme
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
        className={`relative block h-20 overflow-hidden rounded-md border ${theme === "midnight" ? "border-[color:var(--team-t-gold-line)] bg-[#09090b]" : theme === "dark" ? "bg-zinc-800" : "bg-zinc-100"}`}
      >
        <span
          className={`absolute top-3 left-1/2 h-1 w-14 -translate-x-1/2 rounded-full ${theme === "midnight" ? "bg-[#c7ab70]" : theme === "dark" ? "bg-zinc-500" : "bg-zinc-400"}`}
        />
        <span
          className={`absolute inset-x-3 top-7 h-10 rounded-t-md ${theme === "midnight" ? "bg-[#1c1a20]" : theme === "dark" ? "bg-zinc-700" : "bg-white"}`}
        />
        <span
          className={`absolute top-9 left-5 h-1 w-9 rounded-full ${theme === "midnight" ? "bg-[#c7ab70]/70" : "bg-muted-foreground/35"}`}
        />
        <span
          className={`absolute top-12 left-5 h-1 w-14 rounded-full ${theme === "midnight" ? "bg-[#a89f92]/50" : "bg-muted-foreground/25"}`}
        />
      </span>
      <span className="mt-2 block text-center text-xs font-medium">
        {theme === "midnight" ? "ミッドナイト" : teamTThemeLabels[theme]}
      </span>
    </button>
  )
}

function AppearanceSettings({
  preferences,
  onPreferencesChange,
}: Pick<TeamTSettingsDialogProps, "preferences" | "onPreferencesChange">) {
  const [reduceMotionWarningOpen, setReduceMotionWarningOpen] =
    React.useState(false)
  const accentLocked = preferences.theme === "midnight"
  const activeAccent = getTeamTAccent(preferences.accent)

  return (
    <div className="space-y-8">
      <section aria-labelledby="team-t-theme-label">
        <h2 id="team-t-theme-label" className="text-lg font-semibold">
          テーマ
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          既定はミッドナイトです。ダークとライトは標準の配色で表示します。
        </p>
        <div
          className="mt-4 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3"
          role="group"
          aria-label="テーマ"
        >
          {teamTThemes.map((theme) => (
            <ThemePreview
              key={theme}
              theme={theme}
              selected={preferences.theme === theme}
              onSelect={() => onPreferencesChange({ theme })}
            />
          ))}
        </div>
      </section>

      <section aria-labelledby="team-t-accent-label" className="border-t pt-6">
        <h2 id="team-t-accent-label" className="text-base font-semibold">
          アクセント
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {accentLocked
            ? "このテーマはアクセントを変更できません。"
            : "選択状態、主要なアクション、フォーカス表示に使う色です。"}
        </p>
        <div
          className="mt-4 flex flex-wrap gap-2"
          role="group"
          aria-label="アクセント"
        >
          {teamTAccents.map((accent) => (
            <Button
              key={accent.id}
              type="button"
              size="sm"
              variant={
                !accentLocked && preferences.accent === accent.id
                  ? "default"
                  : "outline"
              }
              aria-pressed={!accentLocked && preferences.accent === accent.id}
              disabled={accentLocked}
              onClick={() => onPreferencesChange({ accent: accent.id })}
            >
              <span
                className="size-3 rounded-full"
                style={{ backgroundColor: accent.primary }}
              />
              {accent.label}
            </Button>
          ))}
        </div>
        {accentLocked ? null : (
          <p className="mt-3 text-xs text-muted-foreground">
            選択中: {activeAccent.label}
          </p>
        )}
      </section>

      <section aria-labelledby="team-t-borders-label" className="border-t pt-6">
        <h2 id="team-t-borders-label" className="text-base font-semibold">
          枠線
        </h2>
        <Label
          htmlFor="team-t-emphasize-borders"
          className="mt-4 flex cursor-pointer items-center justify-between gap-4 rounded-lg border p-3"
        >
          <span className="flex flex-col gap-1">
            <span className="text-sm font-medium">枠線を強調する</span>
            <span className="text-sm font-normal text-muted-foreground">
              カードや表、入力欄などの枠線を濃く表示します。
            </span>
          </span>
          <Switch
            id="team-t-emphasize-borders"
            checked={preferences.emphasizeBorders}
            onCheckedChange={(emphasizeBorders) =>
              onPreferencesChange({ emphasizeBorders })
            }
          />
        </Label>
      </section>

      <section className="border-t pt-6">
        <Label
          htmlFor="team-t-reduce-motion"
          className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border p-3"
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <AccessibilityIcon className="size-4" />
            動きを減らす
          </span>
          <Switch
            id="team-t-reduce-motion"
            checked={preferences.reduceMotion}
            onCheckedChange={(reduceMotion) => {
              if (reduceMotion) {
                setReduceMotionWarningOpen(true)
                return
              }
              onPreferencesChange({ reduceMotion: false })
            }}
          />
        </Label>
      </section>

      <AlertDialog
        open={reduceMotionWarningOpen}
        onOpenChange={setReduceMotionWarningOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <AccessibilityIcon aria-hidden="true" />
            </AlertDialogMedia>
            <AlertDialogTitle>3Dマップの動きも軽減します</AlertDialogTitle>
            <AlertDialogDescription>
              有効にすると、APIアーケード内の待機アニメーション、カメラの揺れ、ゲートや筐体のパルス表現が軽減または停止します。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onPreferencesChange({ reduceMotion: true })
                setReduceMotionWarningOpen(false)
              }}
            >
              動きを減らす
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function ProfileSettings({
  profile,
  onProfileChange,
}: Pick<TeamTSettingsDialogProps, "profile" | "onProfileChange">) {
  return (
    <section>
      <h2 className="text-lg font-semibold">プロフィール</h2>
      <div className="mt-5 space-y-2">
        <Label htmlFor="team-t-display-name">表示名</Label>
        <Input
          id="team-t-display-name"
          maxLength={40}
          value={profile.displayName}
          onChange={(event) =>
            onProfileChange({ displayName: event.target.value })
          }
          placeholder="未設定"
        />
      </div>
    </section>
  )
}
