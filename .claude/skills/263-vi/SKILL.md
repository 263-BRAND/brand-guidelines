---
name: 263-vi
description: 263 品牌 VI 规范 — 提供品牌色板、字体、Logo 和公司数据。任何涉及 263 品牌输出的场景（PPT、网页、文档等）都应使用此 skill。
---

# 263 品牌 VI 规范

## 你的职责

当用户需要输出涉及 263 品牌的视觉内容（PPT 演示文稿、网页、宣传物料等），你必须：
1. 从品牌数据文件读取色值，不使用自己的颜色
2. 生成的内容引用 `brand-tokens.json` 和 `company-data.json`
3. 遵循品牌规范（字体、字号底线、Logo 位置）

## 品牌数据文件

| 文件 | 用途 | 必读 |
|------|------|:--:|
| `brand-tokens.json` | 色板、字体、Logo 路径、背景规则、ASCII 图 | 每次 |
| `company-data.json` | 公司名称、产品、发展历程等信息 | 按需 |
| `design-skill-recommendations.json` | 平台设计 skill 推荐 | 无设计 skill 时 |

## 核心品牌规则

### 色板

两套配色方案，通过 `colorSchemes` 选择：

- **集团红（group-red）**：主色 `#D0121B`，用于集团层面的 PPT 和对外物料（默认）
- **商务蓝（business-blue）**：主色 `#1677FF`，用于云通信产品线或技术导向的物料

每个配色方案包含 9 个色值：primary / primaryLight / primaryDark / accent / dark / gray / lightGray / white / black。所有颜色必须从 `brand-tokens.json` 读取，不自己发明。

### 正文颜色

三层文本色体系，严格对应，不得自由发挥：

| 文本层级 | 使用色值 | 用途 |
|----------|----------|------|
| 标题色 | `dark` (#2D3847) | 页面标题、卡片标题、章节标题 |
| 正文色 | `gray` (#595959) | 段落文本、描述、辅助信息 |
| 强调色 | `primary` (#D0121B 或 #1677FF) | 链接、标签、重点标记、分割线 |

**禁止使用纯黑 `#000000` 作为文本色。**

### 字体

- 字体：微软雅黑
- 绝对底线：font-size < 16px 不可用于文本内容。
- **唯一例外：** ASCII 字符画（封面 Logo 图）属于装饰图形，可低于 16px。字号和字体从 `brand-tokens.json` → `typography.asciiArt` 读取。

### Logo

- 集团 Logo：用于集团层面的物料（默认）
- 云通信 Logo：用于云通信产品线的物料
- 内页 Logo 固定在右上角（约 113×113px，距右 80px，距顶 46px，基于 1920×1080）
- 封面使用 ASCII 字符画替代 PNG Logo
- 深色背景 → 反白 Logo；浅色背景 → 彩稿 Logo
- **Logo 安全区：** Logo 周围必须保持干净，不得有任何装饰元素遮挡

### ASCII 字符画（封面 Logo 图）

- 封面页固定使用 `brand-tokens.json` → `coverAscii.art` 中存储的 ASCII 字符画
- **严禁 AI 自行生成或修改 ASCII 图。** 必须从 brand-tokens.json 原样读取并嵌入
- 渲染规则：
  - 使用 `<pre>` 标签 + `white-space: pre` + `font-family: monospace` 确保跨平台对齐
  - 每行独立 `<span class="ascii-line">`，偶数行左滑入、奇数行右滑入
  - JS `setTimeout(i × 30ms)` 逐行交错触发，全部完成后标题淡入
  - 每行去掉 15 个共同前导空格（`.substring(15)`），消除结构性右偏
  - 位置：`top:16%`，水平居中
  - 参数见 `brand-tokens.json` → `typography.asciiArt`
- **刷新重播：** 动效绑定 `.slide-page.active`，页面刷新自动重播

### 封面二进制雨（Geek 装饰）

- canvas 全屏 `01` 字符下落的 Matrix 风格动画
- 品牌主色字符，8% 极低透明度，不干扰正文
- 自动检测 `canvas[id^=binaryRain]` 并启动动画

### 封面双模式

- **Template（对内汇报）**：`pages.scene === 'template'` → 白色背景 + ASCII 字符画 + 二进制雨 + 居中排版
- **Themed（对外展示）**：默认 → 渐变/纯色背景 + 左上 PNG Logo + 左对齐排版
- 封面背景选项（Themed）：primary-gradient / primary-solid / dark-solid / white

### 背景系统

- 内页：白色背景

### 布局

- 安全区：`brand-tokens.json` → `layout.safeArea`（上下 8%、左右 5%）
- 封面标题位置：`top:48%`，水平居中

### 响应式缩放

- 按视口宽度等比缩放（`scale = window.innerWidth / 1920`）
- CSS 变量 `--s` 控制，transform 字符串不变
- 播放器 `position:fixed; top:0`，无左右黑边，高度溢出底部裁剪
- F11 → 浏览器原生全屏

## 工作流程

### 前置步骤（四条路径共用）

1. **判断模式** → Template（内部汇报/同步/述职）还是 Themed（对外展示/说服/介绍）。从用户自然语言中的受众、目的、场景推断
2. **确定品牌上下文** → 配色方案（默认集团红）+ Logo 归属（默认集团 Logo，按业务线切换）
3. **生成前确认** → 告知用户，等待确认：
   - Template：`"我将按**内部汇报**的设计方式制作（统一母版）。如果你是用于对外展示，请告诉我，我会切换设计风格。"`
   - Themed：`"我将按**对外展示**的设计方式制作（品牌主题 + 个性化设计）。如果你是用于内部工作汇报，请告诉我，我会切换为统一母版。"`
4. **读取品牌数据** → `brand-tokens.json`（必须）

### 路径 A × Template（从零生成，内部汇报）

- **封面 + 结尾页**：skill renderer 固定排版
- **内容页**：使用 `"type": "custom"`，agent 在 `"html"` 字段写完整的 inline HTML
- **布局硬约束**（agent 必须遵守）：
  - Logo 安全区：右上角 80×80px 范围（`right:5.2% top:5.3%`）内禁止任何内容
  - 页面安全区：内容必须约束在 `top:12%` ~ `bottom:25%` 之间（按宽缩放导致底部约22%被视口裁切）
  - 品牌色值：标题 `#2D3847`、正文 `#595959`、强调 `#D0121B`，禁止纯黑
  - 字号：标题 40pt、副标题 30pt、正文 26pt、标注 22pt（`typography.sizes.*.template`）
- 生成：`node generate.js <pages.json>`

### 路径 A × Themed（从零生成，对外展示）

1. 策划内容 → 写 pages.json（不设 scene 或设非 template 值）
2. 读取 `brand-tokens.json`，将品牌数据交给设计 skill
3. 设计 skill 在硬规则约束内创作

### 路径 B（改写已有文件）

已有 HTML/PPTX/DOCX → Agent 提取内容 → 归一化为 pages.json → 走路径 A 流程。

### 纯内容咨询

如果用户只问"263 是做什么的"、"有哪些产品"等信息性问题：
- 从 `company-data.json` 提取相关信息回答
- 不需要读取 `brand-tokens.json`

## HTML 输出规范（无设计 skill 时）

- 零外部依赖，单一 HTML 文件，浏览器直接打开
- 播放壳：键盘翻页/点击翻页，F11 手动全屏
- 内页 Logo 固定
- 字号不低于 20pt（装饰图形除外）
- 封面：白色背景 + ASCII 字符画 + 二进制雨动画

## 与设计 skill 协作

- **你管的**：告诉我品牌色是什么、Logo 在哪、用什么字体
- **你不管的**：卡片怎么排、动画怎么做、阴影用几层 — 设计 skill 自行决定

## 禁止事项

- 不要在生成的页面中使用非 263 色板的颜色
- 不要使用纯黑 `#000000` 作为文本色
- 不要编造公司信息（名称、股票代码、数据等）
- 不要用 font-size < 16px（ASCII 字符画例外）
- 不要在内页自定义 Logo 位置
- 不要在 Logo 周围放置装饰元素
- 不要自行生成或修改 ASCII 字符画 — 必须从 brand-tokens.json 原样读取
