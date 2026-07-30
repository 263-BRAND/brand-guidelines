# 263 VI PPT 模板系统 — 项目进度

**更新：2026-07-30**

---

## 已完成

### 基础设施

| 文件 | 用途 | 状态 |
|------|------|:--:|
| `vi-tokens.json` | 双色板（集团红 #D0121B / 商务蓝 #1677FF）、字体层级、背景系统、Logo 路径 | ✓ |
| `schema.json` | 6 种页面类型字段定义（cover / section / content / cards / timeline / end） | ✓ |
| `agent-prompt.md` | Agent 使用指令：规则、可用类型、数据流 | ✓ |
| `.gitignore` | 排除视觉参考、.claude、node_modules、screenshots | ✓ |

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

### 路径 A 渲染器需要改进

- [ ] **排版不够专业** — 当前生成的内页过于简陋，缺少装饰元素、层次感、间距精细度
- [ ] **缺少布局变体** — 每种页面类型只有一套固定布局，没有竖版/分栏/左图右文等变体
- [ ] **cards 卡片视觉效果弱** — 需要更丰富的卡片样式（阴影、悬停、图标背景色等）
- [ ] **timeline 缺少视觉层次** — 左右交替、图片节点、年份标签等

### 路径 B VI 应用器需要打磨

- [ ] **边界情况处理** — 嵌套 CSS、内联 style 中的颜色、JavaScript 动态注入的元素
- [ ] **深色背景 Logo 自动反白** — 目前未做自动检测
- [ ] **颜色映射表扩展** — 覆盖更多常见非标准色值

### 资产和配置待补充

- [ ] **商务蓝衍生色值** — 亮蓝/暗蓝/浅蓝背景目前是推算值，需官方确认
- [ ] **云通信 Logo 反白稿** — 只有彩稿（.png），缺白色版本（.svg）

### 功能扩展

- [ ] **路径 B 正式命名和文档** — vi-apply.js 目前是验证原型，需要整理参数和用法说明
- [ ] **两路径统一入口** — 考虑一个脚本整合 generate.js 和 vi-apply.js
- [ ] **错误处理增强** — 非法 JSON 结构时给出明确的错误信息（而非 Node.js 堆栈）

### Phase 2（待规划）

- [ ] 扩展到全部 12 种页面类型（新增 comparison / data / chart / team / org-chart / contact）
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
