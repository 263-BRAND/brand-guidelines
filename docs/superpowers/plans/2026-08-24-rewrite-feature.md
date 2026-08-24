# 改写功能（Phase 2）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 给 263group-brand-guidelines 增加「改写已有文件」主路径——任务类型×场景矩阵识别、用途驱动、轻量品牌化、R1-R6 硬门禁话术、brand-check-html.py 机器验收，把 skill 从「从零生成」单一路径扩展为「生成 + 改写」双主路径。

**Architecture:** 改写规则全部落 SKILL.md 内部新增章节（不用 references，token 后置、避免跨工具 references 读取风险），复用现有品牌套件规则。任务类型识别 agent 内部不提问；确认流程三道平铺题（场景内/外 + 用途仅改写问 + 改动范围声明）；用途驱动封面/结尾页/字号；验收 HTML 走新前置的 brand-check-html.py（与 brand-check-pptx.py 对齐），设计 skill 产出路径诚实标注为后置检具。

**Tech Stack:** Node.js（generate.js 渲染）、JSON、Markdown（SKILL.md）、Python（brand-check-html.py）、python-pptx（brand-check-pptx.py 既有）。

**Spec:**
- 定稿方案：`G:\AI vibe coding\Trae Work_CN\品牌规范skill功能说明.html` →「合并优化方案（2026-08-23 定稿）」第二～十二节（任务类型识别 / 确认流程 / 用途驱动 / 封面分层 / 换色映射 / 双保险 / 广告法 / 执行者 / 验收 / 整合 / SKILL 落点 / R1-R6 话术）
- 评估：`测试记录/品牌规范skill-8.23修改计划评估.md`（14 项，2026-08-24 逐项定案，见下方 Global Constraints 落点）
- 记忆：`project-vi-skill-optimization-plan.md`（关键决策 + 评估采纳）

## Global Constraints

- **落点**：改写规则落 SKILL.md 内部新增章节；复用品牌套件规则（色板/字体/Logo/结尾页），不重复定义。
- **R1-R6 话术**（本文档 Task 1 全文列出）逐字硬门禁、唯一输出源，对用户的话只能逐字来自编号话术；编号是 agent 内部书签不暴露用户。**用户批准本计划即视为确认话术**；如需调整在批准前提出。
- **任务类型识别 agent 内部不提问**：改/新做分类对用户透明，不设确认题；「有设计」不量化（用户意图优先，靠透明声明 + 纠正权）。**判断「有设计」时绑定 R5 + 分支化内容保全声明**（#2）：改写=「你的版式设计会保留，仅做品牌化替换」；纯内容新做=「文件里的内容和配图我会保留，并重新制作一份规范的演示文件。」
- **确认流程**：三道平铺题 = 场景(内/外) + 用途(仅改写问：投屏演示/屏幕阅读/打印) + 改动范围(默认全文件品牌化)。**R4 是声明非确认题**（#5）。改写不问配色（集团红默认）、输出格式（文件类型已定）、视觉风格（生成型问题）。
- **用途驱动**（#6 焊死默认值）：投屏演示→封面强制（对内=严谨商务风唯一 / 对外=分层）、结尾页强制 VI 标准（内/外都强制）、套品牌字号；**屏幕阅读/打印→默认保留原封面、仅替换品牌元素（Logo/色板/公司数据）、保持原字号，除非用户明确要求重做封面**；封面分层硬规则永远覆盖默认。
- **封面分层四情形决策表**（#3）：背景红→替换封面；Logo 反白稿(背景非红)→只换 Logo；Logo 彩稿但变形/尺寸/溢出→只换 Logo；全合规→不动。色板/公司数据/文字/字体违规→就地修。
- **换色映射**（按角色不按色相，主色/强调/小标题/加粗→品牌红 #D0121B；文本→dark/gray；背景/卡片→white/lightGray/浅粉白 #F8B5B8；边框→gray；无法归类→gray 兜底；图片内容不动；Logo→集团 Logo 按 logoSet）。**绿**（#7）：仅图表涨跌；非图表绿——负向/失败绿保留语义、正向一律品牌红。**渐变**（#8）：封面禁红底，内容页品牌红渐变可用；禁大面积黑/深灰用淡灰纯白。蓝调执行前告知用户。
- **双保险**：agent 结构判断有把握→跳过问题用 R5 透明声明；模糊→R3 行为问法（**仅 HTML 适用**，#13，PPTX 默认演示文稿）；用户回答与判断不一致→停下来大白话描述让用户拍板；双方拿不准→非破坏性默认（按阅读处理只套品牌不重建）；本 skill 自产 HTML（generate.js 输出）例外。
- **广告法（改写仅对外）**：审 agent 改写文本 + 全文件可见正文（含表格可见单元格），跳过备注/隐藏；命中循环与生成一致；用户原文违禁词列出但标注「部分表述来自您原文件的内容，是否修改由您决定」；agent 只提示不代写；**generate.js 兜底失效**——手改文件不走渲染器，改写后显式对照 ad-compliance.json。
- **验收（不靠 agent 记得）**：PPTX→brand-check-pptx.py 机器断言（既有）；**HTML→brand-check-html.py 前置为 Phase 2 必做（#1）**——自查清单=持续 token + 流程强制可漏，脚本=一次性+机器强制(exit 1)+零运行时 token；**诚实边界**：机器强制仅自有产出路径（走 generate.js/脚本调用）成立，设计 skill 产出只能后置检具+人工核对（同 pptx §9.1/§9.2）。
- **设计能力判定载体扩宽**：只判「会话中已客观存在且可直接调用」的外部能力 = 已加载设计/PPT 技能 + 已定义 agent + 已安装插件技能 + 已连接且授权可用的设计类 MCP 工具；**agent 不能中途搜索/加载新插件/MCP/agent**（安装/连接是用户侧配置，权限确认只覆盖调用门）；排除通用代码执行工具（代码能力伪装）；263group-brand-guidelines 本身不算；判据不变（能直接产出 .pptx 版式或承担设计排版）。
- **复杂溢出判据按载体分流**（#12）：PPTX 用 Trae 判据——改动只落 1 个文本框且不重叠=agent；重叠/跨元素联动=转设计 skill 或退回用户（固定坐标框需手动重排）；**HTML 不用「跨元素联动」信号**（文档流自动 reflow 是免费行为），只保留「不重叠」判断用于绝对定位/定高容器（封面标题/Logo 安全区/定高卡片），正常流元素 agent 直接处理；HTML 走 generate.js 时字号渲染器强制，此判据基本不触发。
- **Phase 2 仅 HTML/PPTX**（#4）：docx/xlsx 显式排除（不纳入本次），如用户提交 docx/xlsx 明确告知「暂不支持改写，可转 HTML/PPT」。
- **浏览器实测**：渲染器/UI 变更必须在浏览器实测（窗口缩放、翻页遍历、背景模式切换），只读代码不算验证。
- **每次任务后 git commit**；zip 在最终任务重建并校验自包含。
- **分支隔离**：Phase 2 在分支（如 `feature/vi-skill-phase2`）上实施，不直接改 master。

---

## 文件结构（改动清单）

| 文件 | 责任 | 改动 |
|------|------|------|
| `.claude/skills/263group-brand-guidelines/SKILL.md` | Skill 定义（唯一真相源） | 新增「改写功能」章节（任务类型×场景矩阵 / 确认流程 / 用途驱动 / 封面分层决策表 / 换色映射 / 双保险 / 广告法改写 / 执行者 / 验收 / 整合 / R1-R6 话术表）；修订现有章节（设计能力判定扩宽、复杂溢出判据分流、R3 仅 HTML 标注、绿/渐变措辞、阅读打印默认值） |
| `brand-check-html.py` | HTML 品牌合规校验器（新建） | 颜色白名单扫描 / 对外禁微软雅黑 / 图片内嵌 / 结尾页最后；对齐 brand-check-pptx.py；`--external` 参数 |
| `CLAUDE.md` | 仓库项目说明（本地 untracked） | 改写功能概述 + 设计能力判定扩宽 + 复杂溢出判据 + 阅读打印默认值 |
| `README.md` | 人类/Agent 双版说明书 | 功能说明补「改写已有文件」能力 |
| `开发日志.md` | 开发日志（本地 untracked） | 追加26 Phase 2 落地 |
| `Design-Decision.md` | 设计决策（本地 untracked） | 改写功能决策记录 |
| `测试记录/build-skill-zip.py` | zip 构建 | 无需改（自动收集）；重建 zip |
| `测试记录/*` | 测试样例 | 新建改写样例验证（验证后删） |

---

## Task 1: 改写功能章节——任务类型识别 + 确认流程 + R1-R6 话术（写入 SKILL.md）

**Files:**
- Modify: `.claude/skills/263group-brand-guidelines/SKILL.md`

**Interfaces:**
- Consumes: 无（首任务）
- Produces: SKILL.md 新增「改写功能」章节，含任务类型×场景矩阵、确认流程、R1-R6 话术表（后续 Task 2-3 依赖此章节结构续写）

- [ ] **Step 1: 新增「改写功能」章节头 + 任务类型识别**

在 SKILL.md「工作流」章节内、`### 路径选择` 之后插入（或新建独立 `## 改写功能` 顶层章节，置于「工作流」与「品牌规则」之间）：

```markdown
## 改写功能（Phase 2，2026-08-24）

### 任务类型识别（agent 内部判定，不向用户提问）

「改写 / 新做」分类对用户完全透明——agent 内部定，用户只看到结果。**不设确认题**。

| 输入 | 判定 | 处理 |
|------|------|------|
| 无文件 + 需求 | 新做 | 生成流程 |
| 内容型文件（txt / md / 提纲） | 新做 | 生成流程 |
| 成品型·有设计 + 改写词（改 / 美化 / 改色 / 加logo / 对齐 / 合规） | 改写 | 改写流程 |
| 成品型·纯内容（每页文字 + 配图，无统一设计；或裸文本 PPT） | 新做 | 提取内容 + 配图，生成品牌演示 |
| 真模糊（罕见） | 按最合理解释执行 + 透明声明，用户可纠正 | — |

**「有设计」判定**（agent 打开文件检查）：存在可保留/调整的**统一配色主题、自定义版式、图形元素、背景设计、动画**。**图片、文字是内容素材，不算设计。** 判定不量化——用户意图优先于成品属性，靠透明声明 + 纠正权兜住。

**内容型演示透明声明**（判定纯内容·新做时，动手前说）：「文件里的内容和配图我会保留，并**重新制作一份规范的演示文件**。」

**判断「有设计」时绑定双声明（动手前一起说）**：
- 改写：「你的版式设计会保留，仅做品牌化替换（Logo/色板/公司数据）。」+ R5
- 纯内容新做：「文件里的内容和配图我会保留，并重新制作一份规范的演示文件。」+ R5
```

- [ ] **Step 2: 确认流程（改写分支）写入**

```markdown
### 改写确认流程（三道平铺题）

| 题 | 问谁 | 决定什么 |
|----|------|----------|
| 场景 内/外 | 改写、新做都问 | 广告法（仅对外）+ 封面处理 + 字体栈 |
| 用途 演示/阅读 | **仅改写问** | 封面/结尾页是否强制 + 字号口径 |
| 改动范围 | 仅改写 | 默认全文件品牌化（**R4 是声明非确认题**） |

**改写不问的题**：配色方案（集团红默认，通信蓝不可选）、输出格式（文件类型已定）、视觉风格/封面风格（生成型问题）。
**为什么用途只在改写问**：新做产出的就是演示，处理已被场景 + 生成流程完全决定；阅读文档只有「改已有」才存在。
```

- [ ] **Step 3: R1-R6 话术表写入（逐字硬门禁，唯一输出源）**

```markdown
### 改写分支话术集（R1-R6，编号是 agent 内部书签，不暴露用户）

| 编号 | 用途 | 逐字话术 |
|------|------|----------|
| R1 | 场景确认（改写版） | 对内：「根据您提供的文件，我判断它是用于**工作汇报**的。如果实际是用于**对外展示**，请告诉我，我会切换处理方式。」<br>对外：「根据您提供的文件，我判断它是用于**对外展示**的。如果实际是用于**内部工作汇报**，请告诉我，我会切换处理方式。」 |
| R2 | 用途确认（仅改写，必问；打印并入屏幕阅读） | 「这个文件是用于**投屏演示**？还是**屏幕阅读**？」 |
| R3 | 双保险行为问法（**仅 HTML** 结构模糊或 R2 与 agent 判断不一致时；PPTX 默认演示文稿不问） | 「您希望阅读时是像 PPT 一样翻页的，还是像网页一样滚动阅读的？」 |
| R4 | 改动范围透明声明（默认全文件品牌化） | 对内：「我会对文件的颜色、字体、Logo 和公司信息做品牌规范调整，**保留原有排版**。」<br>对外：「我会对文件的颜色、字体、Logo 和公司信息做品牌规范调整，**保留原有排版**，并对内容做**广告法合规审查**。」 |
| R5 | 双保险透明声明（agent 有把握、用户无明确意见时） | 投屏演示：「我按**投屏演示**来调整这个文件，文字偏大处理。」<br>文档：「我按**文档规则**来调整这个文件，阅读更舒适。」 |
| R6 | 交付前自查声明 | 「交付前我会按品牌规范自查一遍，确认颜色、Logo、字体和合规都符合规范，通过后才交付。」 |

**对外广告法命中循环**（复用打断话术，追加来源标注）：（现有打断话术正文）+「其中**部分表述来自您原文件的内容**，是否修改由您决定。」
```

- [ ] **Step 4: 验证无占位 + 编号完整**

Run: `grep -nE "R[1-6]|任务类型识别|改写确认流程" .claude/skills/263group-brand-guidelines/SKILL.md`
Expected: 六个 R 编号话术全部出现，章节标题齐全。

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/263group-brand-guidelines/SKILL.md
git commit -m "feat: 改写功能 — SKILL.md 新增任务类型识别/改写确认流程/R1-R6 话术表"
```

---

## Task 2: 改写功能章节——用途驱动 + 封面分层决策表 + 换色映射 + 双保险 + 广告法 + 验收 + 整合

**Files:**
- Modify: `.claude/skills/263group-brand-guidelines/SKILL.md`（在 Task 1 新增的「改写功能」章节内续写）

**Interfaces:**
- Consumes: Task 1 的「改写功能」章节
- Produces: 章节完整（用途分支/封面分层/换色映射/双保险/广告法/执行者/验收/整合）

- [ ] **Step 1: 用途驱动分支写入（含 #6 焊死默认值）**

```markdown
### 用途驱动的处理分支（仅改写）

| 用途 | 封面 | 结尾页 | 字号行距 | 广告法 |
|------|------|--------|----------|--------|
| **投屏演示** | 强制处理：对内=严谨商务风封面（唯一）；对外=分层修改（见封面分层） | 强制 VI 标准（居中 Logo + slogan），内/外都强制 | 套品牌字号（大屏 26pt 正文等） | 仅对外 |
| **屏幕阅读 / 打印** | **默认保留原封面、仅替换品牌元素（Logo/色板/公司数据）、保持原字号，除非用户明确要求重做封面**；封面分层硬规则永远覆盖默认 | 保留原样 | 保持原样 | 仅对外 |

阅读文档只套品牌（色板/字体/Logo/公司数据）+ 广告法（仅对外），**不套演示画布字号下限**（HTML ≥20pt 那套只针对 1920×1080 画布）。**打印并入屏幕阅读分支**（R2 只问演示/阅读两选项，用户提到打印按屏幕阅读处理）。
```

- [ ] **Step 2: 封面分层四情形决策表写入（#3）**

```markdown
### 封面分层修改规则（对外演示）

| 情形 | 处理 |
|------|------|
| 背景红 | **替换封面**（对外=兜底封面图 + 原文字叠加，或有设计 skill 时 Themed 底线内重做；对内=严谨商务风封面） |
| Logo 反白稿（背景非红） | **只替换 Logo**，不动背景 |
| Logo 彩稿但变形/尺寸/溢出边界 | **只替换 Logo**，不动背景 |
| 全合规 | 不处理 |
| 色板/公司数据/文字/字体违规 | **就地修**（保留背景图，只修违规元素） |

**底线**（对外展示封面品牌底线）：只用色板色 / 封面必须带品牌标识 / 背景禁红禁深 / 字号达标 / 禁纯黑 / 开源字体 / 公司数据不编造。任一违反 → 按上表处理。
```

- [ ] **Step 3: 换色映射表写入（按角色不按色相，含 #7/#8 修订）**

```markdown
### 换色映射（按角色不按色相）

| 原元素 | 映射 |
|--------|------|
| 主色/强调/小标题/加粗等重点色（含蓝主色、蓝强调） | **品牌红** primary #D0121B |
| 普通文本（深色字） | dark #2D3847 / gray #595959（标题 dark，正文 gray） |
| 背景/卡片色 | white / lightGray / 浅粉白 #F8B5B8 |
| 边框 | gray |
| 绿 | 仅图表涨跌；非图表绿——**负向/失败绿保留语义，正向一律品牌红** |
| 渐变 | **封面禁红底**；内容页品牌红渐变可用；禁大面积黑/深灰用淡灰纯白代替 |
| 无法归类 | gray 兜底 |
| 图片/照片内容 | 不动（内容素材） |
| Logo | 替换为集团 Logo（按 logoSet） |
| 图表颜色 | 遵循数据图表规范（chartPalette） |

**执行前告知**：原文件为蓝色调时，先告知「原文件是蓝色调，会调整为集团红品牌色」再执行。
```

- [ ] **Step 4: 双保险 + 广告法改写 + 执行者 + 验收 + 整合写入**

```markdown
### 双保险确认（非自产 HTML 的文件性质判断）

| 情况 | 处理 |
|------|------|
| agent 结构判断有把握 | 跳过问题，用 R5 透明声明直接声明处理方式 |
| 结构模糊 | 用 R3 行为问法（仅 HTML）问用户 |
| 用户回答与 agent 判断不一致 | 停下来，agent 用大白话描述观察到的结构特征，让用户拍板 |
| 用户拿不准 + agent 有把握 | 按 agent 判断 + R5 透明声明 |
| 双方都拿不准 | 非破坏性默认（按阅读文档处理，只做品牌套用不重建结构） |

**例外**：本 skill 自产 HTML（generate.js 输出，结构固定可精确识别）不在此列。

### 广告法审查（改写，仅对外）

- 审查范围：agent 改写文本 + 全文件可见正文（含表格可见单元格），跳过备注与隐藏内容
- 命中循环与生成一致：打断 → 列出（词 + 位置 + 原文）→ 用户改 → 循环至干净
- 用户原文违禁词也列出，标注「部分表述来自您原文件的内容，是否修改由您决定」
- agent 只提示不代写（不代写替代词）
- **generate.js 兜底失效**：手改文件不走渲染器，改写后文本须显式对照 ad-compliance.json 审查

### 执行者分工

- 轻量路径全部 agent 执行：HTML 改 CSS/文字；PPTX 用 python-pptx
- 结构级替换封面 agent 执行：用兜底封面图 / red-template + 文字叠加
- 设计 skill 仅在：用户明确要求重新设计视觉 / PPTX 复杂溢出 agent 无法处理时介入
- **Phase 2 仅支持 HTML/PPTX**：docx/xlsx 显式排除，如用户提交明确告知「暂不支持改写，可转 HTML/PPT」

### 验收 / 校验（不靠 agent「记得」）

| 载体 | 校验方式 | 性质 |
|------|----------|------|
| PPTX | brand-check-pptx.py = 交付断言（改完必须运行，不通过 exit 1 不交付） | 机器强制 |
| HTML | **brand-check-html.py = 交付断言**（自有产出路径嵌入生成脚本末尾，不通过 exit 1 不产出）；设计 skill 产出路径只能后置检具 + 清单人工核对（诚实边界，同 pptx §9.1/§9.2） | 机器强制（自有路径）/ 检具（设计 skill 路径） |
| 自查清单 | 逐项写死（读 token 核对色板 / Logo / 字体 / 公司数据 / 广告法 / 封面结尾页） | 内容锁死兜底 |

### 与现有路径的整合

- 废除「路径 A / 路径 B」说法 → 「任务类型 × 场景」矩阵（改写 / 新做 × 内 / 外 × 用途）
- 现有路径 B × Template / × Themed 的细则（替换所有颜色 / 结尾页强制 / Logo 安全区 / 广告法）保留为「结构级改写」规则，不重写
- 轻量品牌化 = 新增章节（skill 之前没有「保留原结构只套品牌」能力）
```

- [ ] **Step 5: grep 验证**

Run: `grep -nE "用途驱动|封面分层|换色映射|双保险|广告法审查（改写|执行者分工|验收 / 校验|与现有路径的整合|Phase 2 仅" .claude/skills/263group-brand-guidelines/SKILL.md`
Expected: 全部小节标题命中。

- [ ] **Step 6: Commit**

```bash
git add .claude/skills/263group-brand-guidelines/SKILL.md
git commit -m "feat: 改写功能 — 用途驱动/封面分层决策表/换色映射/双保险/广告法改写/执行者/验收/整合"
```

---

## Task 3: SKILL.md 现有章节修订（设计能力判定扩宽、复杂溢出判据分流、R3 范围、绿/渐变措辞）

**Files:**
- Modify: `.claude/skills/263group-brand-guidelines/SKILL.md`（现有「生成前确认 → 规则」与「PPT 输出路径」「图片素材缩放」等章节）

**Interfaces:**
- Consumes: Task 1-2 的改写章节（话术编号体系）
- Produces: 现有章节与改写章节自洽（无矛盾措辞）

- [ ] **Step 1: 设计能力判定载体扩宽**

在「生成前确认 → 规则 → PPT 能力检查」与「与设计 skill 协作」中，把「已加载技能 / 调用过 sub-agent」扩为：

```markdown
原生 PPTX/设计能力 = 会话中**已客观存在且可直接调用**的外部能力载体：已加载的设计/PPT 技能、已定义的 agent、已安装插件的技能、已连接且授权可用的设计类 MCP 工具。
排除：263group-brand-guidelines 本身（品牌数据层）、你的代码能力（python-pptx 等）、通用代码执行类 MCP/工具（仍是代码能力伪装）。
agent 不能中途搜索/加载新插件/MCP/agent（安装/连接是用户侧配置动作）；Q4「搜索设计技能」= 扫描可用能力列表，扫不到走回退话术。
```

- [ ] **Step 2: 复杂溢出判据按载体分流（#12）写入**

在「图片素材缩放规则」或「PPT 输出路径」补一条：

```markdown
**复杂溢出判据（改写时字号放大，按载体分流）：**
- PPTX：改动只落 1 个文本框且不重叠 → agent 调整框尺寸/位置；重叠或跨元素联动（牵动图表/图片位置）→ 转设计 skill 或退回用户。
- HTML：不用「跨元素联动」信号（文档流自动 reflow）；只保留「不重叠」判断用于绝对定位/定高容器（封面标题/Logo 安全区/定高卡片）；正常流元素 agent 直接处理。
```

- [ ] **Step 3: R3 标注仅 HTML（#13）**

确认 R3 话术行标注「仅 HTML」；PPTX 默认演示文稿不问 R3（Task 1 话术表已含，此处核对无遗漏引用）。

- [ ] **Step 4: 绿/渐变措辞核对（#7/#8）**

全文档 grep「绿」「渐变」措辞，与 Task 2 换色映射表一致（负向绿保留语义、封面禁红底、内容页品牌红渐变可用）。清除与「非图表绿→灰或品牌红」「渐变禁大面积红」旧措辞的矛盾。

- [ ] **Step 5: grep 验证**

Run: `grep -nE "已客观存在且可直接调用|复杂溢出判据|仅 HTML|负向/失败绿保留|封面禁红底" .claude/skills/263group-brand-guidelines/SKILL.md`
Expected: 全部命中。

- [ ] **Step 6: Commit**

```bash
git add .claude/skills/263group-brand-guidelines/SKILL.md
git commit -m "feat: 改写功能 — SKILL.md 现有章节修订（设计能力判定扩宽/复杂溢出分流/R3 仅 HTML/绿渐变措辞）"
```

---

## Task 4: brand-check-html.py 新建 + 集成

**Files:**
- Create: `brand-check-html.py`
- Modify: `.claude/skills/263group-brand-guidelines/pptx-python-guide.md` 不需要（HTML 无对应 guide）；如需在 SKILL.md「验收 / 校验」注明用法

**Interfaces:**
- Consumes: `brand-tokens.json`（colorSchemes/semantic/chartPalette 白名单）、`ad-compliance.json`（不涉及）
- Produces: `python brand-check-html.py <file.html> [--external]` —— 校验通过 exit 0，任一违规 exit 1 并打印违规位置

- [ ] **Step 1: 实现 brand-check-html.py**

新建 `brand-check-html.py`（**以既有 `brand-check-pptx.py` 为结构模板**——同样的白名单构建、颜色归一化、`--external` 参数、`print` 违规明细 + `sys.exit(1)` 模式）。必须实现以下函数与行为，无占位：

- `build_whitelist(tokens)` → set[str]：从 `brand-tokens.json` 构建小写 hex 白名单 = 当前 `colorScheme`（`pages` 或默认 `group-red`）的 colorSchemes 9 色 + `semantic` 子容器值 + `chartPalette[colorScheme].series[].hex` + `.muted[].hex` + `.distinctReds[].hex`（同 brand-check-pptx.py 白名单逻辑）。
- `normalize_color(s)` → str | None：把颜色字符串归一为小写 hex。支持 hex `#RGB`/`#RRGGBB`/`#RRGGBBAA`（AA 视同无色差只取前 6 位）、`rgb()/rgba()`（`rgba(...,0)` 透明跳过）、`hsl()/hsla()`（转 hex，alpha=0 跳过）、CSS 命名色（至少覆盖 white/black/transparent/gray/silver/red 等常见值；未知命名色返回 None 视为无法判定 → 走检查逻辑报违规）。归一化失败的写法 → 不进入白名单比对但记 warning。
- `extract_colors(html)` → list[tuple[color, lineno, snippet]]：用正则提取所有颜色来源——`style="..."` 属性内 `color:`/`background:`/`background-color:`/`border-color:`/`fill:`/`stroke:` 等、`<style>` 块内 CSS 声明、SVG 的 `fill=`/`stroke=`/`stop-color=` 属性、`<font color="...">`。逐条带行号与上下文片段，供报错定位。
- `check_whitelist(html)` → list[str]：返回违规明细（每个「文件行号：色值，不在白名单」）。空 = 通过。
- `check_font_external(html)` → list[str]：扫描所有 `font-family` 声明（style 属性 + `<style>` 块），命中 `微软雅黑` 或 `Microsoft YaHei` → 违规明细。
- `check_images_embedded(html)` → list[str]：扫描 class 含 `logo-color-img`/`logo-white-img`/`slogan-img`/`red-template-bg`/`themed-fallback-bg` 的元素，其 `background: url(...)` 必须是 `data:image/` base64；外部 `http(s)`/文件路径 → 违规明细。
- `check_end_last(html)` → list[str]：若存在 `.slide-page` 元素，最后一个 `.slide-page` 必须含 `.slogan-img`（结尾页）；否则违规明细。无 `.slide-page` 则跳过（非 generate.js 产物）。
- `main()`：`argparse` 解析 `file`（必填）+ `--external`（对外展示标志）。依次跑 check_whitelist → check_font_external（仅 --external）→ check_images_embedded → check_end_last；任一有违规 → 打印全部违规明细 + `sys.exit(1)`；全部通过 → `print('HTML brand check OK')` + `sys.exit(0)`。

> 诚实边界（写进脚本 docstring）：红底文字=白 的几何相交判定 HTML 侧不做（HTML 布局流式、几何判定不可靠，同 pptx §9.2 的说明），靠颜色白名单 + SKILL.md 自查清单兜底。

- [ ] **Step 2: 集成进验收流程（SKILL.md）**

在「改写功能 → 验收 / 校验」注明：

```markdown
HTML 改写输出若为自有路径（走 generate.js 或脚本改写），生成动作末尾必须调用 `python brand-check-html.py <file.html> [--external]`，不通过 exit 1 不交付（交付断言）；设计 skill 产出路径作后置检具 + 清单人工核对。
```

- [ ] **Step 3: 样例验证**

写 `测试记录/_rewrite-check.json`：

```json
{
  "colorScheme": "group-red",
  "logoSet": "group",
  "scene": "template",
  "companyName": "二六三网络通信股份有限公司",
  "slides": [
    { "type": "cover", "title": "改写校验", "presenter": "张三", "department": "品牌部", "date": "2026-08-24" },
    { "type": "content", "title": "内容页", "blocks": [ { "heading": "标题", "body": "正文" } ] },
    { "type": "end" }
  ]
}
```

Run: `node generate.js 测试记录/_rewrite-check.json` → `python brand-check-html.py 测试记录/_rewrite-check.html`（**工作汇报/内部样例不加 `--external`**——内部用微软雅黑栈，`--external` 必拦；`--external` 只用于对外展示开源栈样例，另渲染 `scene` 省略的 themed 样例验证）→ exit 0
再手改 `_rewrite-check.html` 一处颜色为自造色（如 `#123456`）→ 同命令 → exit 1 且报「行号：色值不在白名单」
Expected: 合规过、违规拦。检查后 `rm -f 测试记录/_rewrite-check.json 测试记录/_rewrite-check.html`。

- [ ] **Step 4: Commit**

```bash
git add brand-check-html.py .claude/skills/263group-brand-guidelines/SKILL.md
git commit -m "feat: 改写功能 — brand-check-html.py HTML 校验器（颜色白名单/对外禁微软雅黑/图片内嵌/结尾页最后）+ 集成验收"
```

---

## Task 5: 文档同步（CLAUDE.md / README / 开发日志 / Design-Decision）+ zip 重建

**Files:**
- Modify: `CLAUDE.md`（本地 untracked）
- Modify: `README.md`
- Modify: `开发日志.md`（本地 untracked）
- Modify: `Design-Decision.md`（本地 untracked）
- Run: `测试记录/build-skill-zip.py`

**Interfaces:**
- Consumes: Task 1-4 全部 SKILL.md / brand-check-html.py 结果
- Produces: 关联文档一致 + zip 重建

- [ ] **Step 1: CLAUDE.md 补改写功能概述 + 设计能力判定扩宽 + 复杂溢出判据 + 阅读打印默认值**

在「关键约定」补改写分支要点（任务类型×场景矩阵、用途驱动、R1-R6 话术存在、封面分层决策表、brand-check-html.py、docx/xlsx 排除）。

- [ ] **Step 2: README.md 功能说明补改写**

在「它能做什么」补「改写已有文件：保留排版，套用品牌（换色/换 Logo/对齐规范）」。

- [ ] **Step 3: 开发日志追加26**

记录 Phase 2 改写功能落地（任务类型×场景矩阵 / R1-R6 话术 / 封面分层决策表 / brand-check-html.py / 评估 14 项落点）。

- [ ] **Step 4: Design-Decision 决策记录**

新增「改写功能（Phase 2）决策记录」：任务类型识别不量化、用途驱动焊死默认值、封面分层四情形、复杂溢出按载体分流、设计能力判定载体扩宽、brand-check-html.py 前置（采纳 Trae 理由）、docx/xlsx 排除。

- [ ] **Step 5: 重建 zip**

Run: `python 测试记录/build-skill-zip.py`
Expected: `263group-brand-guidelines-<MMDD>.zip`（22 文件，含 brand-check-html.py + 更新后的 SKILL.md/README），自包含校验全 OK。解压抽查 SKILL.md 含「改写功能」。

- [ ] **Step 6: Commit**

```bash
git add -A  # README.md 若跟踪；CLAUDE.md/开发日志/Design-Decision 若 untracked 则跳过
git commit -m "docs: 改写功能 — CLAUDE/README/开发日志/Design-Decision 同步 + zip 重建"
```

---

## Task 6: 端到端验证（改写样例 + brand-check-html 实测 + 浏览器实测）

**Files:**
- Test: 新建临时 `测试记录/verify-rewrite-*.json` + `测试记录/verify-rewrite-*.html` + 一个改写用样例文件（验证后删除）

**Interfaces:**
- Consumes: Task 1-5 全部
- Produces: 验证报告（可覆盖）

- [ ] **Step 1: 改写样例验证（工作汇报 · 投屏演示）**

用 Task 4 Step 3 的 `_rewrite-check.json`（`scene:"template"` + 结尾页）重建：`node generate.js 测试记录/_rewrite-check.json` 渲染 → `python brand-check-html.py 测试记录/_rewrite-check.html`（不加 `--external`，理由见 Task 4 Step 3）通过（exit 0）；翻页/缩放浏览器实测（见 Step 3）。

- [ ] **Step 2: 改写样例验证（阅读/打印）**

验证 SKILL.md 规则自洽：阅读/打印 → 保留原封面仅品牌元素替换、保持原字号、封面分层硬规则覆盖默认（grep 确认 SKILL.md 措辞无「不适用=删除封面」歧义）。

- [ ] **Step 3: 浏览器实测**（项目硬性要求）

打开生成 HTML：窗口缩放 / 翻页遍历 / 封面红底正常 / 结尾页最后 / 控制台无 ASCII 相关报错。

- [ ] **Step 4: 清理验证产物**

```bash
rm -f 测试记录/verify-rewrite-* 测试记录/_rewrite-check.*
```

- [ ] **Step 5: 最终 git 状态确认**

Run: `git status --short`
Expected: 干净（除本地 untracked 文档）。

---

## 后续（本计划之外）

- **token 优化重新评估**——Phase 2 落地后重新量化 SKILL.md 体积再定方案（旧方案 A/B/C 暂缓）。
- **brand-restyle-pptx.py**——PPTX 批量改写脚本，后置。
- **跨工具复测**——zip 加载 + 改写交互 + brand-check-html 在 Workbuddy/Trae 实测。
- **发布**——用户要求发布时 `测试记录/build-skill-zip.py --version 1.1.0` 产出 `263group-brand-guidelines-v1.1.0.zip`。
