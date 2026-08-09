# Portal app directory design QA

## Evidence

- Original selected visual direction: `C:\Users\tomoy\.codex\generated_images\019fe26c-28d9-7be0-b661-24e54710db93\exec-a7b69601-54cd-4411-bbd9-91abf473e317.png`
- User-reported desktop source state: `C:\Users\tomoy\AppData\Local\Temp\codex-clipboard-107db077-c656-486e-b835-d677c7952481.png`
- User-reported stacked source state: `C:\Users\tomoy\AppData\Local\Temp\codex-clipboard-10e77f52-7a99-4520-8943-58da85178c08.png`
- User-reported narrow-preview source state: `C:\Users\tomoy\AppData\Local\Temp\codex-clipboard-82da4db0-f7d3-4255-98d3-75dc71eb5162.png`
- User-reported long-name overlap source state: `C:\Users\tomoy\Desktop\python-test\.codex\audits\portal-implementation\audit-current-name-preview.png`
- Revised desktop implementation: `C:\Users\tomoy\Desktop\python-test\.codex\audits\portal-implementation\adjustment-1330x636.png`
- Revised stacked implementation: `C:\Users\tomoy\Desktop\python-test\.codex\audits\portal-implementation\adjustment-890x548.png`
- Revised mobile implementation: `C:\Users\tomoy\Desktop\python-test\.codex\audits\portal-implementation\adjustment-390x844.png`
- Combined desktop comparison: `C:\Users\tomoy\Desktop\python-test\.codex\audits\portal-implementation\comparison-adjustment.png`
- Combined responsive-preview comparison: `C:\Users\tomoy\Desktop\python-test\.codex\audits\portal-implementation\comparison-responsive-preview-final.png`
- Combined long-name/preview-stage comparison: `C:\Users\tomoy\Desktop\python-test\.codex\audits\portal-implementation\comparison-name-preview-implementation.png`
- Browser measurements: `C:\Users\tomoy\Desktop\python-test\.codex\audits\portal-implementation\verification-adjustment.json`
- Desktop source and implementation pixels: 1330 x 636 at device scale factor 1; no density normalization.
- Stacked source and implementation pixels: 890 x 548 at device scale factor 1; no density normalization.
- Mobile implementation viewport: 390 x 844 at device scale factor 1.
- State: `AI Design System Studio` selected; desktop two-column, narrow-pane single-column, stacked, and mobile drill-down layouts.

## Findings

No actionable P0, P1, or P2 issues remain.

## Full-view comparison

- The user-reported issue placed the y-axis between the line-number gutter and JSON content. The revised directory begins at x=163 while the rendered y-axis image ends at x=124 in the 1330 px viewport, so the entire list, including line numbers, now sits structurally inside the coordinate frame.
- At 890 px, the y-axis ends at x=88 and the directory begins at x=109. At 390 px, the respective values are x=51 and x=52. No list or detail content crosses the frame edge.
- The existing coordinate artwork, hero, navigation, footer, typography, app data, and selection behavior remain unchanged outside the requested directory alignment and preview treatment.

## Focused comparison

- The 1330 x 636 combined comparison shows the line numbers and JSON rows moving together to the right of the y-axis rather than using it as an internal separator.
- The selected-app summary and preview switch to a single column whenever the detail pane becomes 43rem or narrower. Across the checked desktop widths of 1181, 1240, 1330, 1400, 1472, and 1761 px, the preview widths are 469, 517, 589, 639, 670, and 640 px respectively.
- The selected app name is now a key/value grid. At the 1761 px desktop and 390 px mobile viewports it wraps to two lines; all eight checked widths report no overflow and no overlap with the preview.
- The preview uses a borderless tonal stage with 12 px padding and `#f0ece9` background. Border and box shadow remain disabled, and the image remains an unmodified production screenshot.
- All four app names remain on one line with zero truncation at every checked viewport.

## Required fidelity surfaces

- Fonts and typography: existing portal font families, weights, and sizes are preserved. Directory rows remain one line; the selected full app name may wrap naturally without clipping, truncation, or overlap.
- Spacing and layout rhythm: the directory uses the established content gutter so the y-axis functions as the outer frame. A detail-pane container query prevents the preview from shrinking continuously inside the two-column layout.
- Colors and visual tokens: the preview stage uses a solid warm-neutral `#f0ece9` surface with no border or shadow. The page background and vermilion selection accent are unchanged.
- Image quality and asset fidelity: existing R2-hosted logos and app screenshots remain intact, uncropped, and aspect-ratio preserving. No placeholder or code-drawn asset was introduced.
- Copy and content: `"name"` keys, all app names, descriptions, CTA labels, punctuation, and the removed preview label remain correct.

## Interaction and accessibility

- Selecting `GAMEHUB` updates the summary, description, CTA, preview, and alternative text.
- Existing native row buttons, `aria-current`, live-region behavior, focus styles, mobile drill-down, and back navigation remain unchanged.
- No horizontal document overflow was detected at 1330, 890, or 390 px.
- The only browser console message was a missing `/favicon.ico`; no application, hydration, layout, or interaction error was reported.

## Comparison history

### Iteration 1

- [P2] The initial selection run used a numeric loopback host and encountered a development-origin hydration issue. Verification moved to `localhost`, where the interface rendered normally.

### Iteration 2

- [P2] The selected title wrapped and description could collide with the preview at narrower desktop widths. The right-pane grid and title sizing were corrected.

### Iteration 3

- [P2] The initial directory gutter compressed the preview at standard desktop widths. The responsive grid and preview maximum were corrected while keeping the requested 670 x 530 px cap.

### Iteration 4

- [P2] User evidence showed the y-axis visually separating line numbers from row content. The whole directory was moved to the established content gutter, placing line numbers, rows, detail, and preview inside the axis frame.
- [P2] The selected-app JSON and preview were too close, and the preview lacked a clear container. The desktop gap was increased to 53 px, stacked gap to 44 px, and a bordered matte frame with restrained offset shadow was added.
- [P2] Narrowing the list to recover preview width briefly truncated the longest app name. The list track was adjusted to 26.75rem; final browser measurements report zero truncated names.

### Iteration 5

- [P2] At an intermediate screen ratio, the preview stayed in the summary's two-column grid and collapsed to roughly 200 px wide. A 43rem detail-pane container query now switches only the right-pane content to a single column; the smallest checked desktop preview is 469 px wide.
- [P2] Expanding the responsive list track initially truncated longer app names at larger widths. The track now uses `clamp(26.75rem, 31vw, 31rem)`; all eight checked viewports report zero truncated names and no horizontal overflow.
- The first frame treatment was deliberately removed after the latest user direction. Computed browser styles confirm `border: none`, `padding: 0`, `box-shadow: none`, and a transparent wrapper background.

### Iteration 6

- [P2] A long selected app name remained on one line and painted into the preview area. The selected property now uses `max-content minmax(0, 1fr)` tracks, allows natural wrapping, and keeps the complete quoted value visible.
- [P2] After removing the frame, the preview felt visually unanchored. A borderless warm-neutral stage with 12 px padding now groups the screenshot without restoring a frame line or shadow.
- The summary minimum was raised to 15rem, the preview minimum to 26rem, and the detail-pane stacking threshold to 46rem. Eight checked viewports report zero name overflow, zero preview overlap, zero directory-name truncation, and no horizontal page overflow.

Post-fix evidence is the revised screenshots and combined comparison listed above.

## Follow-up polish

- [P3] The sticky header is visible in the browser-captured comparison state while it is outside the crop in the user-supplied desktop screenshot. This does not affect the directory alignment or spacing fix.

## Verification

- `npm -w apps/portal run lint`: passed.
- `npm -w apps/portal run typecheck`: passed.
- `npm -w apps/portal run build`: passed.
- Desktop, stacked, and mobile layouts were rendered and measured in the browser.
- Axis containment, selected-name wrapping, selected-name/preview collision, directory-name truncation, responsive preview sizing, tonal-stage styling, and horizontal overflow were checked numerically and visually.

final result: passed
