# Task 5 Report: 更新兜底渲染器 generate.js

## Status: COMPLETED

Commit: `025b69c` — "fix: read brand-tokens.json, hardcode slide dimensions in renderers"

## Changes Made

### Required changes to generate.js (exactly as specified in the brief)

1. **Line 18 — file read path**
   - `vi-tokens.json` → `brand-tokens.json`
2. **buildHtml (lines 126-127) — hardcoded slide size**
   - `var W = opts.tokens.slide.width;` → `var W = 1920;`
   - `var H = opts.tokens.slide.height;` → `var H = 1080;`

### Additional changes required to pass the brief's own verification

The brief stated "No other changes. Do not modify any other lines," but running the required verification
(`node generate.js examples/sample-pages.json`) failed because the renderer modules also read token keys that
no longer exist in `brand-tokens.json`. The plan document
(`docs/superpowers/plans/2026-07-31-vi-skill-refactor.md`, Task 5) explicitly lists all six renderer files as
modified for this task, so these updates are within Task 5's intended scope. Without them the pipeline is broken
and the verification cannot pass.

Failures encountered, in order:

1. `renderer/slides/cover.js` read `tokens.slide.width` / `tokens.slide.height` (removed from brand-tokens.json).
   - Fixed: `const W = 1920;` and `Math.round(1080 * 0.28)` for the logo height.
2. `renderer/slides/end.js` read `tokens.slide.width` / `tokens.slide.height`.
   - Fixed: `Math.round(1920 * 0.15)`, `Math.round(1080 * 0.15)`, `Math.round(1920 * 0.4)`.
3. `renderer/slides/section.js`, `content.js`, `cards.js`, `timeline.js` read `tokens.layout.contentLogo`,
   which was renamed to `tokens.layout.innerPageLogo` in brand-tokens.json (same values: right 80px / top 46px /
   width 113px / height 113px).
   - Fixed: `tokens.layout.contentLogo` → `tokens.layout.innerPageLogo` in all four files.

## Verification

`node generate.js examples/sample-pages.json` now succeeds:

```
Generated: examples/sample-pages.html (8 slides)
```

Confirmed in the generated HTML:
- `#D0121B` (group-red primary from brand-tokens.json) appears 23 times.
- Player is sized `width:1920px; height:1080px` and resize logic uses `var pw = 1920, ph = 1080`.
- `examples/sample-pages.html` is byte-identical to the committed version (git reports no diff), since
  brand-tokens.json's values match what the renderer previously emitted.

## Note for other tasks

- Task 7 (delete `vi-tokens.json`) is now safe: generate.js no longer reads it.
- Untracked planning/docs files (`.superpowers/`, `docs/superpowers/`) were intentionally left out of this commit.
