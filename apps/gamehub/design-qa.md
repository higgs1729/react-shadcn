# GAMEHUB Design QA — catalogue expansion

## Captures

- DISCOVER: `implementation-gamehub-discover-v2.png` (1265 × 712)
- ALL GAMES: `implementation-gamehub-all-games-v2.png` (1265 × 712)
- NEON TUNNEL wrapper: `implementation-neon-tunnel-v2.png` (1280 × 720)
- Rich background / hero: `implementation-gamehub-background-v4.png`
- Rich background / discovery sections: `implementation-gamehub-background-sections-v4.png`
- Rich background / catalogue: `implementation-gamehub-background-catalog-v4.png`

## Visual checks

- DISCOVER is visibly selected with white, weight 900 text and a fully visible orange indicator.
- ALL GAMES uses the same selected treatment on `/games`.
- ECHO//SHIFT is the main featured game, followed by separate POPULAR GAMES and NEW GAMES sections.
- Catalogue card media uses a 16:9 ratio, wider than the previous 3:2 cards.
- The ECHO//SHIFT source was extended horizontally rather than stretched; final project asset is 1672 × 941.
- NEON TUNNEL uses the existing official preview and original game HTML from `react-shadcn/apps/team-t`.
- Dummy inventory is unambiguously labelled `DUMMY`, `NOT A GAME`, and `NOT PLAYABLE`, has no link, and uses a disabled visual treatment.
- The warm paper surface now combines a 48 px drafting grid, subtle print-fibre lines, low-opacity oversized section words, and orange registration marks.
- DISCOVER uses stronger `POPULAR` and `NEW` background typography; ALL GAMES uses a quieter `CATALOG` treatment to protect search readability.
- Card captions are consistently black with white type; card badges and PLAY pills are absent.
- The featured ECHO//SHIFT copy is mathematically centred in its panel and the orange CTA uses white text.

## Interaction checks

- DISCOVER → ALL GAMES navigation works and updates `aria-current`, font weight, color, and indicator.
- Catalogue search reduces six entries to one result for `NEON`.
- ECHO//SHIFT opens at `/games/echo-shift` and renders the playable game.
- NEON TUNNEL opens through `/games/neon-tunnel`, retains GAMEHUB back navigation, and runs the original game inside the wrapper.
- Browser console remained free of errors through both navigation paths.
- Browser-computed checks confirmed the paper layers, `POPULAR` / `CATALOG` pseudo-content, and registration marks are rendered.

## Engineering checks

- Vinext production build: passed.
- ESLint for all changed application modules: passed.
- Server-render tests: 4 passed, 0 failed.
- A static-file routing collision found during browser QA was fixed by moving the NEON runtime to `/game-runtime/neon-tunnel.html`.

## Image-generation record

- Mode: built-in ImageGen edit.
- Target: the previously generated ECHO//SHIFT artwork.
- Prompt intent: preserve the complete title, tagline, grid, arrows, palette, and scanlines; extend only the left and right canvas into a 16:9 catalogue banner; add no new words, logos, badges, characters, or UI.
- Final workspace asset: `public/game-previews/echo-shift-wide.png`.

## Result

passed
