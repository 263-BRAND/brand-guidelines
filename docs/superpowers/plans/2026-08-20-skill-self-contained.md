# 263group-brand-guidelines 分发改造（zip 自包含 + git 备份）实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让 263group-brand-guidelines 能以「zip 自包含 skill 目录」为主分发给全公司（企业版 + 个人版），git 仓库作备份/开发源，实现最大工具兼容且无需重装。

**Architecture:** **仓库物理布局不动**（数据文件留在根，git 历史零破坏，开发/测试照旧）。只做两件事：① `generate.js` 改 `__dirname` 相对路径——用户从**任何目录**都能 `node <skill目录>/generate.js <pages.json>` 运行（不再依赖 cwd 恰好在数据文件旁）；② zip 打包从「打平到根」改为「`263group-brand-guidelines/` 目录 = 自包含 skill」。SKILL.md 裸文件名引用不动（两种布局下都成立），仅在文档里补「以 skill 目录为基准」说明。

**Tech Stack:** Node.js（generate.js）、Python 3 + zipfile（打包）、python-pptx（brand-check 验证）。

**Spec:** 基于对话确认（2026-08-20）：全公司同事用 + 企业版/个人版最大兼容；**分发方式 = zip 为主 + git 作备份**；自包含目录 = 一个完整 skill；git pull 即更新（无需重装）；marketplace 暂不采用。

## Global Constraints

- **仓库物理布局不变**：`brand-tokens.json`、`company-data.json`、`ad-compliance.json`、`generate.js`、`assets/`、`renderer/` 保持在仓库根；`.claude/skills/263group-brand-guidelines/` 保持现状（开发/测试照旧，git 历史零破坏）
- `generate.js` 命令签名不变：`node generate.js <pages.json>`；pages.json 由调用方传入（相对调用方 CWD），内部数据/资产文件从 `__dirname` 解析
- `brand-check-pptx.py` 命令签名不变：`brand-check-pptx.py <file.pptx> [--scheme ...] [--external]`
- 兼容性：SKILL.md **不使用** `${CLAUDE_SKILL_DIR}`（非 Claude Code 工具不识别），用明文路径描述
- zip 仍 22 文件，但结构从「打平到 zip 根」改为「`263group-brand-guidelines/` 目录为 zip 根」
- 保持全部品牌规则/话术/合规闸门不变（纯路径/打包改造）
- 回归：HTML 7 样例 + PPTX 8 样例 + 打包版解压运行必须全过
- 提交：每任务一 commit，`feat:` / `test:` / `docs:` 前缀

---

### Task 1: generate.js 路径改为 __dirname 相对

**Files:**
- Modify: `generate.js`（L18 brand-tokens、L102/106 ad-compliance、L281 require renderer、L322 logoBase64；token 内 assets/ 图片路径经 logoBase64 读取需 resolve）

**Interfaces:**
- Consumes: 现状 generate.js（CWD 相对路径）
- Produces: `BASE_DIR = path.dirname(__filename)`；`resolveBase(p) = path.join(BASE_DIR, p)`；数据/资产读取走 resolveBase。**pages.json / outPath 保持相对调用方 CWD（外部输入，不 resolve）**

- [ ] **Step 1: 写失败测试**

新建 `测试记录/test-generate-anywhere.js`——在**临时目录**用绝对路径调 generate.js，验证从任意 CWD 都能运行：

```js
// 测试记录/test-generate-anywhere.js
// 用法：node 测试记录/test-generate-anywhere.js
// 在临时目录造最小 pages.json，用绝对路径调 generate.js，验证不受 CWD 影响
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const repoRoot = path.resolve(__dirname, '..');
const genPath = path.join(repoRoot, 'generate.js');

// 最小合法 pages.json（含 cover + end 结尾页，group-red）
const pages = {
  colorScheme: 'group-red',
  companyName: '二六三网络通信股份有限公司',
  slides: [
    { type: 'cover', title: '测试封面' },
    { type: 'end' }
  ]
};

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vi-anywhere-'));
const pagesPath = path.join(tmp, 'pages.json');
fs.writeFileSync(pagesPath, JSON.stringify(pages));
process.chdir(tmp);  // 模拟用户在其他目录运行

const out = execSync(`node ${JSON.stringify(genPath)} ${JSON.stringify(pagesPath)}`, { encoding: 'utf-8' });
const htmlPath = path.join(tmp, 'pages.html');
const html = fs.readFileSync(htmlPath, 'utf-8');
const ok = html.includes('data:image/png;base64,') && html.includes('logo-color-img');
if (!ok) {
  console.error('FAIL: HTML 未包含 base64 Logo（generate.js 未从 __dirname 解析 assets/）');
  process.exit(1);
}
console.log('PASS: 临时目录运行成功，HTML 含 base64 Logo（自包含生效）');
```

- [ ] **Step 2: 运行失败测试**

Run: `node 测试记录/test-generate-anywhere.js`
Expected: FAIL（generate.js 在临时 CWD 找不到 `brand-tokens.json` → exit 1 / 抛错）

- [ ] **Step 3: 改 generate.js**

在 `const path = require('path')` 后加：

```js
// 自包含基准：数据/资产/渲染器按 __dirname 解析，不依赖运行时 CWD（zip 自包含目录与仓库根均适用）
const BASE_DIR = path.dirname(__filename);
function resolveBase(p) { return path.join(BASE_DIR, p); }
```

逐处替换：
- L18: `fs.readFileSync('brand-tokens.json')` → `fs.readFileSync(resolveBase('brand-tokens.json'))`
- L102: `fs.existsSync('ad-compliance.json')` → `fs.existsSync(resolveBase('ad-compliance.json'))`
- L106: `fs.readFileSync('ad-compliance.json')` → `fs.readFileSync(resolveBase('ad-compliance.json'))`
- L281: `require('./renderer/slides/' + t + '.js')` → `require(resolveBase('renderer/slides/' + t + '.js'))`
- L322: `fs.readFileSync(logoPath)` → `fs.readFileSync(resolveBase(logoPath))`（logoPath 来自 token 相对路径，如 `assets/logos/logo-group-color.png`）
- **pages.json / outPath 不改**（外部输入，相对调用方 CWD）

- [ ] **Step 4: 运行测试验证通过**

Run: `node 测试记录/test-generate-anywhere.js`
Expected: PASS（临时目录运行，HTML 含 base64 Logo）

- [ ] **Step 5: 仓库根回归**

Run: 在仓库根用既有 7 样例 pages.json 全跑一遍
Expected: 全 exit 0（仓库根行为与改动前一致——`__dirname`=仓库根，等价于原 CWD 相对）

- [ ] **Step 6: Commit**

```bash
git add generate.js 测试记录/test-generate-anywhere.js
git commit -m "feat: 分发改造 — generate.js 数据/资产/渲染器路径改为 __dirname 相对（任意 CWD 可运行），新增 test-generate-anywhere.js"
```

---

### Task 2: brand-check-pptx.py 自包含验证

**Files:**
- Verify: `brand-check-pptx.py`（L38-46 已用 script_dir 优先 + cwd 兜底，推测无需改）

**Interfaces:**
- Consumes: Task 1 的「任意 CWD 可运行」约定（Python 侧已实现为 script_dir）
- Produces: 确认 PPTX 侧从任意 CWD 可运行

- [ ] **Step 1: 从临时目录运行**

Run:
```bash
cd $(mktemp -d) && python <repoRoot>/brand-check-pptx.py <repoRoot>/测试记录/某合法.pptx
```
Expected: exit 0（script_dir 优先找到 brand-tokens.json）

- [ ] **Step 2: 回归 PPTX 8 样例**

Run: `python 测试记录/make-pptx-test-decks.py` 生成样例，逐个跑 brand-check
Expected: 全 PASS（合法 exit 0 / 违规 exit 1，含语义绿修复后行为）

- [ ] **Step 3: Commit**

```bash
git commit -m "test: 验证 brand-check-pptx.py 任意 CWD 可运行（script_dir 优先）" --allow-empty
```
> Step 1/2 证明无需改代码则空 commit 记录；发现需改则按实际改。

---

### Task 3: zip 打包改 skill 目录结构 + 构建脚本固化

**Files:**
- Create: `测试记录/build-skill-zip.py`（固化构建）
- Output: `测试记录/263-vi-skill-0820.zip`（结构改为自包含 skill 目录）

**Interfaces:**
- Consumes: Task 1 的 __dirname 自包含（zip 内 generate.js 与数据文件同目录 → __dirname 成立）
- Produces: zip 内结构 = `263group-brand-guidelines/` 为根，内含 SKILL.md + pptx-python-guide.md + brand-tokens.json + company-data.json + ad-compliance.json + generate.js + brand-check-pptx.py + assets/ + renderer/（共 22 文件）

- [ ] **Step 1: 新建构建脚本**

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""构建 skill zip：仓库根数据文件 + skill 目录合并为自包含 skill 目录结构。"""
import zipfile, os, sys

REPO = os.path.dirname(os.path.abspath(__file__))  # 脚本在 测试记录/，仓库根 = 上一级
ROOT = os.path.dirname(REPO)
SKILL_SRC = os.path.join(ROOT, '.claude', 'skills', '263group-brand-guidelines')
ARC_ROOT = '263group-brand-guidelines'
OUT = os.path.join(REPO, '263-vi-skill-0820.zip')

# zip 内文件清单（arc_name -> 源路径）；skill 目录内文件 + 根数据/脚本/资产/渲染器
arc_map = {}
for fn in os.listdir(SKILL_SRC):
    full = os.path.join(SKILL_SRC, fn)
    if os.path.isfile(full):
        arc_map[os.path.join(ARC_ROOT, fn)] = full
    elif os.path.isdir(full):
        for root, dirs, files in os.walk(full):
            for f in files:
                ffull = os.path.join(root, f)
                rel = os.path.relpath(ffull, SKILL_SRC)
                arc_map[os.path.join(ARC_ROOT, rel).replace('\\', '/')] = ffull
# 根目录数据/脚本/资产/渲染器（skill 目录内没有的）
for name in ['brand-tokens.json', 'company-data.json', 'ad-compliance.json',
             'generate.js', 'brand-check-pptx.py', 'assets', 'renderer']:
    src = os.path.join(ROOT, name)
    if not os.path.exists(src):
        continue
    if os.path.isfile(src):
        arc_map[os.path.join(ARC_ROOT, name).replace('\\', '/')] = src
    else:
        for r, ds, fns in os.walk(src):
            for f in fns:
                ffull = os.path.join(r, f)
                rel = os.path.relpath(ffull, ROOT)
                arc_map[os.path.join(ARC_ROOT, rel).replace('\\', '/')] = ffull

with zipfile.ZipFile(OUT, 'w', zipfile.ZIP_DEFLATED) as z:
    for arc in sorted(arc_map):
        z.write(arc_map[arc], arc)
print('zip: %s (%d files, root=%s/)' % (OUT, len(arc_map), ARC_ROOT))
```

- [ ] **Step 2: 运行构建 + 校验结构**

Run: `python 测试记录/build-skill-zip.py`
Expected: zip 内首项 `263group-brand-guidelines/SKILL.md`；共 22 文件；根目录下无散落文件

- [ ] **Step 3: 打包版解压运行验证**

Run: 解压新 zip → `cd 263group-brand-guidelines/` → 用 Task 1 的 pages.json 跑 `node generate.js` + `python brand-check-pptx.py`
Expected: 均成功（证明自包含目录脱离仓库根可用，generate.js __dirname 在 zip 布局成立）

- [ ] **Step 4: Commit**

```bash
git add 测试记录/build-skill-zip.py
git commit -m "feat: 分发改造 — zip 改为自包含 skill 目录结构（263group-brand-guidelines/ 为根），新增 build-skill-zip.py 固化构建"
```

---

### Task 4: SKILL.md / 文档补「以 skill 目录为基准」说明 + 分发方式

**Files:**
- Modify: `.claude/skills/263group-brand-guidelines/SKILL.md`、`CLAUDE.md`、`README.md`、`开发日志.md`、`Design-Decision.md`、memory

**Interfaces:**
- Consumes: Task 1-3 的自包含路径与 zip 新结构
- Produces: 文档一致说明「数据文件以 skill 目录为基准；zip 自包含目录；git 备份/开发源；分发与更新方式」

- [ ] **Step 1: SKILL.md 补自包含说明**

在「品牌数据文件」表上方加（**不改 32 处裸文件名本身**——两种布局下相对可见范围均成立）：

```markdown
> **自包含布局（2026-08-20）**：本 skill 的全部数据文件（`brand-tokens.json`、`company-data.json`、`ad-compliance.json`、`generate.js`、`brand-check-pptx.py`、`assets/`、`renderer/`）与 SKILL.md 位于**同一 skill 目录**（分发 zip 解压后即此结构）。读取品牌数据文件时以 skill 目录为基准；`node generate.js <pages.json>` 内部自动从 skill 目录解析数据/资产文件，pages.json 由调用方传入。
```

- [ ] **Step 2: CLAUDE.md**

改「Skill zip 打包」：zip 从「打平到根」改为「`263group-brand-guidelines/` 目录为 zip 根（自包含 skill 目录）」；补「分发方式」——zip 为主（解压即用），git 仓库作备份/开发源；更新方式 = 替换 zip 目录 / `git pull`，无需重装。

- [ ] **Step 3: README.md**

改「快速开始 / 目录结构 / Skill zip 交付」三节 + 新增「分发与更新」：zip 解压即用；git pull 更新无需重装；企业受管配置优先级最高；marketplace 暂不采用（改调用名/复制进缓存/需额外配置）。

- [ ] **Step 4: 开发日志.md + Design-Decision.md + memory**

- 开发日志追加20：分发改造（zip 自包含 + git 备份）决策 + 实现 + 回归
- Design-Decision 补决策记录：为什么 zip 自包含为主、git 备份；marketplace 取舍；generate.js __dirname 改法
- memory `project-263-ppt-vi-system.md`：zip 新结构、分发方式、更新机制

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/263group-brand-guidelines/SKILL.md CLAUDE.md README.md 开发日志.md Design-Decision.md
git commit -m "docs: 分发改造 — SKILL/CLAUDE/README/开发日志/Design-Decision 补自包含布局与分发更新说明"
```

---

### Task 5: 全量回归 + 最终验证

**Files:**
- Verify: 全部改动

**Interfaces:**
- Consumes: Task 1-4 全部产出
- Produces: 回归通过证明

- [ ] **Step 1: HTML 全样例回归**

Run: 7 广告法样例（仓库根 + 临时目录 + 打包解压目录各一次）
Expected: 全 exit 0

- [ ] **Step 2: PPTX 全样例回归**

Run: 8 样例（make-pptx-test-decks.py + 语义绿 + ea 面）
Expected: 全 PASS

- [ ] **Step 3: 打包版端到端**

Run: 解压新 zip → 独立目录 → HTML（node generate.js）+ PPTX（brand-check-pptx.py）各跑
Expected: 全通过

- [ ] **Step 4: git 提交全量**

```bash
git add -A && git status --short
```
Expected: 仅计划内文件；无遗留测试产物

---

## 自审

**Spec 覆盖：**
- ✅ generate.js __dirname（任意 CWD 可运行）→ Task 1
- ✅ brand-check 自包含验证 → Task 2
- ✅ zip 自包含 skill 目录结构 → Task 3
- ✅ 文档自包含/分发说明 → Task 4
- ✅ 回归 → Task 5
- ✅ 仓库物理布局不变、git 历史零破坏（用户「zip 为主 + git 备份」决定）

**Placeholder 检查：** 无 TBD；每步含实际代码。build-skill-zip.py 完整给出。

**类型一致性：** `BASE_DIR`/`resolveBase` Task 1 定义、Task 3 zip 依赖（generate.js __dirname 在 zip 布局成立）；`ARC_ROOT='263group-brand-guidelines'` Task 3 定义、Task 4 文档引用。命名一致。

**已知边界（诚实标注）：** ① 分发 zip 后用户需 `cd 263group-brand-guidelines/` 运行，或任意目录用绝对路径（generate.js 已支持）；② SKILL.md 裸文件名在「仓库根启动」和「zip 目录启动」两种可见范围下均成立，无需改 32 处引用本身；③ 仓库根仍保留开发用数据文件（git 备份/开发源），与分发 zip 是两套拷贝——将来若改仓库数据需重建 zip 同步（已在开发日志标注此运维点）。
