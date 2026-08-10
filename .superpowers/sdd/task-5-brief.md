# Task 5: 更新兜底渲染器 generate.js

## Requirements

更新 `generate.js` 以读取新的 `brand-tokens.json`，并将 slide 尺寸硬编码为 1920×1080。

## Changes Required

### Change 1: Line 18 — 文件读取路径

```javascript
// OLD:
const tokens = JSON.parse(fs.readFileSync('vi-tokens.json', 'utf-8'));

// NEW:
const tokens = JSON.parse(fs.readFileSync('brand-tokens.json', 'utf-8'));
```

### Change 2: Lines 126-127 — 硬编码 slide 尺寸

In the `buildHtml` function:

```javascript
// OLD:
var W = opts.tokens.slide.width;
var H = opts.tokens.slide.height;

// NEW:
var W = 1920;
var H = 1080;
```

No other changes. Do not modify any other lines.

## Verification

After making changes:

```bash
node generate.js examples/sample-pages.json
```

Expected: Output `examples/sample-pages.html` is generated without errors.

Also verify the generated HTML uses #D0121B (the group-red primary from brand-tokens.json).

## Steps

1. Read generate.js
2. Make the two changes exactly as specified
3. Verify by running generate.js on the existing sample
4. Commit
