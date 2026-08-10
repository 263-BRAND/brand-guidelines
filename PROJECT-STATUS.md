# 263 VI PPT 模板系统 — 项目进度

**更新：2026-08-10**

---

## 2026-08-10 进展：bug 修复 + 品牌规则收紧 + ASCII 封面

### 修复

- **flex 压缩 bug**：`generate.js` — `#player` 缺 `flex-shrink:0`，视口 < 1920px 时 flex + JS scale 造成双重压缩。修复后播放器宽度正常。
- **正文色 bug**：`content.js` 正文用 `c.dark`（标题色），改为 `c.gray`。

### 品牌规则更新

| 规则 | 旧 | 新 |
|------|----|----|
| 背景系统 | 封面4选项 / 内页2选项 | 全部白色 |
| 正文颜色 | 无明确规则 | 标题=dark、正文=gray、强调=primary，禁止纯黑 |
| ASCII 字符画 | 无 | 存入 brand-tokens.json，禁止 AI 自生成 |

### ASCII 封面 Logo

- 263 心形 Logo 的 ASCII 字符画存入 `brand-tokens.json` → `coverAscii.art`
- 每行独立 `<span>` + JS `setTimeout` 逐行交错动画（奇数行左滑入、偶数行右滑入）
- 参数可调：`scaleX`(比例) + `overallScaleX/Y`(整体大小)，调至与真实 Logo 视觉一致
- 字号豁免：ASCII 装饰图形不受 16px 底线约束（`typography.asciiArt.exemption`）

### 文件清理

- 删除冗余 `skills/263-vi.md`，唯一真相源：`.claude/skills/263-vi/SKILL.md`
- 删除旧 VI skill 安装（`.claude/skills/263-vi/` 已移除，当前无安装）

### Code review 教训

- 渲染器 review 不能只读代码，必须浏览器实测：窗口缩放、翻页遍历、背景模式切换

---

## 2026-08-07 进展：领域建模 + VI Skill 重构计划

### 领域建模完成

通过 `/grill-with-docs` 会话，建立了两个限界上下文的领域模型：

- **品牌规范上下文** — 色彩、字体层级、Logo 规则、企业概况、产品组合（四层结构）
- **Agent 管线上下文** — Template/Themed 双模式、路径 A/B × Template/Themed 2×2 矩阵、skill 协作边界、输入格式分级

产出：`CONTEXT.md`（领域术语表），基于 263 集团业务介绍讲义（`视觉参考/`）提取的完整产品结构。

### 关键设计决策

| 决策 | 旧 | 新 |
|------|----|----|
| 字号底线 | 16px | 20pt（75寸电视@5m实测） |
| 生成模式 | 无区分 | Template（母版型）/ Themed（主题型），Agent 特征推理 |
| 用户交互 | 用户需了解 skill 才能用 | 透明声明："我将按XX模式制作，如用于YY请告诉我" |
| 产品结构 | 3板块×简易列表 | 3板块×4业务线×N产品能力（讲义稿真实数据） |
| 输入处理 | VI skill 自行解析 | 外部 Agent 调 MCP/工具 → 归一化后送入管线 |
| Logo 切换 | 仅集团/云通信二选一 | 品牌上下文：共享框架 + Logo 按业务线覆盖 |

### 实现计划

`docs/superpowers/plans/2026-08-07-vi-skill-align-context.md` — 6 个任务对齐 CONTEXT.md 设计树：

1. brand-tokens.json — 字体层级修正
2. brand-tokens.json — Logo+硬规则扩展
3. company-data.json — 产品四层结构重写
4. skills/263-vi.md — 核心工作流重写（双模式+2×2+透明声明）
5. CONTEXT.md — 权威数据源引用
6. 全量一致性验证

**状态：计划已写，待用户指令执行。**

---

## 设计框架

详细设计文档：`docs/superpowers/specs/2026-07-30-ppt-vi-template-system-design.md`

### 核心思路

**"品牌数据层，不是渲染引擎。"** — VI skill 是 263 品牌数据的唯一真相源。内容策划交给 LLM，排版渲染交给设计 skill。VI skill 只输出 brand-tokens.json + company-data.json。

### 两条路径 × 两种模式

```
用户需求
├── 路径 A（从零生成）
│   ├── Template → AGENT 按母版填空，全硬规则锁死
│   └── Themed  → AGENT + 设计 skill 从零创作
└── 路径 B（改写已有）
    ├── Template → 已有文件对齐母版规范
    └── Themed  → 已有文件 + 设计 skill 重设计
```

详细路径选择逻辑见 `CONTEXT.md` 和 `skills/263-vi.md`。

### 三层数据体系

| 层 | 内容 | Agent 可见 | 人可改 |
|----|------|:---:|:---:|
| 品牌视觉 (`brand-tokens.json`) | 色板、字体层级、背景选项、Logo 路径 | ✓ | 品牌部 |
| 公司数据 (`company-data.json`) | 简介、历程、产品、股票代码等 | ✓ | 品牌部 |
| 品牌指令 (`skills/263-vi.md`) | Skill 文件，教 agent 用品牌数据 | ✓ | — |
| 平台 skill 推荐 (`design-skill-recommendations.json`) | 平台 → 设计 skill 映射 | ✓ | 开发者 |
| 兜底渲染器 (`generate.js`) | HTML 渲染 + 播放壳（仅无设计 skill 时） | ✗ | 开发者 |

---

## 已完成

### 基础设施

| 文件 | 用途 | 状态 |
|------|------|:--:|
| `.gitignore` | 排除视觉参考、.claude、node_modules、screenshots | ✓ |
| `brand-tokens.json` | 品牌视觉规范（替代 vi-tokens.json） | ✓ |
| `company-data.json` | 公司信息（合并 company-data/） | ✓ |
| `design-skill-recommendations.json` | 平台设计 skill 推荐 | ✓ |
| `skills/263-vi.md` | Claude Code VI skill 文件 | ✓ |

### 兜底渲染器（无设计 skill 时，从 pages.json 生成 HTML）

| 文件 | 用途 | 状态 |
|------|------|:--:|
| `generate.js` | 渲染器入口：读取 pages.json → 输出自包含 slides.html | ✓ |
| `renderer/slides/cover.js` | 封面页渲染 — 自由背景、自由 Logo 布局 | ✓ |
| `renderer/slides/section.js` | 章节过渡页 — 大号编号 + 标题 + 分割线 | ✓ |
| `renderer/slides/content.js` | 通用内容页 — 标题 + 文本段落 | ✓ |
| `renderer/slides/cards.js` | 卡片网格 — N 列图标卡片 | ✓ |
| `renderer/slides/timeline.js` | 时间轴 — 年份节点 + 描述 | ✓ |
| `renderer/slides/end.js` | 结束页 — 居中 Logo + slogan PNG | ✓ |

**渲染器特性（兜底，仅无设计 skill 时使用）：**
- 定位：基础兜底模板，不做专业排版；专业排版交给设计 skill
- 播放壳：全屏/键盘翻页/翻页笔/点击翻页（PageDown/方向键/Space/点击）
- Logo 自动深底反白切换
- 背景系统：封面 4 选项，内页限定白/浅灰
- 字号硬约束 < 16px 拒绝
- 零外部依赖，输出单一 HTML 文件
- 不提供：设计装饰、复杂布局变体、悬停动效（由设计 skill 负责）

### VI 应用器（路径 B）— 已移除

路径 B 功能由设计 skill 替代。`vi-apply.js` 已删除；已有 HTML PPT 的视觉改造交给专业设计 skill，其读取 `brand-tokens.json` 统一色值/字体/Logo，布局由设计 skill 决定。

### 公司数据

| 文件 | 用途 | 状态 |
|------|------|:--:|
| `company-data/facts.json` | 公司名、股票代码、办公地址、品牌理念、23 条发展历程 | ✓ 官网核对完成 |
| `company-data/products.json` | 三大业务线：全球网络 / 智能通信 / 数字服务 | ✓ |
| `company-data/profile-zh.md` | 公司简介长文本 | ✓ |
| `company-data/profile-en.md` | 英文简介 | ✓ 基础版 |

### 资产

| 文件 | 用途 | 状态 |
|------|------|:--:|
| `assets/logos/logo-group-color.png` | 集团红心 Logo | ✓ |
| `assets/logos/logo-group-white.png` | 集团反白 Logo | ✓ |
| `assets/logos/logo-cloud-color.png` | 云通信蓝 Logo | ✓ |
| `assets/slogan.png` | 「连接世界 沟通你我」固定字体设计 | ✓ |

### 示例

| 文件 | 用途 | 状态 |
|------|------|:--:|
| `examples/sample-pages.json` | 8 页示例 PPT（公司简介场景） | ✓ |
| `examples/ai-tools-pages.json` | 13 页示例 PPT（AI 工具心得，真实内容测试） | ✓ |

### 文档

| 文件 | 用途 | 状态 |
|------|------|:--:|
| `docs/superpowers/specs/2026-07-30-ppt-vi-template-system-design.md` | Phase 1 设计文档 | ✓ |
| `docs/superpowers/plans/2026-07-30-ppt-vi-template-system-plan.md` | Phase 1 实现计划 | ✓ |
| `docs/superpowers/specs/2026-07-31-vi-skill-redesign.md` | VI skill 重构设计文档 | ✓ |
| `docs/superpowers/plans/2026-07-31-vi-skill-refactor.md` | VI skill 重构实现计划 | ✓ |

---

## 已验证

### 路径 B：已有 HTML 改写 VI ✓

已用 `8-AI工具心得-杜鸣-V8.html`（14 页，真实工作内容）验证完整链路：
1. VI skill 确认品牌参数 → 输出 brand-tokens.json
2. frontend-design skill 指导排版（响应式、字体层级、卡片设计）
3. Logo base64 嵌入、安全区无遮挡、结尾页 VI 规范格式
4. 色值精确替换（#D0111B → #D0121B）、CSS 变量统一管理

**结论：路径 B 已验证通过。** 已有 HTML PPT 可通过 VI skill + frontend-design 快速统一品牌视觉。

### 路径 A：从零生成 → 待测试

需用真实需求（如"做一份云通信产品介绍PPT"）测试完整流程：LLM 策划内容 → pages.json → 设计 skill 排版。

---

## 待继续 / 未完成

- [ ] **执行 VI skill 重构计划** — `docs/superpowers/plans/2026-08-07-vi-skill-align-context.md`，6 个任务
- [ ] **路径 A 从零生成测试** — 用真实业务场景（如"云通信产品介绍"）端到端测试
- [x] **Claude Code 设计 skill 调研** — 确认 `frontend-design` 优于 `ui-ux-pro-max`，已填入 design-skill-recommendations.json
- [x] **Logo 安全区规则** — 已写入 skills/263-vi.md：Logo 周围禁止装饰元素遮挡
- [x] **产品结构细化** — 从集团介绍讲义提取，3板块×4业务线×N产品能力，写入 CONTEXT.md
- [x] **领域建模** — CONTEXT.md 已创建，两个限界上下文 + 完整设计树

### 资产和配置待补充

- [ ] **商务蓝衍生色值** — 亮蓝/暗蓝/浅蓝背景目前是推算值，需官方确认
- [ ] **云通信 Logo 反白稿** — 文件 `视觉参考/logo-云通信-白.png` 已存在，待放入 `assets/logos/`

### 功能扩展

- [ ] **错误处理增强** — 非法 JSON 结构时给出明确的错误信息（而非 Node.js 堆栈）

### 待调研

- [ ] **Web chatbot 适配** — 当前系统依赖 Node.js 命令行，纯 web chatbot（ChatGPT 等）无法调用。需评估：
  - 方案：将 `generate.js` 逻辑搬到前端页面，chatbot 输出 pages.json → 粘贴到页面 → 浏览器端渲染 → 预览/下载
  - 工作量：generate.js 核心逻辑改写为前端 JS（处理 base64 图片嵌入） + 一个静态页面
  - 是否需要？什么时候做？待决定

### Phase 2（待规划）

- [ ] 可视化 pages.json 编辑器
- [ ] 内页布局变体（左文右图 / 上文下图 / 分栏 / 大数字 + 描述等）

### Phase 3（待规划）

- [ ] .pptx 渲染器

---

## 当前项目结构

```
263viForAgent/
├── CONTEXT.md                ← 领域模型（两个限界上下文）
├── generate.js              ← 兜底渲染器入口（仅无设计 skill 时）
├── brand-tokens.json        ← 品牌视觉规范（色板/字体/Logo/背景）
├── company-data.json        ← 公司信息（合并 facts + products）
├── design-skill-recommendations.json ← 平台设计 skill 推荐
├── skills/
│   └── 263-vi.md            ← VI skill 文件（品牌数据层入口）
├── company-data/
│   ├── facts.json
│   ├── products.json
│   ├── profile-zh.md
│   └── profile-en.md
├── assets/
│   ├── logos/
│   │   ├── logo-group-color.png
│   │   ├── logo-group-white.png
│   │   └── logo-cloud-color.png
│   └── slogan.png
├── renderer/
│   └── slides/
│       ├── cover.js
│       ├── section.js
│       ├── content.js
│       ├── cards.js
│       ├── timeline.js
│       └── end.js
├── examples/
│   ├── sample-pages.json / .html
│   └── ai-tools-pages.json / .html
├── docs/
│   └── superpowers/
│       ├── specs/ (设计文档)
│       └── plans/ (实现计划)
└── 视觉参考/ (不入 git)
```

## Git 历史

```
a6ec19d fix: recommend frontend-design over ui-ux-pro-max for Claude Code
5261f89 docs: reconcile PROJECT-STATUS — remove stale references to deleted files
9f0e56e fix: guard missing white logo variant in generate.js
534f399 docs: update project status to reflect VI skill refactoring
bfeee91 refactor: remove vi-tokens.json — replaced by brand-tokens.json
ee49245 refactor: remove deprecated files — replaced by brand data layer + design skill delegation
025b69c fix: read brand-tokens.json, hardcode slide dimensions in renderers
04a4ff5 feat: add 263-vi skill (Claude Code VI spec entry point)
44b70e9 feat: add design-skill-recommendations.json platform skill mapping config
9f15685 feat: merge company facts and products into single company-data.json
b973662 feat: add brand-tokens.json (brand visual data, slide dims removed)
--- Phase 1 ---
7904e06 feat: redesign end slide — centered logo + slogan, no text
b066118 feat: add slogan image to end slide
481c1eb chore: remove .claude/ from git tracking
0e025f1 chore: remove strategy field from company data
89084b7 feat: update products to three business lines, fix vision, remove values
e3518d9 feat: update company data from official website
4e206a8 feat: add background system — cover free choice, inner pages white/light-gray only
94351b0 fix: switch logo rendering from img+content to div+background-image
30f04b5 chore: remove temporary preview files
bf74fea feat: add agent-prompt.md and sample pages.json with verified output
a0d82d9 feat: add renderer core, player shell, and 6 slide type renderers
5349553 feat: add logo assets for group and cloud variants
e10bc3e feat: add schema.json and company data layer
2b0db08 feat: add vi-tokens.json with dual color schemes and typography
0bef567 plan: add Phase 1 implementation plan with 14 tasks
... (design docs)
```
