# Delivery

## Day 1

- [ ] `studio-app-spec.json` を読む共通data moduleを作る。
- [ ] `StudioLayout` を作り、AppHeader・Sidebar・mobile Drawerを接続する。
- [ ] 5つのPrimaryNavigation Pageを作り、active stateを接続する。
- [ ] Overviewを `studio-overview-01` として既存blockから構成する。
- [ ] Patternsをregistry dataへbindingする。
- [ ] Pattern detailとLive demoをDrawerで接続する。

## Day 2

- [ ] Studioをbrief・selection・result dataへbindingする。
- [ ] AI assistantとrationaleをDrawer、checkpointをDialogで接続する。
- [ ] Qualityをchecks・coverage・contract・provenanceへbindingする。
- [ ] Case Studyをapp固有compositionで実装する。
- [ ] mobile、keyboard、state、deep-linkを確認する。
- [ ] 静的exportとStorybookをGitHub Pages用artifactへ統合する。
- [ ] `npm run test:studio-portfolio-data`、`npm run validate`、`npm run checks` を通す。

## 完了条件

- 5つのPageが同じStudioLayout内で切り替わる。
- 16 stepすべてがPage / ChildRoute / TabPanel / Drawer / Dialogのいずれかで到達可能。
- 表示件数・pattern・flow結果がbuild-time dataと一致する。
- app固有compositionのoverride理由がSpecに残っている。
- 自動検証済みと人間レビュー済みを混同していない。
- GitHub Pagesのbase pathで全routeとStorybook deep-linkが開く。

## 対象外

- core FlowSpec / SelectionSpec schemaの再設計。
- ContentSpec / ShellSpecの汎用契約化。
- backend、AI API、永続化。
- maturityの昇格。
- 任意のbriefから本番アプリを生成する機能。
