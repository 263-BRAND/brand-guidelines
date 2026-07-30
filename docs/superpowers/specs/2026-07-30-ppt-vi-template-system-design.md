# 263 VI 规范 PPT 模板系统 — 设计文档

**日期：** 2026-07-30
**状态：** 设计完成，待审核

---

## 背景

传统 PPT 模板是人读、人用的。在 agent 时代，企业销售工具文档需要让员工的 agent 能调用和执行，不同部门、不同业务、不同场景都能产出视觉风格统一、正确展示公司信息的 PPT。

## 核心思路

**"只约束 VI，不限制布局。"**

- 我们交付的是一套 agent 可调的 VI 设计系统，不是固定页面模板
- Agent 负责内容策划和页面类型组合，VI 系统保证视觉一致性、公司信息的准确性
- 公司数据和 Logo 嵌入系统，agent 引用而不编造

## 三件套架构

```
用户 (自然语言 + 可选文档) → Agent → pages.json → 渲染器 → slides.html
                                ↑              ↑
                         agent-prompt.md   renderer.js
                         vi-tokens.json    (VI 硬编码)
                         company-data/
```

| 层 | 内容 | Agent 可见 | 人类可改 |
|----|------|:---:|:---:|
| VI 规范 | 色板、字体层级、Logo 路径 | ✓ | 品牌部 |
| 公司数据 | 简介、历程、产品名、股票代码等 | ✓ | 品牌部 |
| Agent 指令 | System Prompt，教 agent 用系统 | ✓ | — |
| 渲染器 | HTML 渲染器 + 播放壳 | ✗ | 开发者 |

## 色板

### 集团红 Group Red

| 角色 | 色值 | 名称 |
|------|------|------|
| 主色 | `#D0121B` | 263 红 |
| 亮红 | `#FE343F` | — |
| 暗红 | `#AC000A` | — |
| 点缀 | `#FF777F` | — |
| 深色文字 | `#2D3847` | — |
| 灰色 | `#595959` | — |
| 浅灰背景 | `#F2F2F2` | — |
| 白色 | `#FFFFFF` | — |
| 黑色 | `#000000` | — |

### 商务蓝 Business Blue

| 角色 | 色值 | 名称 |
|------|------|------|
| 主色 | `#1677FF` | 商务蓝 |
| 亮蓝 | `#4A9BFF` | 待确认 |
| 暗蓝 | `#0055CC` | 待确认 |
| 浅蓝背景 | `#E6F0FF` | 待确认 |
| 中性色 | 与集团红共享 | — |

## 字体层级

统一使用 **微软雅黑**，字号控制规则：

| 层级 | 字号 | 用途 |
|------|------|------|
| 封面标题 | 48px | 封面主标题 |
| 章节标题 | 36px | 分隔/过渡页 |
| 页面标题 | 32px | 每页标题区 |
| 副标题 | 24px | 二级标题 |
| 正文 | 20px | 段落内容，最小正文 |
| 辅助文字 | 16px | 图表标注、页码、脚注，绝对底线 |

**约束：font-size < 16px 渲染器拒绝渲染。**

## 页面 Schema（12 种类型）

| 类型 | 用途 | 适用场景 |
|------|------|----------|
| `cover` | 封面 | 所有 |
| `toc` | 目录/议程 | 销售、汇报 |
| `section` | 章节过渡页 | 所有 |
| `content` | 通用内容（标题+正文） | 所有 |
| `cards` | N 列卡片网格 | 公司、销售 |
| `timeline` | 时间轴/路线图 | 公司、汇报 |
| `comparison` | 对比表（竞品/方案） | 销售 |
| `data` | 关键数据大数字展示 | 所有 |
| `chart` | 图表（柱状/饼/折线） | 销售、汇报 |
| `team` | 人员/头像网格 | 公司 |
| `org-chart` | 组织架构树 | 公司 |
| `contact` | 联系方式/CTA | 销售 |
| `end` | 结束页 | 所有 |

Agent 自由组合页面类型，无固定模板限制。

## Agent 指令规则

1. 公司信息从 `company-data/` 引用，禁止编造
2. `colorScheme` 默认为 `group-red`，用户指定则用用户指定的
3. 禁止在 `pages.json` 中写入 CSS、颜色值、字号、位置信息
4. 用 `source`/`link` 字段引用数据源，而非硬编码内容
5. Logo 选择由渲染器根据背景色自动决定（深底反白、浅底彩稿）

## Logo 管理

Logo 内嵌在系统中，agent 和员工权限均为只读：

```
assets/logos/
├── group/standard.svg    # 集团彩稿
├── group/white.svg       # 集团反白稿
├── cloud/standard.png    # 云通信彩稿
└── cloud/white.svg       # 云通信反白稿（待制）
```

**封面页：** Logo 位置和大小不做限制，由 agent 根据设计需要自由决定。

**内页（除封面外的所有内容页）：** Logo 位置和大小固定，禁止 agent 修改。

| 参数 | 值 | 说明 |
|------|-----|------|
| 水平位置 | 距右边 ~80px | 右上角对齐 |
| 垂直位置 | 距顶部 ~46px | 基于 1920×1080 画布 |
| 大小 | ~113×113px | 约占画布宽 5.9%，正方形 |
| 安全间距 | 保持等比 | 随画布缩放 |

**选择逻辑：**

1. 渲染器根据背景色亮度自动判断（深底 → 反白，浅底 → 彩稿）
2. Agent 可在任意页面显式覆盖：`"logoStyle": "white"` 或 `"logoStyle": "color"`
3. 人类审阅 HTML 后如有审美判断差异，修改 `logoStyle` 字段重新渲染即可

## 公司数据

```
company-data/
├── profile-zh.md     # 公司简介长文本
├── facts.json        # 结构化事实（名称、股票代码、历程、愿景等）
└── products.json     # 产品信息
```

`facts.json` 中已锁定的信息：
- 公司全称、英文全称、简称
- 股票代码：002467、成立年份：1997
- 总部：北京
- 愿景、使命、宗旨、战略、价值观
- 发展历程关键节点

## 数据流示例

```
用户: "做云通信产品介绍PPT，商务蓝，包含产品矩阵和发展历程"
  → Agent 读取 vi-tokens.json + company-data/ + agent-prompt.md
  → Agent 推理: cover + data + cards(source: products.json) + timeline(source: facts.json) + end
  → Agent 输出 pages.json (colorScheme: business-blue)
  → 渲染器注入商务蓝色板 + 商务蓝 Logo + 播放壳
  → slides.html 在浏览器中播放，支持翻页笔/全屏
```

## 技术实现

- **渲染器：** 单文件 JS，读取 `pages.json` + `vi-tokens.json`，输出完整 `slides.html`
- **播放壳：** 内置全屏切换、键盘翻页（PageUp/PageDown/方向键/空格）、点击翻页、翻页笔兼容
- **输出格式：** HTML/CSS（Phase 1），未来扩展 .pptx 渲染器（Phase 2）
- **依赖：** 零外部依赖，纯 HTML/CSS/JS，浏览器直接打开

## 文件结构

```
263viForAgent/
├── vi-tokens.json              # VI 变量
├── schema.json                 # 页面类型字段定义
├── agent-prompt.md             # Agent 指令
├── company-data/
│   ├── facts.json
│   ├── products.json
│   ├── profile-zh.md
│   └── profile-en.md
├── assets/
│   └── logos/                  # Logo 文件
├── renderer/
│   └── renderer.js             # JSON → HTML 渲染器
├── examples/                   # 示例 pages.json + 输出
└── 视觉参考/                   # 原始参考文件（不入 git）
```

## 实现路径

**Phase 1（当前）：** HTML 渲染器 + 集团红 + 商务蓝 + 6 种核心页面类型（cover, section, content, cards, timeline, end）
**Phase 2：** 扩展到全部 12 种类型 + 可视化 pages.json 编辑器
**Phase 3：** .pptx 渲染器

## 待确认事项

- [ ] 商务蓝衍生色值（亮蓝/暗蓝/浅蓝背景）
- [ ] company-data/ 中的具体产品信息和历程节点
- [ ] Logo 反白稿 SVG 文件（商务蓝版本）
