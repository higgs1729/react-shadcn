"use client"

import * as React from "react"
import { ArrowLeftIcon, DownloadIcon, UploadIcon } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@react-shadcn/shadcn-kit/ui/alert-dialog"
import { Button, buttonVariants } from "@react-shadcn/shadcn-kit/ui/button"
import { BrowseView } from "@/components/python-test/browse-view"
import { HomeView, type HomeSettings } from "@/components/python-test/home-view"
import { QuizView } from "@/components/python-test/quiz-view"
import { ResultView } from "@/components/python-test/result-view"
import { useProgress } from "@/components/python-test/use-progress"
import {
  CATEGORIES,
  LEVELS,
  QUESTIONS,
  type CategoryKey,
} from "@/lib/python-test/data"
import { downloadProgress, readProgressFile } from "@/lib/python-test/progress"
import {
  DEFAULT_FILTERS,
  filterQuestions,
  newSession,
  shuffled,
  type Session,
} from "@/lib/python-test/quiz"
import { cn } from "@react-shadcn/shadcn-kit/lib/utils"

type View = "home" | "quiz" | "browse" | "result"
type Notice = { title: string; description: string }

// This app owns a subtree ("/python-test"); the portal sits at the site root.
// A link back to it has to use the site root, not this app's basePath.
const siteBasePath = process.env.NEXT_PUBLIC_SITE_BASE_PATH ?? ""
const ALL_CATS = Object.keys(CATEGORIES) as CategoryKey[]

const INITIAL_SETTINGS: HomeSettings = {
  cats: ALL_CATS,
  levels: [...LEVELS],
  numQ: "40",
  shuffle: true,
  wrongOnly: false,
  filters: DEFAULT_FILTERS,
}

export function PythonTestApp() {
  const progress = useProgress()
  const {
    stats,
    flags,
    ready,
    recordAnswer,
    addFlag,
    undoFlag,
    resetAll,
    replaceProgress,
    snapshot,
  } = progress

  const [view, setView] = React.useState<View>("home")
  const [settings, setSettings] = React.useState<HomeSettings>(INITIAL_SETTINGS)
  const [session, setSession] = React.useState<Session | null>(null)
  const [selected, setSelected] = React.useState<number | null>(null)
  const [notice, setNotice] = React.useState<Notice | null>(null)
  const importRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    window.scrollTo(0, 0)
  }, [view, session?.idx])

  const startQuiz = () => {
    const { cats, levels, wrongOnly, shuffle, numQ, filters } = settings
    if (cats.length === 0) {
      return setNotice({
        title: "出題できません",
        description: "分野を1つ以上選択してください。",
      })
    }
    if (levels.length === 0) {
      return setNotice({
        title: "出題できません",
        description: "難易度を1つ以上選択してください。",
      })
    }

    let pool = QUESTIONS.filter(
      (question) =>
        cats.includes(question.cat) && levels.includes(question.level)
    )
    if (wrongOnly) {
      pool = pool.filter(
        (question) =>
          stats[question.id] &&
          stats[question.id].seen > stats[question.id].correct
      )
      if (pool.length === 0) {
        return setNotice({
          title: "出題できません",
          description:
            "誤答した問題がありません。まずは通常出題で解いてみましょう。",
        })
      }
    }
    pool = filterQuestions(pool, cats, levels, filters, stats, flags)
    if (pool.length === 0) {
      return setNotice({
        title: "出題できません",
        description:
          "絞り込み条件に一致する問題がありません。条件を変更してください。",
      })
    }
    if (shuffle) pool = shuffled(pool)
    const num = Number.parseInt(numQ, 10)
    if (num > 0 && pool.length > num) pool = pool.slice(0, num)

    setSession(newSession(pool))
    setSelected(null)
    setView("quiz")
  }

  const answer = (index: number) => {
    if (!session || selected !== null) return
    const question = session.list[session.idx]
    const right = index === question.answer
    setSelected(index)
    setSession({
      ...session,
      correct: session.correct + (right ? 1 : 0),
      answers: [
        ...session.answers,
        { id: question.id, cat: question.cat, right, sel: index },
      ],
    })
    recordAnswer(question.id, right)
  }

  const next = () => {
    if (!session) return
    const idx = session.idx + 1
    setSelected(null)
    if (idx >= session.list.length) setView("result")
    else setSession({ ...session, idx })
  }

  const retryWrong = () => {
    if (!session) return
    const wrongIds = session.answers
      .filter((answer) => !answer.right)
      .map((answer) => answer.id)
    if (wrongIds.length === 0) {
      return setNotice({
        title: "復習はありません",
        description: "今回のセッションに誤答はありませんでした。",
      })
    }
    setSession(
      newSession(
        shuffled(QUESTIONS.filter((question) => wrongIds.includes(question.id)))
      )
    )
    setSelected(null)
    setView("quiz")
  }

  const goHome = () => {
    setSession(null)
    setSelected(null)
    setView("home")
  }

  const importProgress = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    try {
      const nextProgress = await readProgressFile(file)
      replaceProgress(nextProgress)
      setNotice({
        title: "学習データを読み込みました",
        description: `${Object.keys(nextProgress.stats).length}問分の成績とマークをブラウザに保存しました。`,
      })
    } catch (error) {
      setNotice({
        title: "学習データを読み込めません",
        description:
          error instanceof Error
            ? error.message
            : "ファイルを確認してください。",
      })
    }
  }

  return (
    <div className="python-test-app min-h-svh bg-background text-foreground">
      <div className="mx-auto max-w-3xl p-4">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl leading-none" aria-hidden="true">
              📊
            </span>
            <div>
              <h1 className="font-heading text-lg font-medium">
                データ分析試験 模擬問題集
              </h1>
              <p className="text-xs text-muted-foreground">
                Python3エンジニア認定 対策 ／ 学習用オリジナル問題
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-1">
            <input
              ref={importRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={importProgress}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => importRef.current?.click()}
            >
              <UploadIcon />
              読み込み
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => downloadProgress(snapshot())}
            >
              <DownloadIcon />
              書き出し
            </Button>
            <a
              href={`${siteBasePath}/`}
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              <ArrowLeftIcon />
              Appsへ
            </a>
          </div>
        </header>

        {!ready ? (
          <p className="text-sm text-muted-foreground">読み込み中…</p>
        ) : view === "home" ? (
          <HomeView
            settings={settings}
            onChange={setSettings}
            stats={stats}
            flags={flags}
            onStart={startQuiz}
            onBrowse={() => setView("browse")}
            onReset={resetAll}
          />
        ) : view === "browse" ? (
          <BrowseView
            onClose={goHome}
            flags={flags}
            onAddFlag={addFlag}
            onUndoFlag={undoFlag}
          />
        ) : view === "quiz" && session ? (
          <QuizView
            session={session}
            selected={selected}
            onAnswer={answer}
            onNext={next}
            onQuit={goHome}
            flags={flags}
            onAddFlag={addFlag}
            onUndoFlag={undoFlag}
          />
        ) : view === "result" && session ? (
          <ResultView
            session={session}
            onHome={goHome}
            onRetryWrong={retryWrong}
          />
        ) : null}

        <AlertDialog
          open={notice !== null}
          onOpenChange={() => setNotice(null)}
        >
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogTitle>{notice?.title}</AlertDialogTitle>
              <AlertDialogDescription>
                {notice?.description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setNotice(null)}>
                OK
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
