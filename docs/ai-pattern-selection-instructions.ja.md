# AIパターン選定指示書

すでに決定済みのflowに対して、screen patternとblock patternを選定する。入力は `FlowSpec`、出力は `SelectionSpec` とする。次のimplementation layerが依存関係のinstallとcode generationを追加解釈なしで実行できるよう、できるだけ機械的に解決する。

## 入力: FlowSpec

flowはすでに決定済みである。各stepは1つの画面を表し、facet signalsだけを持つ。`screenType` は入力されないため、手順1で解決する。

```jsonc
{
  "flowId": "invoice-management",
  "flowArchetype": "crud",
  "steps": [
    {
      "stepId": "list",
      "order": 1,
      "userIntents": ["browse", "filter"],
      "dataShapes": ["collection"],
      "interactionModels": ["filter-sort", "selection-multiple"],
      "density": "high",
      "requiredStates": ["default", "loading", "empty", "error"],
      "accessibilityConstraints": { "keyboard": true, "apgPattern": "grid" },
      "visualTone": ["enterprise"],
      "transitions": { "onSelect": "detail" }
    }
  ]
}
```

facet vocabularyは `docs/ai-design-facets.schema.json` で定義する。canonical screen profilesは `docs/ai-design-system-research.md` に記録する。enum外の値は拒否する。facetが不足している場合は、他のfacetから保守的に推論し、その仮定を出力に記録する。

## stepごとの手順

1. **screenTypeを解決する。** `userIntents` + `dataShapes` + `interactionModels` を各 `screenType` のcanonical facet profileと照合し、最も合うものを選ぶ。僅差の場合は、そのstepを tied candidates とともに `unresolved` に入れてescalateする。推測で決めない。
2. **screen patternを取得して採点する。** 解決済みの `screenType`、次に `userIntents`、次に `dataShapes` で `screen-pattern` itemsをfilterする。`registryDependencies` が不足しているitem、declared incompatibilitiesがあるitem、`requiredStates` を十分にcoverできないitemは除外する。100点満点で採点する: Intent 25 / DataShape 15 / Interaction 15 / State 15 / A11y 10 / Dependency 10 / Evidence 10。70点未満はrejectする。最上位candidateを採用し、rejected alternativesを保持する。
3. **required block rolesを読む。** 選ばれたscreen patternの `composition.requiredBlocks` からrolesを読む。これは構造情報であり、raw facetsから直接導出しない。`optionalBlocks` は、`filter` intent -> `filter-toolbar` のようにstep facetが明確に要求する場合だけ追加する。
4. **roleごとにblock patternを選ぶ。** `blockRole` ごとに `block-pattern` candidatesを取得し、手順2と同じrubricで採点する。70点未満はrejectする。roleごとに最上位candidateを採用する。
5. **block levelで止める。** 選ばれた各itemの `registryDependencies` は情報として列挙するだけにする。個別componentは選定しない。

## 選定ルール

- `maturity` が高いものを優先する: internal canonical -> official shadcn -> project Storybook items -> mature design-system guidance -> risk review後のcommunity items。
- 1つの弱い情報源だけに依存する選択は `experimental` とし、`assumptions` により安全なcanonical fallbackを記録する。
- patternが明示的に対応していない限り、複数のnavigation shellを組み合わせない。
- `dataShapes` に `metric`、`time-series`、`categorical` が含まれる場合、またはcomparison intentがある場合以外はchartを追加しない。
- `auth` や `onboarding` screen typeに高密度data blockを使わない。
- registry dependencyがすでに提供しているshadcn primitiveを再作成しない。
- data-driven screenでは `empty`、`loading`、`error`、`permission-denied` のcoverageを必須にする。
- AI出力がユーザー判断に実質的な影響を与える場合は、AI explainability blockを含める。
- `visualTone` はtiebreakerとしてのみ扱う。

## 出力: SelectionSpec

```jsonc
{
  "flowId": "invoice-management",
  "screens": [
    {
      "stepId": "list",
      "resolvedScreenType": "collection",
      "screenPattern": {
        "registryItem": "collection-table-01",
        "score": 88,
        "rejected": [
          {
            "registryItem": "collection-grid-01",
            "score": 74,
            "reason": "lower density fit"
          }
        ]
      },
      "blocks": [
        {
          "blockRole": "filter-toolbar",
          "registryItem": "filter-toolbar-02",
          "score": 91
        },
        {
          "blockRole": "data-table-panel",
          "registryItem": "data-table-panel-01",
          "score": 85
        }
      ],
      "registryDependencies": ["sidebar", "table", "checkbox", "button", "input", "select"],
      "stateCoveragePlan": ["default", "loading", "empty", "error"],
      "checksPlanned": ["lint", "typecheck", "a11y", "story"],
      "assumptions": [],
      "risks": []
    }
  ],
  "unresolved": []
}
```

- `registryDependencies` は、選定されたitemsが宣言しているdependenciesのinformational unionである。
- `checksPlanned` は後段で実行すべきchecksを記録する。このlayerでは実行しない。
- `unresolved` には、70点以上のcandidateがないstep、解消できないtie、依存関係不足を持つstepを入れる。これらはescalateし、低信頼の選択を強行しない。

## 出力前セルフレビュー

emitする前に、必ず以下を確認する。

- すべてのstepが1つの `screenType` に解決されているか、または明示的に `unresolved` に入っている。
- block rolesはraw facetsではなく `requiredBlocks` から来ている。
- 選定されたitemはすべて70点以上である。
- componentsは選定されておらず、dependenciesが情報として列挙されているだけである。
- rejected alternativesとassumptionsが記録されている。
- すべての `requiredStates` が `stateCoveragePlan` に含まれているか、またはriskとして記録されている。

## セルフレビュー失敗時のloop

セルフレビュー項目が1つでも失敗した場合、その `SelectionSpec` はemitしてはいけない。次のloopを実行する。

1. 失敗したchecksを `reviewFailures` として内部的に列挙する。
2. 修正可能な失敗は、candidateの再取得、score再計算、block rolesの再読込、または不足している `assumptions`、`risks`、rejected alternativesの追加によって修正する。
3. 修正後、出力前セルフレビューを最初から再実行する。
4. すべてのcheckが成功するまで、改善とレビューを繰り返す。
5. candidate不足、解消できないtie、依存関係不足など、このselection layer内で修正できない失敗は、該当stepを `unresolved` に移し、理由を記録してからセルフレビューを再実行する。
6. emitできるのは、セルフレビューを通過した `SelectionSpec` だけである。

このloopはimplementation-layer checksを実行するものではない。selection-layer outputの整合性を、セルフレビュー成功まで改善するためのloopである。
