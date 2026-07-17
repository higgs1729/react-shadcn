"use client"

import * as React from "react"
import {
  AccessibilityIcon,
  PaletteIcon,
  RotateCcwIcon,
  UserRoundIcon,
} from "lucide-react"

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
import { cn } from "@/lib/utils"
import type { TeamTPreferences, TeamTProfile } from "@/lib/team-t-app/preferences"

type SettingsSection = "appearance" | "profile"

interface TeamTSettingsDialogProps {
  open: boolean
  preferences: TeamTPreferences
  profile: TeamTProfile
  onOpenChange: (open: boolean) => void
  onReduceMotionChange: (reduceMotion: boolean) => void
  onProfileChange: (profile: TeamTProfile) => void
  onReset: () => void
  themeClassName: string
}

export function TeamTSettingsDialog({
  open,
  preferences,
  profile,
  onOpenChange,
  onReduceMotionChange,
  onProfileChange,
  onReset,
  themeClassName,
}: TeamTSettingsDialogProps) {
  const [section, setSection] = React.useState<SettingsSection>("appearance")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "h-[min(38rem,calc(100dvh-2rem))] max-w-[calc(100%-2rem)] gap-0 overflow-hidden p-0 sm:max-w-3xl",
          themeClassName
        )}
      >
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
                onReduceMotionChange={onReduceMotionChange}
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

function AppearanceSettings({
  preferences,
  onReduceMotionChange,
}: Pick<TeamTSettingsDialogProps, "preferences" | "onReduceMotionChange">) {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold">外観</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Team T API Labはミッドナイトトロフィールームの見た目で統一しています。
        </p>
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
            onCheckedChange={onReduceMotionChange}
          />
        </Label>
      </section>
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
