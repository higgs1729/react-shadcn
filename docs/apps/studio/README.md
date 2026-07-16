# Studio App Spec

AI Design System Studio を静的ポートフォリオとして完成させるための正本。

## 実装原則

1. 画面は `StudioLayout → Page / ChildRoute → Drawer / Dialog / Popover` の階層として扱う。
2. 主ナビは Overview / Patterns / Studio / Quality / Case Study の5項目に限定する。
3. 選定済みpatternは構成を維持してcontent bindingする。適合しない場合だけ理由を記録してapp固有compositionへ切り替える。
4. 表示値はregistry・FlowSpec・SelectionSpec・BuildReportからbuild-time生成する。
5. 静的export完成まではcore contractを変更しない。
6. 自動検証済みと人間レビュー済みを区別する。

## ファイル

| ファイル | 正本にする内容 |
| --- | --- |
| [architecture.md](architecture.md) | StudioLayout、Page、ChildRoute、Transient UIの設計判断 |
| [content-map.md](content-map.md) | 各Page・Drawer・Dialogに必要な情報と表示順 |
| [studio-app-spec.json](studio-app-spec.json) | layout・navigation・route・component bindingの機械可読Spec |
| [delivery.md](delivery.md) | 二日間の実装順、完了条件、対象外 |

## 変更ルール

- UI構成を変えるときは最初に `studio-app-spec.json` を更新する。
- 文言・表示情報を変えるときは最初に `content-map.md` を更新する。
- 実装順と完了状況は `delivery.md` だけで管理する。
- 背景、議論の履歴、将来案はこのフォルダへ追加しない。
