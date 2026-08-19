# Themed 对外展示路径开放：封面品牌底线 + 兜底封面图 + 字体分流 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现 Themed 对外展示封面开放设计 + 兜底封面图（`themed-fallback`）+ 字体按场景分流，产出物 HTML/PPTX 100% 一致、图无关。

**Architecture:** 三处并行改动——① 数据层 `brand-tokens.json` 加开源字体栈 + 兜底封面路径 token；② 渲染层 `generate.js`（base64 背景 + 校验 + 字体栈选择）与 `cover.js`（新增 `renderThemedFallback`，镜像 red-template 结构）；③ 文档层 `SKILL.md`（封面品牌底线章节 + 字体分流 + 自检）、`pptx-python-guide.md`（兜底封面实现要点）。兜底封面图为浅底位图 → 深色文字 + 彩稿 Logo（禁反白）。

**Tech Stack:** Node.js（generate.js 渲染器）、Pillow（Python，图片白底压平）、chrome-devtools MCP（浏览器实测）、无测试框架（验证靠 node 断言 + grep + 浏览器实测，符合本项目惯例）。

**Spec:** `docs/superpowers/specs/2026-08-18-themed-open-cover-design.md`

## Global Constraints

从 spec/CLAUDE.md 逐条抄录，每个任务的实现都隐含包含本节：

- **图无关**：兜底封面图路径从 token（`themedFallbackCover.path`）读取，换图只替换 PNG 文件，不动渲染代码与规则。
- **封面 Logo 一律彩稿（`logo-group-color`）禁止反白**——无论封面深浅底；深色封面彩稿不可读时调布局（Logo 置浅色区）而非换反白。
- **兜底封面图 v1 暂用稿**，后期可能替换；统一白底压平为 RGB（原图 RGBA 带透明通道，PPTX 全幻灯片背景需确定底色，白底压平后 HTML/PPTX 100% 一致无底色漂移）。
- **字体分流**：工作汇报（`scene: template`）= 微软雅黑栈 `typography.fontFamily`；对外展示（无 `scene`）= 开源栈 `typography.fontFamilyOpenSource`（`"Noto Sans SC", "Source Han Sans SC", sans-serif`，SIL OFL），产出不含微软雅黑。
- **字号契约**：HTML 一律 `pt` 后缀、禁 px、禁 pt↔px 换算、禁凭记忆；从 `typography.sizes.*.template` 逐字读。
- **Logo 安全区零容忍**；图片只允许等比缩放（HTML `background-size:contain` / PPTX `LockAspectRatio=true`）。
- **PPTX 封面文字框必须透明背景**（`FillVisible=false`）。
- **渲染/UI 变更必须在浏览器实测**——窗口缩放、翻页遍历、背景模式切换，只读代码不行。
- **Skill zip 必须自包含**——SKILL.md 引用的每个文件都必须打包；本次 19 → 20 文件（新增 `cover-themed-fallback.png`）。

---

### Task 0: 兜底封面图入库（白底压平 → `assets/cover-themed-fallback.png`）

**Files:**
- Create: `测试记录/make-fallback-cover.py`
- Create: `assets/cover-themed-fallback.png`
- Source: `视觉参考/background-red-themed_v1.png`（用户提供，v1 暂用稿）

**Interfaces:**
- Produces: `assets/cover-themed-fallback.png`（1920×1080，RGB，无 alpha）——Task 1 的 `themedFallbackCover.path` 引用它，Task 2 渲染时嵌入。

- [ ] **Step 1: 写压平脚本**

创建 `测试记录/make-fallback-cover.py`（放 `测试记录/` 而非根目录，避免污染 zip 打包）：

```python
# 测试记录/make-fallback-cover.py — 兜底封面图入库：白底压平为 RGB，contain 适配 1920×1080
from PIL import Image

SRC = r'视觉参考/background-red-themed_v1.png'
OUT = r'assets/cover-themed-fallback.png'
W, H = 1920, 1080

src = Image.open(SRC)
print('src:', src.size, src.mode)

# 白底压平（原图 RGBA，PPTX 全幻灯片背景需确定底色；白底保证 HTML/PPTX 一致）
if src.mode == 'RGBA':
    bg = Image.new('RGBA', src.size, (255, 255, 255, 255))
    out = Image.alpha_composite(bg, src).convert('RGB')
else:
    out = src.convert('RGB')

# contain 适配画布（与画布同比例 1920×1080，不裁切不变形）
w, h = out.size
scale = min(W / w, H / h)
nw, nh = round(w * scale), round(h * scale)
out = out.resize((nw, nh), Image.LANCZOS)
canvas = Image.new('RGB', (W, H), (255, 255, 255))
canvas.paste(out, ((W - nw) // 2, (H - nh) // 2))
canvas.save(OUT)
print('out:', canvas.size, canvas.mode)
assert canvas.size == (W, H)
assert canvas.mode == 'RGB'
print('OK ->', OUT)
```

- [ ] **Step 2: 运行并验证**

Run: `python 测试记录/make-fallback-cover.py`
Expected: 打印 `src: (1920, 1080) RGBA` 与 `out: (1920, 1080) RGB`，末尾 `OK -> assets/cover-themed-fallback.png`，无异常。

- [ ] **Step 3: 提交**

```bash
git add assets/cover-themed-fallback.png 测试记录/make-fallback-cover.py
git commit -m "feat: 兜底封面图入库 — cover-themed-fallback.png（白底压平 RGB 1920×1080，v1 暂用稿）"
```

---

### Task 1: brand-tokens.json — 开源字体栈 + 兜底封面路径 token

**Files:**
- Modify: `brand-tokens.json`（`typography` 段、`redTemplateCover` 之后）

**Interfaces:**
- Produces: `typography.fontFamilyOpenSource`（string，开源栈）→ Task 2 字体栈选择、Task 5 SKILL.md 引用。
- Produces: `themedFallbackCover.path`（string）→ Task 2 base64 嵌入、Task 5 SKILL.md 引用。

- [ ] **Step 1: 在 `typography` 段加 `fontFamilyOpenSource`**

在 `brand-tokens.json` 的 `"typography"` 对象里、`"fontFamily"` 行后新增一行：

```json
    "fontFamily": "\"微软雅黑\", \"Microsoft YaHei\", \"Noto Sans SC\", \"Source Han Sans SC\", sans-serif",
    "fontFamilyOpenSource": "\"Noto Sans SC\", \"Source Han Sans SC\", sans-serif",
```

- [ ] **Step 2: 在 `redTemplateCover` 之后新增 `themedFallbackCover`**

`redTemplateCover` 对象结束后（`}` 后、`hardRules` 前）插入：

```json
  "themedFallbackCover": {
    "path": "assets/cover-themed-fallback.png",
    "note": "对外展示兜底封面（Themed）：浅蓝灰底 + 右侧蓝色几何，左 ~40% 干净浅色区（1920×1080，v1 暂用稿、后期可换——图无关，换图只动 PNG 不动代码与规则）。触发：cover.background=themed-fallback（无设计能力/严格按模板/agent 判定无法定制）。HTML 以 base64 全屏背景 + 文字叠加；PPTX 以全幻灯片背景 + 文字框叠加。浅底 → 深色文字（dark/gray）；封面 Logo 一律彩稿 logo-color-img 禁止反白。"
  },
```

- [ ] **Step 3: JSON 合法性与键存在断言**

Run:
```bash
node -e "const t=require('./brand-tokens.json'); if(!t.typography.fontFamilyOpenSource) throw new Error('fontFamilyOpenSource missing'); if(!t.themedFallbackCover||!t.themedFallbackCover.path) throw new Error('themedFallbackCover.path missing'); console.log('ok');"
```
Expected: 打印 `ok`，无异常。

- [ ] **Step 4: 提交**

```bash
git add brand-tokens.json
git commit -m "feat: brand-tokens 加开源字体栈 + themedFallbackCover 兜底封面 token"
```

---

### Task 2: generate.js — 兜底封面 base64 背景 + 校验特例 + 字体栈分流

**Files:**
- Modify: `generate.js`（第 18-68 行校验区、第 108 行 logoBase64 区、第 125-136 行 buildHtml 传参、第 142-156 行 buildHtml 字体、第 175 行 CSS class）

**Interfaces:**
- Consumes: `tokens.themedFallbackCover.path`（Task 1）、`tokens.typography.fontFamilyOpenSource`（Task 1）。
- Produces: `.themed-fallback-bg` CSS class（全屏 `center/contain` 背景）→ Task 3 `renderThemedFallback` 使用。
- Produces: 按 `scene` 分流的 `fontFamily`（buildHtml 参数）——全 HTML 正文字体栈。

- [ ] **Step 1: 校验特例允许 `themed-fallback`**

把 generate.js 第 60-63 行的 cover 校验分支改为允许两个位图特例：

```js
  if (t === 'cover') {
    if (slide.background && slide.background !== 'red-template' && slide.background !== 'themed-fallback' && !resolvedBg.cover[slide.background]) {
      console.error('Slide ' + k + ' (' + t + '): invalid background "' + slide.background + '". Must be one of: ' + Object.keys(resolvedBg.cover).join(', ') + ', red-template, themed-fallback');
      process.exit(1);
    }
  }
```

- [ ] **Step 2: 兜底封面 base64 变量**

在 generate.js 第 108 行 `redTemplateBgB64` 之后加一行：

```js
const themedFallbackBgB64 = (tokens.themedFallbackCover && tokens.themedFallbackCover.path) ? logoBase64(tokens.themedFallbackCover.path) : '';
```

- [ ] **Step 3: 字体栈按场景分流**

在 generate.js 第 123 行 `fileId` 计算之后、buildHtml 调用之前，计算字体栈并传入：

```js
const fontFamily = (pages.scene === 'template') ? tokens.typography.fontFamily : (tokens.typography.fontFamilyOpenSource || tokens.typography.fontFamily);
```

在 buildHtml 调用（第 125-135 行）的 opts 里加 `fontFamily: fontFamily`：

```js
const html = buildHtml({
  slides: slideHtmlArray.join('\n'),
  tokens: tokens,
  colorScheme: pages.colorScheme,
  pageTitle: pageTitle,
  fileId: fileId,
  logoColorB64: logoColorB64,
  logoWhiteB64: logoWhiteB64,
  sloganB64: sloganB64,
  redTemplateBgB64: redTemplateBgB64,
  themedFallbackBgB64: themedFallbackBgB64,
  fontFamily: fontFamily
});
```

- [ ] **Step 4: buildHtml 使用 opts 的字体栈 + 兜底背景 class**

把 generate.js 第 156 行的 `font-family:' + t.fontFamily + '` 改为读 opts：

```js
'html, body { width:100%; height:100%; margin:0; overflow:hidden; background:#FFFFFF; font-family:' + opts.fontFamily + '; }\n' +
```

在第 175 行 `.red-template-bg` 之后加兜底封面背景 class：

```js
'.red-template-bg { background: url(' + opts.redTemplateBgB64 + ') no-repeat center/contain; }\n' +
'.themed-fallback-bg { background: url(' + opts.themedFallbackBgB64 + ') no-repeat center/contain; }\n' +
```

- [ ] **Step 5: 渲染两个测试 deck 验证（deck 内容见 Task 6 Step 1，若尚未建则先建）**

Run（需先有 `测试记录/test-themed-fallback.json` 与 `测试记录/test-report-cover.json`，见 Task 6 Step 1）：
```bash
cd "G:\AI vibe coding\Claude Code\Claude Code\263viForAgent"
node generate.js 测试记录/test-themed-fallback.json
node generate.js 测试记录/test-report-cover.json
grep -c "themed-fallback-bg" 测试记录/test-themed-fallback.html
grep -c "Noto Sans SC" 测试记录/test-themed-fallback.html
grep -c "微软雅黑" 测试记录/test-themed-fallback.html || true
grep -c "微软雅黑" 测试记录/test-report-cover.html
```
Expected: 两个渲染命令均打印 `Generated: ... (N slides)`；themed 文件含 `.themed-fallback-bg`（≥1）与 `Noto Sans SC`（≥1）、**不含** `微软雅黑`（grep 退出码非 0）；template 文件含 `微软雅黑`（≥1）。

- [ ] **Step 6: 提交**

```bash
git add generate.js
git commit -m "feat: generate.js 支持 themed-fallback 兜底封面背景 + 字体栈按 scene 分流"
```

---

### Task 3: renderer/slides/cover.js — `renderThemedFallback` 渲染器

**Files:**
- Modify: `renderer/slides/cover.js`（第 2-13 行 `renderSlide` 分发、新增 `renderThemedFallback` 函数）

**Interfaces:**
- Consumes: `.themed-fallback-bg` CSS class（Task 2）、`coverLogoBlock`（已有）、`tokens.typography.sizes.*.template`（已有）。
- Produces: `renderThemedFallback(slide, tokens, pages, index, c)`——Themed 封面 `background === 'themed-fallback'` 时被 `renderSlide` 调用。

- [ ] **Step 1: 分发——Themed 分支识别兜底封面**

在 `renderSlide` 的 Themed 分支（第 12 行 `return renderThemed(...)`）前插入：

```js
  if (slide.background === 'themed-fallback') {
    return renderThemedFallback(slide, tokens, pages, index, c);
  }
  return renderThemed(slide, tokens, pages, index, c, resolvedBg);
```

- [ ] **Step 2: 新增 `renderThemedFallback` 函数**

在 `renderRedTemplate` 函数结束（第 119 行 `}`）之后、`renderThemed` 注释之前，新增（镜像 red-template 结构，差异：背景 class、**彩稿 Logo 禁反白**、浅底深色文字）：

```js
// === Themed fallback cover: external presentation — 浅底位图 bg，彩稿 Logo（禁反白），左侧深色文字 ===
function renderThemedFallback(slide, tokens, pages, index, c) {
  var html = '<div class="slide-page" id="s' + index + '" style="position:relative; overflow:hidden;">\n';

  // full-bleed bitmap background（base64 via .themed-fallback-bg in generate.js）— 图无关，路径从 token 读
  html += '<div class="themed-fallback-bg" style="position:absolute;top:0;left:0;width:100%;height:100%;"></div>\n';

  // 封面 Logo — 一律彩稿 logo-color-img（禁止反白），浅底不切换反白
  html += coverLogoBlock(tokens, 'logo-color-img', 3);

  // 文字块 — 左侧垂直居中（left:7%，max-width:50%）；浅底 → 深色文字（dark/gray）
  html += '<div style="position:absolute;top:0;left:7%;max-width:50%;height:100%;display:flex;flex-direction:column;justify-content:center;z-index:2;">\n';

  // 标题 — 不折行（white-space:nowrap），agent 以 \n 手动分行（≤20 字符/行）
  var titleLines = esc(slide.title).replace(/\n/g, '<br>');
  var titleMargin = slide.subtitle ? 16 : 32;
  html += '<h1 style="font-size:' + tokens.typography.sizes.coverTitle.template + ';font-weight:bold;color:' + c.dark + ';letter-spacing:2px;margin:0 0 ' + titleMargin + 'px 0;line-height:1.3;white-space:nowrap;">' + titleLines + '</h1>\n';

  // 副标题 — 独立一行，30pt，不加粗
  if (slide.subtitle) {
    html += '<div style="font-size:' + tokens.typography.sizes.subtitle.template + ';color:' + c.gray + ';line-height:1.5;margin-bottom:32px;white-space:nowrap;">' + esc(slide.subtitle) + '</div>\n';
  }

  // meta（汇报人/部门/日期）— 单独一行，红色圆点分隔；字号小于副标题
  if (slide.presenter || slide.department || slide.date) {
    var meta = [];
    if (slide.presenter) { meta.push('汇报人：' + esc(slide.presenter)); }
    if (slide.department) { meta.push(esc(slide.department)); }
    if (slide.date) { meta.push(esc(slide.date)); }
    html += '<div style="font-size:' + tokens.typography.sizes.body.template + ';color:' + c.gray + ';line-height:1.5;white-space:nowrap;">\n';
    for (var m = 0; m < meta.length; m++) {
      if (m > 0) { html += '<span style="color:' + c.primary + ';opacity:0.5;margin:0 12px;">·</span>'; }
      html += '<span>' + meta[m] + '</span>';
    }
    html += '</div>\n';
  }

  html += '</div>\n';

  // company name — bottom:6%，浅底 gray
  html += '<div style="position:absolute;bottom:6%;left:7%;font-size:' + tokens.typography.sizes.caption.template + ';color:' + c.gray + ';z-index:2;">\n';
  html += esc(pages.companyName || '二六三网络通信股份有限公司') + '\n';
  html += '</div>\n';

  html += '</div>\n';
  return html;
}
```

- [ ] **Step 3: 重新渲染 themed deck 验证结构**

Run（依赖 Task 2 Step 5 已成功）：
```bash
node generate.js 测试记录/test-themed-fallback.json
grep -o "themed-fallback-bg" 测试记录/test-themed-fallback.html | head -1
grep -o "logo-color-img" 测试记录/test-themed-fallback.html | head -1
grep -o "#2D3847" 测试记录/test-themed-fallback.html | head -1
grep -o "#FFFFFF" 测试记录/test-themed-fallback.html | head -1
```
Expected: 四行均有输出——`.themed-fallback-bg` 存在、`logo-color-img`（彩稿，非 `logo-white-img`）、标题色 `#2D3847`（dark）、`#FFFFFF`（背景兜底图 class 不含反白白色 Logo 引用）。若有 `logo-white-img` 出现在 cover 区域则改回 `logo-color-img`。

- [ ] **Step 4: 提交**

```bash
git add renderer/slides/cover.js
git commit -m "feat: cover.js 新增 renderThemedFallback — 浅底位图 + 彩稿 Logo 禁反白 + 深色文字"
```

---

### Task 4: pptx-python-guide.md — 兜底封面实现要点

**Files:**
- Modify: `.claude/skills/263group-brand-guidelines/pptx-python-guide.md`（第 6 节）

**Interfaces:**
- Consumes: `themedFallbackCover` 语义（Task 1）。
- Produces: 兜底封面 PPTX 实现要点——供「用户坚持代码生成 PPT」路径（4b）按此实现。

- [ ] **Step 1: 更新第 6 节标题与正文**

将第 6 节标题改为：

```markdown
## 6. 封面底图（template-cover-bg / cover-red-template / cover-themed-fallback）
```

在 6 节末尾（`> 顺序必须是：底图 → 文字（后加的在上面）。` 之后）追加：

```markdown
- **对外展示兜底封面（cover-themed-fallback，浅底）**：同法铺全幻灯片背景（内嵌二进制）+ 深色文字框叠加（透明 `FillVisible=false`）+ 左上彩稿 Logo（62pt 正方形，`LockAspectRatio=true`）。**封面 Logo 一律彩稿禁止反白**（浅底不用反白，深色封面彩稿不可读时调布局）。字号用 PPTX 列：封面标题 43pt、副标题 20pt、汇报信息 18pt、公司全称 14pt。
```

- [ ] **Step 2: 校验**

Run: `grep -c "cover-themed-fallback" .claude/skills/263group-brand-guidelines/pptx-python-guide.md`
Expected: 输出 `1`。

- [ ] **Step 3: 提交**

```bash
git add .claude/skills/263group-brand-guidelines/pptx-python-guide.md
git commit -m "docs: pptx-python-guide 补兜底封面实现要点（浅底全屏背景 + 深字 + 彩稿 Logo）"
```

---

### Task 5: SKILL.md — 对外展示封面品牌底线章节 + 字体分流 + 封面选项 + 自检

**Files:**
- Modify: `.claude/skills/263group-brand-guidelines/SKILL.md`
  - 「工作汇报红色封面」章节之后新增「对外展示封面（Themed）」章节（约第 239 行后）
  - 「封面双模式」章节（第 246-251 行）
  - 「封面二选一使用」注释（第 215 行「使用时」段）
  - 「字体」章节（第 345-363 行）
  - 「生成前自检」清单（第 465-474 行）
  - 「Brand Data Contract」示例（第 515-525 行）

**Interfaces:**
- Consumes: `typography.fontFamilyOpenSource`、`themedFallbackCover`（Task 1）。
- Produces: 唯一真相源规则——设计 skill 与 agent 的封面底线/字体/兜底触发依据。

- [ ] **Step 1: 新增「对外展示封面（Themed）」章节**

在「工作汇报红色封面（Red Template Cover）」章节结束、`### 封面二进制雨` 之前插入：

```markdown
### 对外展示封面（Themed）

对外展示封面**设计开放**——由设计 skill 自由设计（版式、色板内配色组合、装饰、图形语言、动效、封面信息布局），但**品牌底线不可碰**（自由外的硬地板）：

1. **色板**：只用 `colorSchemes[colorScheme]` 9 色 + `chartPalette` 色阶 7 档 + 语义色（仅图表涨跌）；禁止自造色
2. **Logo**：封面必须带 263 品牌标识（PNG Logo 或 ASCII 图形）；Logo 安全区零容忍（左上角，`layout.coverLogo` 读取位置/尺寸）；**封面 Logo 一律彩稿（`logo-group-color`），禁止反白**——无论封面深浅底。深色封面彩稿不可读时调整布局（Logo 置于浅色区域），而非换反白
3. **公司数据**：不编造（公司名/股票代码/业务/口号）
4. **文字**：禁止纯黑；标题 `dark #2D3847` / 正文 `gray #595959`；字号底线（HTML ≥ 20pt / PPTX ≥ 12pt）
5. **字体**：对外展示用开源栈（`typography.fontFamilyOpenSource`：Noto Sans SC → Source Han Sans SC），禁微软雅黑
6. **结尾页**：固定居中 Logo + slogan（全系统一致，不可协商）
7. **封面信息**：标题/副标题/发布人/日期从 pages.json cover 字段读取，不凭空编造

**兜底封面图（Themed）：** 无设计能力 / 用户选「严格按模板」/ agent 判定无法定制 → 使用固定兜底封面图——`brand-tokens.json` → `themedFallbackCover.path`（`assets/cover-themed-fallback.png`，浅蓝灰底 + 右侧蓝色几何，左 ~40% 干净浅色区）。**v1 暂用稿，后期可能替换——图无关：换图只替换 PNG 文件，不动渲染代码与规则。** 触发：封面 slide `"background": "themed-fallback"`。

**渲染（模式同 red-template：位图底 + 文字叠加，HTML/PPTX 100% 一致）：**
- HTML：base64 全屏背景（`.themed-fallback-bg`，`center/contain`）+ 叠加文字
- PPTX：全幻灯片背景（内嵌二进制）+ 文字框叠加，100% 视觉一致
- 封面元素：彩色 Logo 左上角（`layout.coverLogo`，left:6%/top:8%/125px 正方形）；文字块左侧垂直居中（left:7%，max-width:50%）；标题 `dark` 不折行（`\n` 手动分行，≤20 字符/行）；副标题独立行 `gray`；发布人/部门/日期 `gray` 圆点分隔；公司全称 bottom:6% `gray`

**文字/Logo 深浅判定：** 兜底图是**浅底** → `isDark = false` → 文字 `dark`/`gray`。**Logo 不随深浅切换，一律彩稿 `logo-color-img`（禁止反白）。**
```

- [ ] **Step 2: 更新「封面双模式」章节的 Themed 行与背景选项**

把第 249-251 行改为：

```markdown
- **Themed（对外展示）**：设计 skill 自由设计（品牌底线见「对外展示封面（Themed）」）；无设计能力/严格按模板 → 兜底封面图（`"background": "themed-fallback"`）
- 封面背景选项（Themed）：primary-gradient / primary-solid / dark-solid / white / themed-fallback（兜底封面图）
- 封面背景选项（Template）：省略（ASCII） / red-template（红色位图）
```

- [ ] **Step 3: 修正第 215 行「使用时」段的过时描述**

把「不设置或设置为其他值时使用 Themed 封面（红底渐变 + 左上角 Logo）。」改为：

```markdown
不设置或设置为其他值时使用 Themed 封面（设计 skill 自由设计；无设计能力/严格按模板时渲染器用兜底封面图 `themed-fallback`）。
```

- [ ] **Step 4: 字体章节按场景分流**

在「字体」章节「**字体回退链：**」段落之后追加：

```markdown
**字体按场景分流（对外展示路径开放决策，2026-08-18）：**
- **工作汇报（Template/内部）**：微软雅黑栈（`typography.fontFamily`）——内部自用，渲染最稳
- **对外展示（Themed/外部）**：开源栈（`typography.fontFamilyOpenSource`）——`"Noto Sans SC", "Source Han Sans SC", sans-serif`，**禁微软雅黑**（闭源，对外分发/嵌入有许可风险；Noto/Source Han 为 SIL OFL 开源，任何使用无风险）
```

把同段「**字体回退链**」首句的适用范围限定为工作汇报栈（改为）：

```markdown
**字体回退链（工作汇报栈）：** 微软雅黑 → Noto Sans SC → Source Han Sans SC → sans-serif。如果运行环境无微软雅黑（Mac/Linux/纯 Web），使用 **Noto Sans SC**（开源无版权，SIL Open Font License）。CSS font-family 完整栈从 `brand-tokens.json` → `typography.fontFamily` 读取。
```

- [ ] **Step 5: 生成前自检补字体栈 + 兜底封面核对**

在「生成前自检（HTML & PPTX）」清单末尾追加两项：

```markdown
- [ ] 字体栈按场景分流：工作汇报 = 微软雅黑栈（`typography.fontFamily`）；对外展示 = 开源栈（`typography.fontFamilyOpenSource`），对外展示产出**不含微软雅黑**
- [ ] 对外展示封面：无设计能力/严格按模板 → 兜底封面图 `themed-fallback`；封面 Logo 一律彩稿 `logo-color-img`（禁止反白），深浅底皆如此
```

- [ ] **Step 6: Brand Data Contract 示例补字体栈场景说明**

把契约示例里的 `typography` 行改为：

```json
  "typography": { "fontFamily": "<工作汇报: typography.fontFamily 微软雅黑栈 / 对外展示: typography.fontFamilyOpenSource 开源栈>", "html": { "body": 26 }, "pptx": { "body": 18 } },
```

- [ ] **Step 7: 校验（grep 断言新章节与关键词在位）**

Run:
```bash
grep -c "对外展示封面（Themed）" .claude/skills/263group-brand-guidelines/SKILL.md
grep -c "themed-fallback" .claude/skills/263group-brand-guidelines/SKILL.md
grep -c "禁止反白" .claude/skills/263group-brand-guidelines/SKILL.md
grep -c "fontFamilyOpenSource" .claude/skills/263group-brand-guidelines/SKILL.md
```
Expected: 分别 ≥1 / ≥4 / ≥1 / ≥2。

- [ ] **Step 8: 提交**

```bash
git add .claude/skills/263group-brand-guidelines/SKILL.md
git commit -m "docs: SKILL.md 对外展示封面品牌底线章节 + 字体分流 + 兜底图选项 + 自检补项"
```

---

### Task 6: 端到端浏览器实测（兜底封面 + 字体分流 + 回归）

**Files:**
- Create: `测试记录/test-themed-fallback.json`、`测试记录/test-report-cover.json`（测试输入；生成的 `.html` 为测试产物，不入 git）
- Consumes: Task 0-3 全部产出。

**Interfaces:**
- Produces: 浏览器实测通过证据（截图/控制台无错）——CLAUDE.md「渲染/UI 变更必须浏览器实测」的硬门禁。

- [ ] **Step 1: 建测试输入 deck（对 deck 的字段：themed 版封面含 `themed-fallback` + 完整内容页 + 结尾页；template 版含 `red-template`）**

`测试记录/test-themed-fallback.json`：
```json
{
  "colorScheme": "group-red",
  "logoSet": "group",
  "companyName": "二六三网络通信股份有限公司",
  "slides": [
    {
      "type": "cover",
      "background": "themed-fallback",
      "title": "263 全球网络通信解决方案",
      "subtitle": "连接全球 · 服务未来",
      "presenter": "张三",
      "department": "解决方案部",
      "date": "2026-08-19"
    },
    {
      "type": "section",
      "sectionNumber": "01",
      "title": "全球网络布局"
    },
    {
      "type": "content",
      "title": "产品体系",
      "blocks": [
        { "heading": "环球专线", "body": "IPLC/IEPL 专线，海缆 APG/PEACE/JUPITER。" },
        { "heading": "国际专网", "body": "SR-MPLS / SD-WAN / SASE。" }
      ]
    },
    { "type": "end" }
  ]
}
```

`测试记录/test-report-cover.json`（回归：工作汇报 red-template 不受影响，且字体栈=微软雅黑）：
```json
{
  "colorScheme": "group-red",
  "logoSet": "group",
  "scene": "template",
  "companyName": "二六三网络通信股份有限公司",
  "slides": [
    {
      "type": "cover",
      "background": "red-template",
      "title": "Q3 季度工作汇报",
      "presenter": "郭悦",
      "department": "市场部",
      "date": "2026-08-19"
    },
    {
      "type": "content",
      "title": "核心指标",
      "blocks": [ { "heading": "营收", "body": "同比增长 12%。" } ]
    },
    { "type": "end" }
  ]
}
```

- [ ] **Step 2: 渲染两个 deck 并做 HTML 级断言**

Run:
```bash
node generate.js 测试记录/test-themed-fallback.json
node generate.js 测试记录/test-report-cover.json
echo "--- themed: 含 .themed-fallback-bg / 彩稿 / 深字 / 开源栈 / 无微软雅黑 ---"
grep -c "themed-fallback-bg" 测试记录/test-themed-fallback.html
grep -c "logo-white-img" 测试记录/test-themed-fallback.html || true
grep -c "Noto Sans SC" 测试记录/test-themed-fallback.html
grep -c "微软雅黑" 测试记录/test-themed-fallback.html || true
echo "--- template: 含微软雅黑 / 红色位图 class ---"
grep -c "微软雅黑" 测试记录/test-report-cover.html
grep -c "red-template-bg" 测试记录/test-report-cover.html
```
Expected: themed 文件 `.themed-fallback-bg` ≥1、`logo-white-img` 为 0（禁反白）、`Noto Sans SC` ≥1、`微软雅黑` 为 0；template 文件 `微软雅黑` ≥1、`red-template-bg` ≥1。

- [ ] **Step 3: 浏览器实测 Themed 兜底封面（chrome-devtools）**

用 chrome-devtools MCP：
1. `new_page` 打开 `file:///G:/AI vibe coding/Claude Code/Claude Code/263viForAgent/测试记录/test-themed-fallback.html`
2. `take_snapshot` 确认封面在显示；`take_screenshot` 存档——人工核对：浅蓝灰底位图可见、左上角**彩稿** Logo、标题深色 `dark`、副标题/meta `gray`
3. `emulate` 视口到 `1366x768` 再 `1280x720`，`navigate_page reload` 后 `take_screenshot`——确认 `--s` 缩放正确、布局不错位（窗口缩放实测）
4. `press_key` `ArrowRight` 逐页翻到最后一页，再 `ArrowLeft` 回封面——无 JS 报错（翻页遍历实测）
5. `list_console_messages`——确认无 error

Expected: 截图可见兜底封面（浅底位图 + 彩稿 Logo + 深色文字）；缩放下布局不变形；翻页遍历无异常；控制台无 error。

- [ ] **Step 4: 浏览器实测回归（工作汇报 red-template + ASCII 封面）**

同样用 chrome-devtools：
1. `new_page` 打开 `file:///G:/AI vibe coding/Claude Code/Claude Code/263viForAgent/测试记录/test-report-cover.html`
2. `take_screenshot`——确认 red-template 红色位图封面 + 左上彩稿 Logo 正常渲染（回归不受影响）
3. 再建一个无 `background` 的 template 封面 deck（ASCII 默认）或直接临时改 `test-report-cover.json` 的 `background` 删掉，重渲染后 `take_screenshot`——确认 ASCII 封面 + 字体仍为微软雅黑

Expected: red-template 与 ASCII 封面均正常渲染；两版正文均为微软雅黑。

- [ ] **Step 5: 提交测试输入（供后续复测复用）**

```bash
git add 测试记录/test-themed-fallback.json 测试记录/test-report-cover.json
git commit -m "test: Themed 兜底封面 + 工作汇报 red-template 端到端测试输入"
```

---

### Task 7: 实现代码 review 门禁（提交前）

**Files:**
- Review: Task 0-5 产出 diff（`brand-tokens.json`、`generate.js`、`renderer/slides/cover.js`、`.claude/skills/263group-brand-guidelines/SKILL.md`、`.claude/skills/263group-brand-guidelines/pptx-python-guide.md`、`assets/cover-themed-fallback.png`）
- Evidence: Task 6 浏览器实测截图/控制台

**Interfaces:**
- Consumes: Task 0-6 全部产出。
- Produces: 通过门禁——实现代码收尾前的最终 review，防止违反 spec/关键约定。

- [ ] **Step 1: 逐个文件 review 实现 diff**

Run: `git log --oneline -10`（核对 Tasks 0-6 逐任务提交到位），然后对照 spec `docs/superpowers/specs/2026-08-18-themed-open-cover-design.md` 审以下文件：
- `brand-tokens.json`：`fontFamilyOpenSource` = `"Noto Sans SC", "Source Han Sans SC", sans-serif`；`themedFallbackCover.path` = `assets/cover-themed-fallback.png`；JSON 合法
- `generate.js`：cover 校验允许 `themed-fallback`（与 `red-template` 并列）；`.themed-fallback-bg` 用 `themedFallbackBgB64`（**不是** `redTemplateBgB64`）；body `font-family` 用 `opts.fontFamily`（按 `scene` 分流，方案 A）
- `cover.js`：Themed 分支先判 `themed-fallback`；`renderThemedFallback` 用 `logo-color-img`（**彩稿禁反白**）、文字 `dark`/`gray`（浅底）、字号全从 `tokens.typography.sizes.*.template` 读且 `pt` 后缀
- `SKILL.md`：品牌底线 7 条完整；兜底触发写 `"background": "themed-fallback"`；字体分流双栈；生成前自检含字体栈 + 兜底图项
- `pptx-python-guide.md`：第 6 节含 `cover-themed-fallback`、彩稿 Logo 禁反白、透明文字框 `FillVisible=false`
- `assets/cover-themed-fallback.png`：1920×1080、RGB、白底压平

- [ ] **Step 2: 对照 CLAUDE.md「关键约定」逐条核对**

Logo 安全区零容忍（`layout.coverLogo`）、字号契约（pt 后缀/禁换算/从 token 读）、禁纯黑、图片等比 `contain`、封面 Logo 彩稿禁反白、图无关（路径从 token 读）。发现违反即修复。

- [ ] **Step 3: 确认浏览器实测证据齐全（Task 6）**

确认 Task 6 已产出：themed deck 截图（浅底位图 + 彩稿 Logo + 深字）、缩放/翻页/控制台无错记录、red-template 与 ASCII 封面回归截图。**缺证据则回 Task 6 补测——禁止以「只读代码」通过**（CLAUDE.md「Code review：渲染器/UI 变更必须在浏览器实测」）。

- [ ] **Step 4: 修复 review 发现的问题（如有）**

修复后对受影响部分重新浏览器实测，再按 Task 2-5 的提交规范补 commit。

- [ ] **Step 5: 门禁通过**

全部 review 项勾完、无未修问题 → 进入 Task 8。

---

### Task 8: Skill zip 重建（19 → 20）+ 关联文档/记忆四份同步

**Files:**
- Modify: `CLAUDE.md`（zip 清单 + bullet）、`Design-Decision.md`（状态行）、`开发日志.md`（追加9）
- Modify: memory（`project-263-ppt-vi-system.md` + `MEMORY.md`，**git 外，不提交**）
- Create: `测试记录/263-vi-skill-0819.zip` + `测试记录/263-vi-skill-0819/`

**Interfaces:**
- Consumes: Task 0-7 全部产出。
- Produces: spec「同步面」列的四份关联文档/记忆与实现一致——**CLAUDE.md / Design-Decision.md / 开发日志.md / memory**，一次收尾。

- [ ] **Step 1: 更新 CLAUDE.md「Skill zip 打包」清单（19 → 20）**

把第 48 行改为：

```markdown
zip 从**根目录**按 20 文件清单构建（SKILL.md + pptx-python-guide.md + assets/*.png（含 `cover-themed-fallback.png`）+ renderer/slides/*.js + brand-tokens.json + company-data.json + generate.js），存入 `测试记录/263-vi-skill-MMDD.zip`。zip 必须自包含——SKILL.md 引用的每个文件都必须打包。缺文件会导致外部 AI 工具报错。
```

- [ ] **Step 2: 更新 CLAUDE.md「Skill zip」bullet（19 → 20）**

把第 84 行 bullet 改为：

```markdown
- **Skill zip**：`测试记录/263-vi-skill-MMDD.zip`，20 文件（含 `cover-red-template.png`、`cover-themed-fallback.png`、`template-cover-bg.png`、`pptx-python-guide.md`）。`brand-tokens.json` v2.5（含 chartPalette 图表色板——唯一 7 档红尺度 + 语义色红涨绿跌 + 两灰唯一命名 + slogan 原生尺寸/宽高比 + 开源字体栈 + themedFallbackCover）。
```

- [ ] **Step 3: 更新 Design-Decision.md 决策记录状态**

把「Themed 对外展示路径开放决策记录」末尾的状态行改为：

```markdown
**状态：** 已实现（2026-08-19）——兜底封面图入库 + 渲染器支持 themed-fallback + 字体按场景分流 + zip 19→20，浏览器实测通过
```

- [ ] **Step 4: 更新 开发日志.md 追加9**

顶部「更新」行改为（末尾追加实现完成）：

```markdown
**更新：2026-08-19 (Themed 对外展示路径开放实现：封面品牌底线 + 兜底封面图 themed-fallback + 字体按场景分流 + zip 19→20)**
```

在「追加8」之后、`## 2026-08-18（追加7）` 之前插入：

```markdown
## 2026-08-19（追加9）Themed 对外展示路径开放：实现完成

### 实现内容
- **兜底封面图入库**：`assets/cover-themed-fallback.png`（源 `视觉参考/background-red-themed_v1.png`，白底压平 RGB 1920×1080，v1 暂用稿——图无关，换图只动 PNG）
- **数据层**：`brand-tokens.json` 加 `typography.fontFamilyOpenSource`（开源栈）+ `themedFallbackCover`（path/note）
- **渲染层**：`generate.js` 支持 `.themed-fallback-bg` base64 背景 + cover 背景校验特例 + 字体栈按 `scene` 分流；`cover.js` 新增 `renderThemedFallback`（镜像 red-template，浅底深字 + 彩稿 Logo 禁反白）
- **文档层**：SKILL.md「对外展示封面（Themed）」章节（品牌底线 7 条 + 兜底触发 + 深浅规则）+ 字体分流 + 封面选项 + 生成前自检补项；pptx-python-guide.md 补兜底封面要点；CLAUDE.md zip 19→20
- **zip**：重建 `测试记录/263-vi-skill-0819.zip`（20 文件，含 cover-themed-fallback.png）

### 测试
- HTML 级断言：themed deck 含 `.themed-fallback-bg`/彩稿/Noto Sans SC/无微软雅黑；template deck 含微软雅黑/red-template-bg（回归）
- 浏览器实测：兜底封面渲染（浅底位图 + 彩稿 Logo + 深色文字）、窗口缩放、翻页遍历、控制台无错；red-template 与 ASCII 封面回归正常
- Code review 门禁（Task 7）：spec/关键约定逐条核对通过

### 下一步
- [ ] Trae/跨工具复测：对外展示封面自由度 + 兜底触发 + 字体栈切换 + 自检门禁
- [ ] 兜底封面图替换正式稿后仅替换 PNG（图无关验证）
- [ ] 商务蓝 official 色值确认后按同法补 business-blue 字体/兜底路径
```

- [ ] **Step 5: 更新 memory（git 外，不提交）**

更新 `project-263-ppt-vi-system.md`：当前进度改为「**已实现（2026-08-19）**」——兜底封面图入库 + 渲染器 themed-fallback + 字体按场景分流 + zip 19→20 全落地，浏览器实测 + code review 通过；「实现后需同步」清单清零。同步 `MEMORY.md` 索引钩子（Themed 状态 → 已实现，日期 2026-08-19）。

- [ ] **Step 6: 重建 zip（20 文件）**

从根目录打包（与 0818 同构，新增 cover-themed-fallback.png）：
```bash
cd "G:\AI vibe coding\Claude Code\Claude Code\263viForAgent"
rm -rf 测试记录/263-vi-skill-0819
mkdir -p 测试记录/263-vi-skill-0819
cp -r .claude/skills/263group-brand-guidelines/SKILL.md .claude/skills/263group-brand-guidelines/pptx-python-guide.md 测试记录/263-vi-skill-0819/
cp -r assets 测试记录/263-vi-skill-0819/
cp -r renderer 测试记录/263-vi-skill-0819/
cp brand-tokens.json company-data.json generate.js 测试记录/263-vi-skill-0819/
cd 测试记录/263-vi-skill-0819
python -c "
import os, zipfile
names = []
for root, dirs, files in os.walk('.'):
    for f in files:
        names.append(os.path.relpath(os.path.join(root, f), '.'))
names.sort()
with zipfile.ZipFile('../263-vi-skill-0819.zip', 'w', zipfile.ZIP_DEFLATED) as z:
    for n in names:
        z.write(n)
print('files:', len(names))
print('\n'.join(names))
"
```

- [ ] **Step 7: 校验 zip 自包含与内容**

Run:
```bash
python -c "
import zipfile
z = zipfile.ZipFile('测试记录/263-vi-skill-0819.zip')
names = z.namelist()
print('count:', len(names))
assert len(names) == 20, 'expected 20 files, got ' + str(len(names))
assert 'assets/cover-themed-fallback.png' in names
assert 'assets/cover-red-template.png' in names
assert 'SKILL.md' in names and 'pptx-python-guide.md' in names
print('all 20 present')
"
```
Expected: `count: 20`、`all 20 present`（无异常）。再抽查 zip 内 `brand-tokens.json` 含 `fontFamilyOpenSource`、`generate.js` 含 `themed-fallback-bg`。

- [ ] **Step 8: 提交（memory 在 git 外，不入 commit）**

```bash
git add CLAUDE.md Design-Decision.md 开发日志.md 测试记录/263-vi-skill-0819.zip 测试记录/263-vi-skill-0819
git commit -m "docs: zip 19→20 文件 + 关联文档四份同步（CLAUDE.md/Design-Decision/开发日志/memory）— Themed 对外展示路径开放实现完成"
```

---

## Self-Review（写完后对照 spec 自查）

- **交付物 1 品牌底线（spec 第 23-38 行）**：→ Task 5 Step 1 章节完整落地（7 条底线 + 兜底图例外 + 图无关）。✓
- **交付物 2 兜底封面图（spec 第 40-54 行）**：入库（Task 0）、token（Task 1）、HTML/PPTX 渲染（Task 2/3/4）、深浅判定与彩稿 Logo（Task 3/5）。✓
- **交付物 3 字体分流（spec 第 56-63 行）**：token（Task 1）、generate.js 按 scene 切换（Task 2）、SKILL.md 场景取栈（Task 5）。✓
- **实现细节（spec 第 65-87 行）**：brand-tokens（Task 1）、generate.js 校验特例 + base64（Task 2）、cover.js renderThemedFallback（Task 3）、pptx-python-guide 第 6 节（Task 4）、SKILL.md 章节/字体/封面选项/自检（Task 5）、zip 19→20（Task 8）。✓
- **同步面（spec 第 89-91 行）**：四份——CLAUDE.md（Task 8 Step 1-2）、Design-Decision.md（Task 8 Step 3）、开发日志.md（Task 8 Step 4）、memory（Task 8 Step 5）。✓
- **测试计划（spec 第 93-98 行）**：浏览器实测（Task 6）、底线核查=自检门禁（Task 5）、字体栈切换（Task 2/6）、实现 code review 门禁（Task 7）、Trae 复测→开发日志下一步（Task 8）。✓
- **占位符扫描**：无 TBD/TODO；每个代码步骤均给出完整实现。
- **类型/键名一致性**：`fontFamilyOpenSource`、`themedFallbackCover`、`.themed-fallback-bg`、`renderThemedFallback`、`"background": "themed-fallback"` 在各任务间拼写一致。
