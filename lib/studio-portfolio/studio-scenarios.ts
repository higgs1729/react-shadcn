export type StudioScenario = {
  id: string
  title: string
  brief: string
  outcome: string
  flowSpec: {
    userIntent: string
    primaryScreenType: string
    requiredState: string
  }
  selectionSpec: {
    screenPattern: string
    reason: string
  }
}

export const studioScenarios: StudioScenario[] = [
  {
    id: "operations-overview",
    title: "運用状況をひと目で確認したい",
    brief:
      "主要指標・推移・直近の業務状況を、管理者が最初に把握できるようにしたい。",
    outcome: "Dashboard 01を確認する",
    flowSpec: {
      userIntent: "監視・把握",
      primaryScreenType: "dashboard",
      requiredState: "default",
    },
    selectionSpec: {
      screenPattern: "dashboard-01",
      reason: "複数の重要指標とその推移を、ひとつの判断面にまとめるため。",
    },
  },
  {
    id: "sign-in",
    title: "ログイン画面を作りたい",
    brief:
      "利用者がメールアドレスとパスワードで安全にサービスへ入れる入口を用意したい。",
    outcome: "Login 03を確認する",
    flowSpec: {
      userIntent: "認証して開始",
      primaryScreenType: "login",
      requiredState: "validation-error",
    },
    selectionSpec: {
      screenPattern: "login-03",
      reason: "認証フォーム、補助リンク、入力エラーを一貫して扱えるため。",
    },
  },
  {
    id: "invoice-review",
    title: "請求書を検索・確認したい",
    brief: "請求書を検索・絞り込みし、支払い状況を一覧で確認したい。",
    outcome: "Collection Table 01を確認する",
    flowSpec: {
      userIntent: "検索・絞り込み",
      primaryScreenType: "collection",
      requiredState: "empty",
    },
    selectionSpec: {
      screenPattern: "collection-table-01",
      reason: "高密度な一覧、検索、フィルタ、空状態を同じ画面で扱えるため。",
    },
  },
  {
    id: "team-planning",
    title: "チームの作業を前へ進めたい",
    brief: "担当者と進捗を見ながら、複数の作業をステータスごとに整理したい。",
    outcome: "Planning Board 01を確認する",
    flowSpec: {
      userIntent: "計画・進捗管理",
      primaryScreenType: "planning-board",
      requiredState: "default",
    },
    selectionSpec: {
      screenPattern: "planning-board-01",
      reason: "columnとcardの関係で、作業の状態遷移を直接扱えるため。",
    },
  },
  {
    id: "document-review",
    title: "文書を作成してレビューしたい",
    brief:
      "長い提案書を編集し、コメントと添付ファイルをまとめてレビューしたい。",
    outcome: "Document Workspace 01を確認する",
    flowSpec: {
      userIntent: "作成・レビュー",
      primaryScreenType: "document-workspace",
      requiredState: "validation-error",
    },
    selectionSpec: {
      screenPattern: "document-workspace-01",
      reason: "本文編集、コメント、添付を文書の文脈でまとめられるため。",
    },
  },
]
