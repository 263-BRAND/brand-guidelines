# 263 VI PPT 模板系统 — 项目进度

**更新：2026-08-10**

---

## 最新（2026-08-10 下午）

### Bugfix：vw→pt 单位修复

Code review 发现 Template 封面渲染器使用了 `vw` 单位，违反跨格式直出规则（必须 `pt`）。已修复：
- `cover.js` 回退 `pt` 单位，与 Themed 渲染器一致
- `generate.js` 恢复 CSS `transform: scale()` 缩放方案，pt 值在任意屏幕尺寸正确渲染

### 本轮提交（共 5 个）

```
5e3626a fix: revert to pt units in cover renderer, restore transform scaling
42ee178 fix: responsive player — replace fixed 1920x1080 with vw/vh, vw-based fonts
67de60a feat: add Template cover with ASCII heart logo, update VI skill spec
05afd0d docs: add Template cover spec to CONTEXT.md
2eac103 docs: update CONTEXT.md, PROJECT-STATUS.md, add skill.md entry point
```

---

## 2026-08-10 上午：Template 封面定稿 + 渲染器双模

### Template 封面设计完成

经过多轮迭代，Template（内部汇报）封面定稿：

- **浅灰背景**：品牌 lightGray `#F2F2F2`
- **ASCII 心形 Logo**：从集团红心 Logo 提取，36 行 monospace 字符，比例已校准（字符正方形 + 等距采样），品牌主色 `#D0121B`
- **居中排版**：标题 64pt，汇报人/部门 26pt，公司全称 22pt 底部居中
- **动画入场**：隔行左右穿插滑入（30ms 交错），标题 1.2s 后淡入
- **品牌色合规**：所有颜色从 brand-tokens.json 读取，不硬编码

### 渲染器双模支持

`renderer/slides/cover.js` 重构为双模：
- `scene: "template"` → ASCII 封面（浅灰底 + 居中排版）
- 默认（无 scene 或 themed）→ 红底渐变封面（左上角 Logo + 左对齐排版）

`pages.json` 示例：
```json
{ "scene": "template", "colorScheme": "group-red", "slides": [...] }
```

### 文档更新

- `skills/263-vi.md` — 新增"母版封面页"章节，完整规格表
- `CONTEXT.md` — Logo 规则表、硬规则表同步更新
- `skill.md` — 通用入口，供非 Claude Code 工具识别

### 打包分发

`skill-test-planB.zip` — 完整 skill 包（305KB），含 skill.md + skills/263-vi.md + brand-tokens.json + renderer/ + 截图

---

## 2026-08-07 进展：领域建模 + VI Skill 重构计划

### 关键设计决策

| 决策 | 旧 | 新 |
|------|----|----|
| 字号底线 | 16px | 20pt（75寸电视@5m实测） |
| 生成模式 | 无区分 | Template（母版型）/ Themed（主题型），Agent 特征推理 |
| 用户交互 | 用户需了解 skill 才能用 | 透明声明："我将按XX模式制作，如用于YY请告诉我" |
| 产品结构 | 3板块×简易列表 | 3板块×4业务线×N产品能力（讲义稿真实数据） |
| 输入处理 | VI skill 自行解析 | 外部 Agent 调 MCP/工具 → 归一化后送入管线 |
| Logo 切换 | 仅集团/云通信二选一 | 品牌上下文：共享框架 + Logo 按业务线覆盖 |

---

## 设计框架

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
| `brand-tokens.json` | 品牌视觉规范（含 canvas 尺寸、html/pptx 双字体层级） | ✓ |
| `company-data.json` | 公司信息（合并 company-data/） | ✓ |
| `design-skill-recommendations.json` | 平台设计 skill 推荐 | ✓ |
| `skills/263-vi.md` | 主 skill 文件（2×2 路径矩阵 + 母版封面规格） | ✓ |
| `skill.md` | 通用入口（非 Claude Code 工具兼容） | ✓ |
| `CONTEXT.md` | 领域模型 + 母版封面规格 | ✓ |
| `PROJECT-STATUS.md` | 本文件 | ✓ |

### 兜底渲染器

| 文件 | 用途 | 状态 |
|------|------|:--:|
| `generate.js` | 渲染器入口 | ✓ |
| `renderer/slides/cover.js` | 封面（Template ASCII + Themed 渐变双模） | ✓ |
| `renderer/slides/section.js` | 章节过渡页 | ✓ |
| `renderer/slides/content.js` | 通用内容页 | ✓ |
| `renderer/slides/cards.js` | 卡片网格 | ✓ |
| `renderer/slides/timeline.js` | 时间轴 | ✓ |
| `renderer/slides/end.js` | 结束页（居中 Logo + slogan PNG） | ✓ |

### 资产

| 文件 | 用途 | 状态 |
|------|------|:--:|
| `assets/logos/logo-group-color.png` | 集团红心 Logo | ✓ |
| `assets/logos/logo-group-white.png` | 集团反白 Logo | ✓ |
| `assets/logos/logo-cloud-color.png` | 云通信蓝 Logo | ✓ |
| `assets/slogan.png` | Slogan 图片 | ✓ |
| `template-cover-1920x1080.png` | Template 封面截图 | ✓ |

### 分发

| 文件 | 用途 | 状态 |
|------|------|:--:|
| `skill-test-planB.zip` | 完整 skill 包（305KB） | ✓ |

---

## 已验证

| 路径 | 状态 | 备注 |
|------|:----:|------|
| 路径 B × Themed | ✓ 通过 | Q3 报告 v2/v3，frontend-design skill 排版 |
| 路径 A × Themed | 未测 | 需外部设计 skill |
| 路径 A × Template | 未测 | 需用 generate.js 跑完整流程 |
| 路径 B × Template | 未测 | 需测试 scene: template 切换 |

---

## 待做

- [ ] 路径 A 从零生成完整测试
- [ ] PPTX 原生输出（非截图方案）
- [ ] 商务蓝色值官方确认
- [ ] 合并到 main 分支
- [ ] 多格式打包（.skill for Claude Code, .zip+instructions.md for ChatGPT, .cursorrules for Cursor 等）
