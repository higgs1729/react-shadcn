# Team T Explore — Design QA

## Comparison target

- Source visual truth: `C:\Users\tomoy\Desktop\react-shadcn\.artifacts\product-design\team-t-explore\02-selected-api-atlas.png`
- Final implementation screenshot: `C:\Users\tomoy\Desktop\react-shadcn\.artifacts\product-design\team-t-explore\14-final-tools-selected.png`
- Initial unselected screenshot: `C:\Users\tomoy\Desktop\react-shadcn\.artifacts\product-design\team-t-explore\13-final-initial.png`
- Mobile selected screenshot: `C:\Users\tomoy\Desktop\react-shadcn\.artifacts\product-design\team-t-explore\11-implementation-mobile-selected-viewport.png`
- Full-view comparison: `C:\Users\tomoy\Desktop\react-shadcn\.artifacts\product-design\team-t-explore\15-final-design-qa-comparison.png`
- Focused atlas comparison: `C:\Users\tomoy\Desktop\react-shadcn\.artifacts\product-design\team-t-explore\16-final-design-qa-atlas-focus.png`

## Normalization

- CSS viewport: 1280 × 720 at device scale 1.
- Source pixels: 1672 × 941, aspect-fitted to 1280 × 720 for comparison.
- Implementation pixels: 1270 × 714 from the in-app browser capture, aspect-fitted to 1280 × 720 for comparison.
- State: Team T initial Midnight theme, exploration window, `為替・ツール系` selected for source-to-implementation comparison.
- The sidebar is intentionally excluded from redesign judgment per user scope; it is retained as existing application chrome.

## Findings

- No actionable P0, P1, or P2 differences remain.
- Typography: the existing Geist/Inter product stack preserves the source hierarchy, with a one-line desktop headline and readable Japanese body/detail copy. Mobile reflows the headline without clipping.
- Spacing and layout: five category nodes use equal polar spacing on one ellipse. `その他` no longer has a unique offset. The detail panel opens inward from every node and does not move the remaining nodes.
- Colors and tokens: Midnight uses the existing purple and gold tokens. Dark and Light inherit `--primary`, `--ring`, `--team-t-gold`, and `--team-t-gold-line`, so the atlas follows the selected accent rather than a fixed purple.
- Image quality and asset fidelity: there are no new raster assets in the exploration content. Existing app logo and Reward Wallet imagery remain unchanged and outside the requested scope. Category symbols use the existing project icon family.
- Copy and content: the selected category descriptions and tags match the established catalog categories. The removed main search field and catalog totals remain absent as specified.
- Interaction and accessibility: all five nodes are native labeled buttons. Initial state has zero selected nodes and no detail panel. Selecting another node swaps the panel; repeated click, Escape, and empty map click clear selection. Focus rings use theme tokens.
- Responsive behavior: desktop uses the orbital atlas. Mobile uses a two-column category arrangement with the fifth node centered and moves the detail panel below the nodes. No horizontal overflow was observed at 390 × 844.
- Intentional source deviations: extra decorative gold outer orbits were omitted because the agreed specification limits the gold orbit to the one connection joining the five nodes. Initial state is unselected even though the source mock shows a selected category.

## Comparison history

### Pass 1

- Finding: the first detail panel was too large and vertically centered, obscuring the top category node.
- Finding: node and label scale was stronger than the selected mock.
- Fixes: reduced panel width and text scale, moved left/right panels inward and downward, reduced node/icon/label scale, and tightened the desktop headline.
- Post-fix evidence: `09-design-qa-comparison-v2.png` and `12-design-qa-atlas-focus.png`.

### Pass 2

- Finding: neutral nodes and the single connecting orbit were too subdued for the Midnight target.
- Fixes: raised neutral icon contrast through `--ring`, strengthened the token-based orbit, and added a restrained gold tint to the category CTA.
- Post-fix evidence: `15-final-design-qa-comparison.png` and `16-final-design-qa-atlas-focus.png`.

## Verification

- Primary interactions tested: all five category selections, category switching, repeated-click deselection, Escape deselection, empty-map deselection, and category CTA filtering of the existing catalog.
- Initial-state assertion: five desktop nodes, zero selected nodes, zero visible detail panels.
- Browser console errors: none.
- Targeted ESLint: passed.
- Production compilation: application compilation passed; the repository-wide TypeScript phase is currently blocked by an unrelated pre-existing error in `app/(system)/example-previews/invoice-desk/invoice-desk-app.tsx`.

## Follow-up polish

- P3: optional motion can be added later for node selection and panel entry, guarded by the existing reduced-motion preference.

final result: passed
