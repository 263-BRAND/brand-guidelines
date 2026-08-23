# 移除 ASCII 封面（Phase 1）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 移除工作汇报 ASCII 个性化封面（字符画 + 二进制雨），工作汇报封面唯一为严谨商务风（红色位图封面），取消生成前确认第 5 题，SKILL.md / 数据 / 渲染器 / PPTX 指南 / 资产 / zip 全链路同步。

**Architecture:** 删除 `brand-tokens.json` 的 `coverAscii`/`typography.asciiArt`/`templateCoverBgPptx` → `renderer/slides/cover.js` 删 `renderTemplate`、template 场景一律走 `renderRedTemplate` → `generate.js` 删 ASCII 动画 + 二进制雨 JS → SKILL.md / pptx-python-guide.md 删 ASCII 规则章节与第 5 题交互 → 删 `assets/template-cover-bg.png` → 重建 zip（23 → 22 文件）。

**Tech Stack:** Node.js（generate.js 渲染）、JSON、Markdown（SKILL.md / pptx-python-guide.md）、Python（brand-check-pptx.py / build-skill-zip.py）

**Spec:** 方案见 `G:\AI vibe coding\Trae Work_CN\品牌规范skill功能说明.html` →「合并优化方案（2026-08-23 修订）」第四、七节。token 决策背景见 `测试记录/VI-skill-token优化方案.md`。

## Global Constraints

- 移除 ASCII 后，工作汇报（`scene:"template"`）封面**唯一** = 红色位图封面（`assets/cover-red-template.png`）。
- 生成前确认编号：工作汇报 → 问 **1/2/3**（删第 5 题封面风格）；对外展示 → 问 1/2/3/4 不变。
- 对外展示（Themed）封面品牌标识改为「PNG Logo」（删「或 ASCII 图形」表述）。
- 既有硬规则全部不动：Logo 等比缩放/安全区、封面禁红、结尾页最后、广告法硬门禁、行距、字号、两套字体栈。
- 渲染器/UI 改动必须浏览器实测（窗口缩放、翻页遍历、背景模式切换），只读代码不算验证。
- 每次任务后 git commit；zip 在最终任务重建并校验自包含。
- 对用户的交互措辞仍只能逐字来自 SKILL.md 编号话术（唯一输出源）——本计划删掉的第 5 题话术不得残留任何引用。

---

## 文件结构（改动清单）

| 文件 | 责任 | 改动 |
|------|------|------|
| `brand-tokens.json` | 品牌数据层 | 删 `coverAscii` / `typography.asciiArt` / `templateCoverBgPptx`；`redTemplateCover.note` 措辞更新 |
| `renderer/slides/cover.js` | 封面渲染器 | 删 `renderTemplate`；`renderSlide` template 分支一律 red-template |
| `generate.js` | HTML 渲染器 + 播放壳 | 删 ASCII 动画 JS + 二进制雨 JS/CSS；删 `coverAscii` 引用 |
| `.claude/skills/263group-brand-guidelines/SKILL.md` | Skill 定义（唯一真相源） | 删 ASCII 规则章节 + 第 5 题交互 + 内部词汇表条目 |
| `.claude/skills/263group-brand-guidelines/pptx-python-guide.md` | PPTX 代码生成指南 | 删 §6.5 个性化封面文字叠加 + §6 标题删 template-cover-bg |
| `assets/template-cover-bg.png` | PPTX ASCII 封面静态底图 | 删除文件 |
| `brand-check-pptx.py` | PPTX 合规校验器 | grep 确认无 ASCII/template-cover-bg 引用；如有则清 |
| `测试记录/build-skill-zip.py` | zip 构建 | 无需改（整 assets 目录收集，删文件即自动消失） |

---

## Task 1: brand-tokens.json 清理 ASCII 数据

**Files:**
- Modify: `brand-tokens.json`

**Interfaces:**
- Consumes: 无（首任务）
- Produces: 无 `coverAscii`/`asciiArt`/`templateCoverBgPptx` 键；`redTemplateCover.note` 不再提 ASCII

- [ ] **Step 1: 删除 `coverAscii` 块**（`brand-tokens.json` 末尾，当前含 `"art": "▓▓▓▓▓▒\n..."` 整块 + `color`/`stagger`/`transition`/`slideDistance`/`rule` 键）。删除后确保 JSON 逗号结构正确（前一个键 `templateCoverBgPptx` 后若为最后一个键，删其后逗号）。

- [ ] **Step 2: 删除 `templateCoverBgPptx` 块**（`"path": "assets/template-cover-bg.png"` + `note`）。

- [ ] **Step 3: 删除 `typography.asciiArt` 块**（`brand-tokens.json` 第 46-55 行：`"asciiArt": { "fontFamily": "'Courier New'..." , "exemption": "ASCII 字符画属于装饰图形..." }`）。删除后 `typography` 下 `sizes` → `lineHeight` 直接相邻。

- [ ] **Step 4: 更新 `redTemplateCover.note`**：删「默认仍为 ASCII 字符画封面。」改为「**工作汇报唯一封面**（2026-08-23 移除 ASCII 个性化封面）。」及「触发：硬门禁第 5 题「严谨」」→「触发：`scene:template` 即默认（唯一）」。注：`redTemplateCover.path` 与 `themedFallbackCover.path` 保留不动。

- [ ] **Step 5: 验证 JSON 合法**

Run: `python -c "import json; json.load(open('brand-tokens.json', encoding='utf-8')); print('JSON OK')"`
Expected: `JSON OK`（无 `coverAscii`/`asciiArt`/`templateCoverBgPptx`，无解析错误）

- [ ] **Step 6: Commit**

```bash
git add brand-tokens.json
git commit -m "feat: 移除 ASCII 封面数据 — brand-tokens.json 删 coverAscii/asciiArt/templateCoverBgPptx，redTemplateCover 注为唯一封面"
```

---

## Task 2: renderer/slides/cover.js 删 ASCII 渲染器

**Files:**
- Modify: `renderer/slides/cover.js`

**Interfaces:**
- Consumes: Task 1 后的 `brand-tokens.json`（已无 `coverAscii`）
- Produces: `renderSlide` 对 template 场景只返回 `renderRedTemplate(...)`；无 `renderTemplate`

- [ ] **Step 1: 改写 `renderSlide` 分发逻辑**（`cover.js:2-18`）：把 `isTemplate` 分支从「`red-template` → renderRedTemplate；否则 → renderTemplate」改为「template 场景一律 `renderRedTemplate`」：

```js
function renderSlide(slide, tokens, pages, index, resolvedBg) {
  var c = tokens.colorSchemes[pages.colorScheme];
  var isTemplate = pages.scene === 'template' || slide.type === 'cover-template';
  if (isTemplate) {
    // 工作汇报封面唯一 = 红色位图封面（2026-08-23 移除 ASCII 个性化封面）
    return renderRedTemplate(slide, tokens, pages, index, c);
  }
  // Themed 封面：默认即兜底封面图；禁红色系背景已在 generate.js 校验拦截
  if (slide.background === 'themed-fallback' || !slide.background) {
    return renderThemedFallback(slide, tokens, pages, index, c);
  }
  return renderThemed(slide, tokens, pages, index, c, resolvedBg);
}
```

- [ ] **Step 2: 删除 `renderTemplate` 函数**（`cover.js:20-72` 整块，含注释 `// === Template cover: internal reporting — white bg, ASCII logo, binary rain, centered ===`、binary rain canvas、`tokens.coverAscii` 引用、`.ascii-line` 生成）。保留 `renderRedTemplate` 及以下函数不动。

- [ ] **Step 3: grep 确认无 `coverAscii`/`ascii-line`/`binaryRain`/`renderTemplate` 残留**

Run: `grep -nE "coverAscii|ascii-line|binaryRain|renderTemplate" renderer/slides/cover.js`
Expected: 无输出（空）

- [ ] **Step 4: Commit**

```bash
git add renderer/slides/cover.js
git commit -m "feat: 移除 ASCII 封面渲染 — cover.js 删 renderTemplate，template 场景一律 red-template"
```

---

## Task 3: generate.js 删 ASCII 动画 + 二进制雨

**Files:**
- Modify: `generate.js`

**Interfaces:**
- Consumes: Task 2 后的 renderer（不再产出 `.ascii-line`/`binaryRain` canvas）
- Produces: 播放壳 JS 无 `replayAscii`/`stagger`/`rainCanvases`；无 `tokens.coverAscii` 引用

- [ ] **Step 1: 删除播放壳脚本里的 ASCII 动画**：`generate.js:420` 的 `var stagger = ...coverAscii.stagger...;`；`:426-442` 的 `replayAscii()` 函数整块；`:449` 的 `if (current === 0) setTimeout(replayAscii, 50);`；`:461` 的 `if (current === 0) setTimeout(replayAscii, 100);`。

- [ ] **Step 2: 删除二进制雨 JS**：`:468-...` 的 `// Binary rain (Matrix-style) for cover slides` 起整段 `rainCanvases` 循环（含 `draw()` 递归、`requestAnimationFrame`、`getComputedStyle(...--primary)`），到该段结束。播放壳其余部分（keydown 翻页、Home/End、resize、sessionStorage）不动。

- [ ] **Step 3: grep 确认 generate.js 无 ASCII/二进制雨残留**

Run: `grep -nE "coverAscii|ascii-line|binaryRain|replayAscii|rainCanvases|stagger" generate.js`
Expected: 无输出（空）

- [ ] **Step 4: Commit**

```bash
git add generate.js
git commit -m "feat: 移除 ASCII 封面 — generate.js 删 replayAscii 动画与二进制雨 JS"
```

---

## Task 4: SKILL.md 删 ASCII 规则 + 取消第 5 题（唯一真相源）

**Files:**
- Modify: `.claude/skills/263group-brand-guidelines/SKILL.md`

**Interfaces:**
- Consumes: 无（独立，但语义依赖 Task 1-3 的渲染结果）
- Produces: 工作汇报确认编号 = 1/2/3；无第 5 题/ASCII/二进制雨/template-cover-bg 任何引用；red-template 为工作汇报唯一封面

- [ ] **Step 1: frontmatter description**（`SKILL.md:3`）：编号话术清单 `（使用场景/配色/输出格式/视觉风格/封面风格，按场景分支问全）` → `（使用场景/配色/输出格式/视觉风格，按场景分支问全）`。

- [ ] **Step 2: 第 3 题分支衔接**（`SKILL.md:72`）：`选「网页文件」→ 直接第 5 题（工作汇报）或第 4 题（对外展示）。对外展示分支第 4 题询问视觉风格。` → `选「网页文件」→ 工作汇报直接开始生成；对外展示 → 第 4 题询问视觉风格。`

- [ ] **Step 3: 删除第 5 题话术块**（`SKILL.md:76-78` 整块：`5. **封面风格**（仅工作汇报时追加）：逐字说：「封面风格：选**个性化风格**（Geek 像素动效）还是**严谨商务风格**？」...双向强制：` 含两条子项）。删除后编号话术结束于第 3b 题。

- [ ] **Step 4: 内部思考词汇表**（`SKILL.md:95`）：`| red-template、cover-red-template.png、template-cover-bg.png | 严谨商务风格 |` → `| red-template、cover-red-template.png | 严谨商务风格 |`；`SKILL.md:98`：删 `| ASCII 字符画、二进制雨 | 个性化风格（Geek 像素动效） |` 整行。

- [ ] **Step 5: 视觉风格推荐规则**（`SKILL.md:112`）：删结尾「，其封面风格推荐维持现状（第 5 题仅 PPT 文件时推荐严谨商务风格，见第 5 题）」；`SKILL.md:114` 删整条「**封面风格推荐必须与第 3 题输出格式联动**：...」规则。

- [ ] **Step 6: 确认结果写入规则**（`SKILL.md:115`）：删「。问题 5「个性化」→ 省略封面 `background`（ASCII 默认）；「严谨」→ 封面 `"background": "red-template"`」→ 改为「。工作汇报封面唯一：`scene:"template"` 即红色位图封面，cover 不再需要 `background` 键」。

- [ ] **Step 7: 删除「母版封面页（Template Cover）」整节**（`SKILL.md:207-258`：从 `### 母版封面页（Template Cover）` 到 `**使用时**：...渲染器兜底时默认用兜底封面图）。`）。该节含 ASCII Logo 数据/渲染规则/PPTX Template 封面回退写死坐标，全部删除。删除后「路径 A × Template」小节直接衔接「工作汇报红色封面（Red Template Cover）」节。

- [ ] **Step 8: 重写「工作汇报红色封面（Red Template Cover）」节头**（`SKILL.md:262`）：`工作汇报场景的第二种封面：...适合想要比 ASCII 字符画更正式、更精致的工作汇报封面。` → `工作汇报封面（唯一）：红色设计位图底图 + 文字叠加，HTML/PPTX 100% 视觉一致。`；`SKILL.md:264` 触发段落：`**触发**：由硬门禁第 5 题「封面风格」由用户选择——「严谨」→ 封面 slide 设 "background": "red-template"；「个性化」→ 省略 background（ASCII 默认）。技术等价写法：scene: "template" + cover slide 的 "background": "red-template"。PPTX 输出时推荐严谨风格。` → `**触发**：工作汇报（`scene:"template"`）即默认（唯一）封面，cover slide 无需 `background` 键（`scene:"template"` + cover 即可）。`

- [ ] **Step 9: Themed 品牌底线**（`SKILL.md:288`）：`封面必须带 263 品牌标识（PNG Logo 或 ASCII 图形）` → `封面必须带 263 品牌标识（PNG Logo）`。

- [ ] **Step 10: 删除「封面二进制雨」整节**（`SKILL.md:305-309`：`### 封面二进制雨（仅 HTML，Geek 装饰）` 起 3 行）。

- [ ] **Step 11: 更新「封面双模式」**（`SKILL.md:311-316`）：Template 行 `**Template（对内汇报）**：pages.scene === 'template' → 白色背景 + ASCII 字符画 + 二进制雨 + 居中排版；cover.background: "red-template" 时切换为红色设计位图封面 + 左对齐文字` → `**Template（对内汇报）**：`pages.scene === 'template'` → 红色位图封面（`red-template`）+ 左对齐文字（唯一封面）`；`封面背景选项（Template）：省略（ASCII） / red-template（红色位图）` → `封面背景选项（Template）：red-template（唯一）`。

- [ ] **Step 12: 布局规则**（`SKILL.md:396`）：删「；PPTX 个性化封面写死 `top=Pt(277)`（视觉中心 55.4%），见「PPTX Template 封面回退」」→ 保留 HTML 部分，删 PPTX 个性化封面引用。

- [ ] **Step 13: 图片缩放规则 Logo 表**（`SKILL.md:478`）：`| 封面 Logo（Template·ASCII 默认）：不使用 PNG Logo，以 ASCII 字符画替代（见"母版封面页"章节）；**严谨封面 red-template 例外：左上角集团彩稿 PNG Logo**（见「工作汇报红色封面」章节） | MUST |` → `| 封面 Logo（Template）：左上角集团彩稿 PNG Logo（`layout.coverLogo` 位置/尺寸，见「工作汇报红色封面」章节） | MUST |`。

- [ ] **Step 14: PPTX 生成后自查**（`SKILL.md:566`）：删 `- [ ] PPTX 个性化封面：主标题/副标题/汇报人/公司全称坐标逐一核对写死值（top=Pt(277)/Pt(337)/Pt(359)/Pt(449)），主标题 word_wrap=False 不可折行，副标题独立一行，汇报人行底与公司名不重叠` 整条（个性化封面已移除）。

- [ ] **Step 15: 对话术语**（`SKILL.md:776`）：内部文件名清单 `（如 red-template、cover-red-template.png、template-cover-bg.png、scene/background 等字段值）` → 删 `template-cover-bg.png、`；`SKILL.md:779` 删 `- 禁止自行生成或修改 ASCII 字符画 — 必须从 brand-tokens.json 原样读取` 整条。

- [ ] **Step 16: grep 验证无残留**

Run: `grep -nE "ASCII|个性化|二进制雨|coverAscii|template-cover-bg|第 5 题|第5题|封面风格" .claude/skills/263group-brand-guidelines/SKILL.md`
Expected: 仅剩「严谨商务风格」一词（`cover-red-template.png`/red-template 仍合法），无 ASCII/个性化/二进制雨/第 5 题/封面风格（交互）残留。若「封面风格」出现在已删话术的引用中，逐条清理。

- [ ] **Step 17: Commit**

```bash
git add .claude/skills/263group-brand-guidelines/SKILL.md
git commit -m "feat: 移除 ASCII 封面 — SKILL.md 删母版封面页/二进制雨/第 5 题，工作汇报封面唯一 red-template"
```

---

## Task 5: pptx-python-guide.md 删个性化封面

**Files:**
- Modify: `.claude/skills/263group-brand-guidelines/pptx-python-guide.md`

**Interfaces:**
- Consumes: Task 4 后的 SKILL.md（已无「PPTX Template 封面回退」章节可引用）
- Produces: §6 标题无 template-cover-bg；§6.5 删除

- [ ] **Step 1: §6 标题更新**（`pptx-python-guide.md:78`）：`## 6. 封面底图（template-cover-bg / cover-red-template / cover-themed-fallback）` → `## 6. 封面底图（cover-red-template / cover-themed-fallback）`；正文如有 template-cover-bg 铺底描述同步删除。

- [ ] **Step 2: 删除 §6.5 整节**（`pptx-python-guide.md:91` 起 `## 6.5 个性化封面文字叠加（template-cover-bg，写死坐标）` 到该节结束，含 `assets/template-cover-bg.png` 铺底 + 全宽框 left=0/width=960 + 主标题 `top=Pt(277)`/副标题 `Pt(337)`/汇报人 `Pt(359)`/公司 `Pt(449)` 写死坐标表）。

- [ ] **Step 3: grep 验证**

Run: `grep -nE "ASCII|个性化|template-cover-bg|Pt\(277\)|Pt\(337\)" .claude/skills/263group-brand-guidelines/pptx-python-guide.md`
Expected: 无输出（空）

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/263group-brand-guidelines/pptx-python-guide.md
git commit -m "feat: 移除 ASCII 封面 — pptx-python-guide 删 §6.5 个性化封面叠加，§6 去 template-cover-bg"
```

---

## Task 6: brand-check-pptx.py ASCII 引用检查

**Files:**
- Modify: `brand-check-pptx.py`（如有引用）

**Interfaces:**
- Consumes: 无
- Produces: 校验器不再引用 template-cover-bg / ASCII 封面

- [ ] **Step 1: grep 检查**

Run: `grep -nE "template-cover-bg|ASCII|coverAscii|Pt\(277\)" brand-check-pptx.py`
Expected: 无输出。若命中，删除对应引用（多为 PPTX 生成后自查的个性化封面坐标核对，随 §6.5 一并移除）。

- [ ] **Step 2: 语法校验**

Run: `python -m py_compile brand-check-pptx.py`
Expected: 无错误输出，退出码 0

- [ ] **Step 3: Commit**（如 Step 1 有改动；无改动则本任务标记为无变更，跳到 Task 7）

```bash
git add brand-check-pptx.py
git commit -m "feat: 移除 ASCII 封面 — brand-check-pptx.py 清个性化封面引用"
```

---

## Task 7: 删资产 + 重建 zip + 自包含校验

**Files:**
- Delete: `assets/template-cover-bg.png`
- Modify: `测试记录/build-skill-zip.py`（更新 OUT 日期）
- Run: `测试记录/build-skill-zip.py`

**Interfaces:**
- Consumes: Task 1-6 后的全部源文件
- Produces: `测试记录/263group-brand-guidelines-0823.zip`（22 文件，无 template-cover-bg.png）

- [ ] **Step 1: 删除资产**

```bash
git rm assets/template-cover-bg.png
```

- [ ] **Step 2: 更新 zip 输出日期**（`build-skill-zip.py:18`）：`OUT = ...'263group-brand-guidelines-0821.zip'` → `'263group-brand-guidelines-0823.zip'`（与 skill 同名 + 日期，符合规范）。

- [ ] **Step 3: 重建 zip**

Run: `python 测试记录/build-skill-zip.py`
Expected: `zip: ... (22 files, root=263group-brand-guidelines/)`，校验清单全部 OK（SKILL.md/pptx-python-guide.md/brand-tokens.json/company-data.json/ad-compliance.json/generate.js/brand-check-pptx.py/assets/logos/logo-group-color.png/renderer/slides/cover.js/renderer/slides/toc.js）。注意：`build-skill-zip.py` 的自包含校验清单不含 template-cover-bg.png（其不在 `needed` 列表），但需人工确认 zip 内无该文件：

Run: `python -c "import zipfile; n=zipfile.ZipFile('测试记录/263group-brand-guidelines-0823.zip').namelist(); print('has tcbg:', any('template-cover-bg' in x for x in n)); print('count:', len(n))"`
Expected: `has tcbg: False`，`count: 22`

- [ ] **Step 4: 解压抽查关键文件**（确认 zip 内 SKILL.md 无 ASCII 残留）

Run: `python -c "import zipfile; s=zipfile.ZipFile('测试记录/263group-brand-guidelines-0823.zip').read('263group-brand-guidelines/SKILL.md').decode('utf-8'); print('ascii refs:', s.count('ASCII'), s.count('二进制雨'), s.count('第 5 题'))"`
Expected: `ascii refs: 0 0 0`

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: 移除 ASCII 封面 — 删 template-cover-bg.png，重建 zip 22 文件"
```

---

## Task 8: 端到端验证（渲染 + 浏览器实测）

**Files:**
- Test: 新建临时 `测试记录/verify-ascii-removed.json` + `测试记录/verify-ascii-removed.html`（验证后删除）

**Interfaces:**
- Consumes: Task 1-7 全部
- Produces: 验证报告（可覆盖）

- [ ] **Step 1: 写最小验证 pages.json**（含 template 场景 + 结尾页）：

```json
{
  "colorScheme": "group-red",
  "logoSet": "group",
  "scene": "template",
  "companyName": "二六三网络通信股份有限公司",
  "slides": [
    { "type": "cover", "title": "验证移除 ASCII 封面", "subtitle": "副标题", "presenter": "张三", "department": "品牌部", "date": "2026-08-23" },
    { "type": "content", "title": "内容页", "blocks": [ { "heading": "标题", "body": "正文" } ] },
    { "type": "end" }
  ]
}
```

- [ ] **Step 2: 渲染验证**

Run: `node generate.js 测试记录/verify-ascii-removed.json`
Expected: 生成 `测试记录/verify-ascii-removed.html`，无报错、无 `coverAscii`/`binaryRain`/`ascii-line` 引用。grep 确认：
`grep -nE "binaryRain|ascii-line|coverAscii|01" 测试记录/verify-ascii-removed.html` → 无匹配

- [ ] **Step 3: 浏览器实测**（项目硬性要求）：打开生成的 HTML，验证：
  - 封面 = 红色位图封面（`cover-red-template.png` 全屏背景 + 左上角集团彩稿 Logo + 左对齐文字），无 ASCII 字符画、无二进制雨
  - 窗口缩放（拖拽窗口宽度），封面/内页按比例缩放不溢出
  - 翻页遍历：方向键 ←/→ 前后翻页、Home/End 首尾，全部页面正常
  - 结尾页 = 居中 Logo + slogan，位于最后一页
  - 控制台无 JS 报错（无 `replayAscii`/`binaryRain` 相关错误）

- [ ] **Step 4: 清理验证产物**

```bash
rm -f 测试记录/verify-ascii-removed.json 测试记录/verify-ascii-removed.html
```

- [ ] **Step 5: 最终 git 状态确认**

Run: `git status --short`
Expected: 干净（工作区无残留）

---

## 后续（本计划之外，另行规划）

- **Phase 2：改写功能**（三路分叉 + 轻量品牌化 + 双保险确认 + 新增确认话术）——确认话术属硬门禁（逐字唯一输出源），需先设计编号话术并经用户逐条确认，再单独立计划。见《品牌规范skill功能说明.html》「合并优化方案」第二、三节。
- **Phase 3：token 优化重新评估**——等 Phase 1+2 落地后，重新量化 SKILL.md 体积再定方案。
- **Phase 4（可选）：`brand-check-html.py` / `brand-restyle-pptx.py`**。
