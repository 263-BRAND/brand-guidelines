# 263 VI PPT 模板系统 — 项目进度

**更新：2026-07-30**

---

## 设计框架

详细设计文档：`docs/superpowers/specs/2026-07-30-ppt-vi-template-system-design.md`

### 核心思路

**"品牌数据层，不是渲染引擎。"** — VI skill 是 263 品牌数据的唯一真相源。内容策划交给 LLM，排版渲染交给设计 skill。VI skill 只输出 brand-tokens.json + company-data.json。

### 三条路径

```
用户需求
├── 有设计 skill → VI skill 输出品牌数据 → 设计 skill 专业排版
└── 无设计 skill → VI skill 输出品牌数据 → 兜底渲染器生成 HTML + 升级建议
```

**路径 A：pages.json → generate.js → slides.html**
- Agent 根据需求写出 `pages.json`（结构化内容，不含样式）
- 渲染器注入 VI 色板/字体/Logo/播放壳
- 适合从零开始、或只有内容提纲的场景

**路径 B：已有 HTML → vi-apply.js → VI 版 HTML**
- 读入任意已排版的 HTML PPT
- 替换颜色/字体为 VI 规范，注入 Logo
- 不改变布局、字号、位置、动画
- 适合已有高质量排版、只需统一视觉风格的场景

**路径 C：pages.json → .pptx 渲染器（Phase 3，待规划）**

### 三层数据体系

| 层 | 内容 | Agent 可见 | 人可改 |
|----|------|:---:|:---:|
| VI 规范 (`vi-tokens.json`) | 色板、字体层级、背景选项、Logo 路径 | ✓ | 品牌部 |
| 公司数据 (`company-data/`) | 简介、历程、产品、股票代码等 | ✓ | 品牌部 |
| Agent 指令 (`agent-prompt.md`) | System Prompt，教 agent 用系统 | ✓ | — |
| 渲染器 (`generate.js` / `vi-apply.js`) | HTML 渲染 + 播放壳 | ✗ | 开发者 |

---

## 已完成

### 基础设施

| 文件 | 用途 | 状态 |
|------|------|:--:|
| `vi-tokens.json` | 双色板（集团红 #D0121B / 商务蓝 #1677FF）、字体层级、背景系统、Logo 路径 | ✓ |
| `schema.json` | 6 种页面类型字段定义（cover / section / content / cards / timeline / end） | ✓ |
| `agent-prompt.md` | Agent 使用指令：规则、可用类型、数据流 | ✓ |
| `.gitignore` | 排除视觉参考、.claude、node_modules、screenshots | ✓ |
| `brand-tokens.json` | 品牌视觉规范（替代 vi-tokens.json） | ✓ |
| `company-data.json` | 公司信息（合并 company-data/） | ✓ |
| `design-skill-recommendations.json` | 平台设计 skill 推荐 | ✓ |
| `skills/263-vi.md` | Claude Code VI skill 文件 | ✓ |

### 渲染器（路径 A：从 pages.json 生成 PPT）

| 文件 | 用途 | 状态 |
|------|------|:--:|
| `generate.js` | 渲染器入口：读取 pages.json → 输出自包含 slides.html | ✓ |
| `renderer/slides/cover.js` | 封面页渲染 — 自由背景、自由 Logo 布局 | ✓ |
| `renderer/slides/section.js` | 章节过渡页 — 大号编号 + 标题 + 分割线 | ✓ |
| `renderer/slides/content.js` | 通用内容页 — 标题 + 文本段落 | ✓ |
| `renderer/slides/cards.js` | 卡片网格 — N 列图标卡片 | ✓ |
| `renderer/slides/timeline.js` | 时间轴 — 年份节点 + 描述 | ✓ |
| `renderer/slides/end.js` | 结束页 — 居中 Logo + slogan PNG | ✓ |

**渲染器特性：**
- 播放壳：全屏/键盘翻页/翻页笔/点击翻页（PageDown/方向键/Space/点击）
- Logo 自动深底反白切换
- 背景系统：封面 4 选项，内页限定白/浅灰
- 字号硬约束 < 16px 拒绝
- 零外部依赖，输出单一 HTML 文件

### VI 应用器（路径 B：已有 HTML 一键换 VI）

| 文件 | 用途 | 状态 |
|------|------|:--:|
| `vi-apply.js` | 读入任意 HTML PPT → 替换色值/字体 → 注入 Logo → 输出 VI 版 | ✓ 初版可用 |

**已验证：** 15 页 PPT 测试文件，布局/字号/位置完全保留，仅色值+字体+Logo 变更。

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
| `docs/superpowers/specs/2026-07-30-ppt-vi-template-system-design.md` | 设计文档 | ✓ |
| `docs/superpowers/plans/2026-07-30-ppt-vi-template-system-plan.md` | 实现计划 | ✓ |

---

## 待继续 / 未完成

- [ ] **补全设计 skill 推荐列表** — 调研 Codex / Trae 平台可用的设计 skill，填入 design-skill-recommendations.json
- [ ] **设计 skill 调研** — 确认各平台最适合的 PPT/设计 skill

### 资产和配置待补充

- [ ] **商务蓝衍生色值** — 亮蓝/暗蓝/浅蓝背景目前是推算值，需官方确认
- [ ] **云通信 Logo 反白稿** — 只有彩稿（.png），缺白色版本（.svg）

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
├── generate.js          ← 路径 A 入口
├── vi-apply.js          ← 路径 B 入口
├── vi-tokens.json
├── schema.json
├── agent-prompt.md
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
