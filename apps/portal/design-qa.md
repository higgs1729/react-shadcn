# Portal design QA

## Comparison target

- Source visual truth: `C:\Users\tomoy\.codex\generated_images\019fc68e-a12b-7571-8571-98a665103a0e\exec-e44b6958-696c-4a5a-bd38-66d91409cec9.png`
- Implementation screenshot: `C:\Users\tomoy\Desktop\react-shadcn\apps\portal\design-qa-implementation-final.png`
- Full-view comparison: `C:\Users\tomoy\Desktop\react-shadcn\apps\portal\design-qa-comparison-final.png`
- Focused hero comparison: `C:\Users\tomoy\Desktop\react-shadcn\apps\portal\design-qa-focus-hero.png`
- Focused list comparison: `C:\Users\tomoy\Desktop\react-shadcn\apps\portal\design-qa-focus-list.png`
- Responsive evidence: `C:\Users\tomoy\Desktop\react-shadcn\apps\portal\design-qa-mobile-viewport.png`
- Wide-screen regression evidence: `C:\Users\tomoy\.codex\visualizations\2026\08\03\019fc68e-a12b-7571-8571-98a665103a0e\portal-wide-audit\02-wide-after.jpg`
- Current 1536 px evidence: `C:\Users\tomoy\.codex\visualizations\2026\08\03\019fc68e-a12b-7571-8571-98a665103a0e\portal-wide-audit\07-standard-final.jpg`
- Current mobile evidence: `C:\Users\tomoy\.codex\visualizations\2026\08\03\019fc68e-a12b-7571-8571-98a665103a0e\portal-wide-audit\06-mobile-final.jpg`
- Reference pixels: 1536 × 1024.
- Implementation pixels: 1536 × 1024.
- CSS viewport: 1536 × 1024 at device scale factor 1.
- Density normalization: none required; source and implementation use equal pixel dimensions.
- State: default light appearance, page top, no hover or focus state.

## Findings

No actionable P0, P1, or P2 differences remain.

- Fonts and typography: hierarchy, weights, line heights, and the two-line headline structure match the selected direction. The approved copy changes (`WEB APPS`, the new headline, and the scope-aware lead) are intentional content changes rather than fidelity drift. Japanese rendering uses the existing project font fallback.
- Spacing and layout rhythm: the sticky 54 px header, 420 px hero, coordinate-axis boundary, JSON list columns, three row dividers, closing bracket, and footer all align to the 1536 × 1024 composition. The coordinate plane is page-wide while its origin and content gutter use separate edge-relative tokens; this preserves the approved 1536 px composition and prevents the y-axis from entering the content column on wider screens. The x-axis, both y-axis sections, and the curve baseline resolve from one shared origin.
- Colors and visual tokens: warm off-white, black header and CTAs, vermilion decorative accent, and semantic blue page-top link match the approved palette.
- Image quality and asset fidelity: the curve, integration hatching, axes, mathematical labels, logos, and CTA arrow remain the approved source-derived raster assets rather than code-drawn approximations. The x-axis source is displayed through separate fixed crops for its stroke, arrow, `O`, and `x`, which removes the duplicated curve pixels while preserving the original artwork.
- Copy and content: the page scope is web-usable apps; facts, numeric indices, related links, the `A` callout, and the bottom-left about link are absent. Every app row ends in `},`, the divider is above `]`, and intentional copy breaks occur only after `、`.
- Responsiveness: 3440, 2560, 1920, 1536, 1024, 681, 680, and 390 px widths were checked. At 1536 px and above the origin stays at 124 px, the content gutter stays at 188 px, and their 64 px separation is invariant. The `O` and `x` crops remain exactly 13 × 13 px and 10 × 10 px; the y-axis source remains 45 × 434 px at every width. The curve remains 374 px high across all checked widths, and its internal baseline meets the x-axis within 0.002 px. At 390 × 844 there is no horizontal content overflow; rows stack legibly and all CTAs remain visible.
- Interaction and accessibility: at 390 px the header remains at `top: 0` after scrolling to 600 px; the page-top link returns scroll position to 0; all five anchors expose the intended hrefs; all decorative images have empty alternative text. Browser logs contain only React DevTools and HMR informational messages, with no errors.

## Comparison history

### Iteration 1

- [P2] App columns were too far left: the first logo started around x=239 and body around x=356 instead of the reference x=252 and x=402. Fixed by widening the syntax/logo columns and aligning the logo within its column.
- [P2] The x-axis had a short discontinuity at the start of the integration region and the origin was visually doubled. Fixed by correcting image stacking, separating axis assets, and removing the duplicated curve baseline.
- [P2] The first implementation was denser vertically and footer content ended early. Fixed by matching the hero/list dimensions and aligning the footer within a 1024 px document.

Post-fix evidence: `design-qa-implementation-final.png`, `design-qa-comparison-final.png`, and both focused comparisons show the corrected positions and continuous axis.

### Iteration 2

- [P2] On mobile, stretching one full-height y-axis image enlarged the cleared origin region and stopped the visible line before page end. Fixed by splitting the y-axis into a fixed head and stretchable tail, joined at the x-axis.

Post-fix evidence: `design-qa-mobile-viewport.png`; measured y-axis tail reaches document coordinate 1486 of the 1502 px page, leaving only the intended bottom margin.

### Iteration 3

- [P2] The x-axis, y-axis head, y-axis tail, and integration curve still used separately tuned positions and sizes. Their transparent image padding caused a roughly 2 px desktop origin mismatch and a larger mismatch at the mobile breakpoint; the curve baseline could also separate from the x-axis when width changed.
- Fixed by replacing per-image breakpoint coordinates with one `portal-coordinate-system`, one shared origin, and intrinsic anchor ratios measured from the visible strokes inside each approved asset. Only coordinate-system variables change for mobile art direction; individual elements no longer receive unrelated offsets.
- Added edge-safe mobile dimensions so neither the positive x arrow nor the curve plateau is clipped.

Post-fix evidence: `design-qa-implementation-final.png`, `design-qa-comparison-final.png`, `design-qa-focus-hero.png`, and `design-qa-mobile-viewport.png`. Measurements at 1280 / 1024 / 768 / 681 / 680 / 390 px show the axes and curve meeting within 0.004 px and no horizontal document overflow.

### Iteration 4

- [P2] The original `axis-x.png` still contained a shallow portion of the integration curve and hatching. Rendering it underneath `integral-curve.png` produced the doubled, downward-looking start reported in the focused screenshot.
- [P2] `O`, `x`, and `y` were embedded in axis images whose dimensions changed with viewport width, so the labels were unintentionally resampled.
- [P2] The mobile breakpoint reduced the curve from 374 px to 150 px high, creating an abrupt height change between 681 px and 680 px.
- Fixed by showing only the two-pixel source stroke from `axis-x.png`, then displaying its original arrow, `O`, and `x` as fixed-size source crops. The y-axis source now stays at its native 45 × 434 px. The curve's internal baseline at row 367 is aligned to the shared x-axis, and its 374 px height is retained at every width.

Post-fix evidence: the refreshed `design-qa-implementation-final.png`, `design-qa-comparison-final.png`, `design-qa-focus-hero.png`, and `design-qa-mobile-viewport.png`. Measurements at 1536 / 1024 / 768 / 681 / 680 / 390 px confirm invariant label dimensions, invariant curve height, baseline alignment within 0.002 px, and no horizontal overflow.

### Iteration 5

- [P1] At viewports wider than 1536 px, the coordinate plane remained centered inside a 1536 px max-width container while the hero and directory gutters were calculated from the viewport edge. At 1920 px this moved the y-axis to approximately 317 px even though the heading still began at 188 px, causing the axis to cross the heading and app logos.
- Fixed by making the coordinate plane page-wide and introducing shared edge-relative layout tokens. The origin is capped at 124 px, the content gutter is capped at 188 px, and their minimum wide-screen separation is therefore 64 px. The x-axis now uses direct left/right insets instead of a width-dependent translated start point.
- The approved 1536 px and mobile compositions were preserved; no typography, color, copy, asset, or interaction changes were made.

Post-fix evidence: `02-wide-after.jpg`, `07-standard-final.jpg`, and `06-mobile-final.jpg`. Measurements at 3440 / 2560 / 1920 / 1536 / 1024 / 681 / 680 / 390 px confirm that the axis/content separation remains positive, label dimensions and curve height remain invariant, and the curve baseline remains aligned with the x-axis.

## Open questions

None. Cross-app CTA destinations were verified as href contracts; their sibling applications are not served by the portal-only development process.

## Follow-up polish

- [P3] The extracted curve’s faint stipple varies by a few pixels at responsive widths because the approved raster source is resampled as one coherent plot layer. No change is required for the current implementation baseline.

## Implementation checklist

- [x] Approved desktop composition implemented.
- [x] Final copy and line-break rule implemented.
- [x] Sticky header and semantic link colors implemented.
- [x] JSON list punctuation and divider structure implemented.
- [x] Desktop and mobile layouts visually verified.
- [x] Intermediate widths and both sides of the 680 px breakpoint verified.
- [x] Axis and curve anchors numerically verified against one shared origin.
- [x] `O` / `x` / `y` source dimensions verified as invariant across all tested widths.
- [x] Curve height verified as 374 px at 681 px, 680 px, and mobile widths.
- [x] Duplicated small-x curve pixels removed from the rendered x-axis layer.
- [x] Wide-screen coordinate plane verified without heading or logo overlap through 3440 px.
- [x] Scroll-to-top interaction and console state verified.

final result: passed
