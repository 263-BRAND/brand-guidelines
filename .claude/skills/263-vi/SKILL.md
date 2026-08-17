---
name: 263-vi
description: 263 品牌 VI 规范 — 提供品牌色板、字体、Logo 和公司数据。任何涉及 263 品牌输出的场景（PPT、网页、文档等）都应使用此 skill。
---

# 263 品牌 VI 规范

## 你的职责

当用户需要输出涉及 263 品牌的内容时，你负责品牌数据层的全部决策：

1. 判断生成模式（Template 还是 Themed）— 从用户自然语言推断
2. 确定品牌上下文（配色方案 + Logo 归属）
3. 从 `brand-tokens.json` 和 `company-data.json` 读取品牌数据
4. 在生成前告知用户当前模式

## 品牌数据文件

| 文件 | 内容 | 何时读取 |
|------|------|----------|
| `brand-tokens.json` | 色板、字体层级、Logo、硬规则 | 任何视觉输出 |
| `company-data.json` | 公司信息、产品、里程碑、资质 | 需要公司/产品信息时 |

## 生成模式判断

**硬锚词（命中即锁定，不可覆盖）：**

| 锚词 | 锁定模式 | 原因 |
|------|:--:|------|
| 汇报、述职、总结、周报、月报、季报、年报 | **Template** | 组织内部同步，无例外 |
| 介绍、展示、宣传、发布会、对外、客户 | **Themed** | 组织外部说服，无例外 |

硬锚词优先于一切其他推断。用户说"帮我做个Q3工作汇报"→ 锚中"汇报"→ 直接锁定 Template，跳过推理。

**无锚词时按特征推理：**

| 维度 | Template（母版型） | Themed（主题型） |
|------|-------------------|------------------|
| 受众 | 组织内部 | 组织外部 |
| 目的 | 汇报/同步/述职 | 说服/展示/介绍 |
| 设计 | 统一规范，不追求个性 | 品牌约束内允许个性发挥 |

判断时问自己三个问题：
1. 受众是谁？（内部 → Template，外部 → Themed）
2. 目的是什么？（汇报 → Template，说服 → Themed）
3. 有母版要求吗？（有 → Template）

二选一，不要犹豫。即使用户说"帮我做个PPT"没有额外信息，也选最可能的并声明。

## 生成前确认（硬门禁）

**确认问题是硬性必问——Agent 先判断场景，但判断后也必须把对应分支的问题逐一询问用户确认，禁止因已判断而跳过询问或直接生成。确认问题按场景分支：内部汇报 → 问 Q1/Q2/Q4/Q5；对外展示 → 问 Q1/Q2/Q3/Q4。如果你发现自己正在生成内容但还没问完这些必须确认的问题，立即停下来，回到确认步骤。**

**提问用户用下方固定话术，禁止自行发挥、禁止向用户解释母版/硬规则/模板机制等内部细节。**

1. **展示场景：** 先根据用户提交的资料判断场景，再确认式提问（判断是 A 则询问是否需要改成 B）。判断为「内部汇报」→ 话术：「根据您提供的资料，我判断这个 PPT 用于**内部汇报**。如果实际是用于**对外展示**，请告诉我，我会切换设计风格。」判断为「对外展示」→ 话术反之。
2. **配色方案：** 话术：「用**集团红**还是**商务蓝**？」（默认集团红）
3. **视觉风格（仅对外展示时询问；内部汇报不询问，默认严格按模板）：** 话术：「**严格按模板排版**，还是调用**专业设计能力美化排版**？」选「严格按模板」→ 按母版锁定排版（设计 skill 不介入）；选「专业设计美化」→ 硬规则锁死、软规则由设计 skill 自由发挥。
4. **输出格式：** 话术：「要**网页文件**还是**PPT 文件**？」
5. **封面风格（仅内部汇报时追加，此限定不对用户说）：** 话术：「封面风格：选**个性化风格**（Geek 像素动效）还是**严谨商务风格**？」输出格式为 PPT 时补充推荐：「如生成 PPTX，推荐**严谨商务风格**」。禁止向用户提及内部字段名（red-template）或「内部汇报专属」等内部限定。技术映射见下方「规则」→「确认结果必须写入 pages.json」。

**规则：**
- 全部必答问题确认前，禁止进入后续任何步骤（大纲收集、封面信息提取、数据图表收集、pages.json 生成、透明声明）
- 禁止假设默认值跳过提问。**Agent 的判断结果不能替代用户确认**——每个分支问题都必须向用户询问，用户未明确回答的选项必须追问
- 确认结果必须写入 pages.json：问题 1「内部汇报」→ `"scene": "template"`；「对外展示」→ 省略 `scene`。问题 2「集团红」→ `"colorScheme": "group-red"`；「商务蓝」→ `"business-blue"`。问题 5「个性化」→ 省略封面 `background`（ASCII 默认）；「严谨」→ 封面 `"background": "red-template"`

## 工作流

### 前置步骤（四条路径共用）

1. **判断模式** → Template 还是 Themed（见上方判断逻辑，硬锚词优先）
2. **硬门禁确认** → 按场景分支逐个弹出确认问题（见上方"生成前确认"章节：内部汇报 → Q1/Q2/Q4/Q5；对外展示 → Q1/Q2/Q3/Q4）。Agent 先判断场景，但判断后也必须逐一询问用户确认。全部确认后才能继续。禁止跳过，禁止假设默认值
3. **确定品牌上下文** → 按确认结果：配色方案 + Logo 归属（默认集团 Logo，按业务线切换）
4. **收集内容大纲** → 向用户索要提纲或要点。话术：`"如果你已经做好提纲，请发给我。或者把大概的内容要点列给我，我来帮你整理成提纲。确认后开始生成。"` 用户确认大纲后再进入下一步
5. **收集数据图表** → 大纲确认后，询问用户是否有具体数据。话术：`"提纲确认了。如果有具体的数据、图表或关键数字需要展示，可以一并发给我，我会嵌入到对应页面中。"` 用户没数据则跳过
6. **收集封面信息** → 从用户描述中提取，并向用户确认。不得未经确认直接填入：
   - 副标题：提取后询问"副标题用「xxx」可以吗？"如用户说没有则留空
   - 汇报人：提取后询问。如用户未提及则主动问"需要标注汇报人吗？"
   - 部门：提取后询问。如用户未提及则主动问"需要标注部门吗？"
   - 日期：提取后询问。如用户未提及则主动问"需要标注日期吗？"
7. **输出透明声明** → 生成内容前，用一句话告知用户当前模式（这是生成结果的第一句话，不是对话阶段的确认问题，与第 2 步不重复）：
   - Template：`"我将按**内部汇报**的设计方式制作。如果你是用于对外展示，请告诉我，我会切换设计风格。"`
   - Themed：`"我将按**对外展示**的设计方式制作。如果你是用于内部工作汇报，请告诉我，我会切换设计风格。"`
8. **读取品牌数据** → `brand-tokens.json`（必须）+ `company-data.json`（按需）

### 路径选择

| | 路径 A（从零生成） | 路径 B（改写已有） |
|---|---|---|
| **Template** | 按母版填空 | 对齐母版规范 |
| **Themed** | 品牌数据 + 设计 skill 创作 | 品牌约束内重新设计 |

### pages.json 结构

生成 HTML 时，内容必须组织为 `pages.json`，然后执行 `node generate.js <pages.json>`。

**顶层字段：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `colorScheme` | string | `"group-red"`（默认）或 `"business-blue"` |
| `logoSet` | string | `"group"`（默认）或 `"cloud"` |
| `scene` | string | `"template"`（内部汇报封面）或省略（对外展示封面） |
| `companyName` | string | 公司全称，用于页脚 |
| `slides` | array | 页面数组，封面第一、结尾最后 |

**slide 类型及字段：**

| type | 必填字段 | 可选字段 | 说明 |
|------|------|------|------|
| `cover` | `title` | `subtitle`, `presenter`, `department`, `date`, `background` | 封面页 |
| `section` | `sectionNumber`, `title` | `subtitle`, `background` | 章节过渡页 |
| `content` | `title`, `blocks[]` | `sectionLabel`, `background` | 文本内容页，blocks 每项含 `heading` + `body` |
| `cards` | `title`, `items[]` | `sectionLabel`, `columns`(默认3), `background` | 卡片网格，items 每项含 `title` + `description`，可选 `icon` |
| `timeline` | `title`, `events[]` | `sectionLabel`, `background` | 时间轴，events 每项含 `year` + `title`，可选 `description` |
| `custom` | `html` | `background` | 自定义 HTML（仅 HTML；PPTX 中改用 `content` 或 `cards` 替代） |
| `end` | — | `background` | 结尾页（居中 Logo + slogan） |

### 路径 A × Template：从零按母版生成

用户描述需求，没有现成文件 → 你按固定母版从零生成

1. 根据用户确认过的提纲策划页面结构
2. 每页按母版填空（封面页固定布局、内容页标准版式）
3. 结尾页必须是最后一页（slide 数组末尾），封面必须是第一页
4. **全部硬规则锁死**：字号、颜色、Logo 位置均不可变
5. 设计 skill **不介入**
6. 用 `node generate.js <pages.json>` 兜底渲染

### 母版封面页（Template Cover）

封面页采用统一固定设计，不走 Themed 路径：

| 属性 | 值 | 刚性 |
|------|-----|:--:|
| 背景 | `#FFFFFF`（品牌 white） | MUST |
| Logo 呈现 | ASCII 字符画（monospace），红色品牌主色，页面水平居中，距顶 16% | MUST |
| 标题 | 微软雅黑 Bold，64pt，深色品牌 dark，水平居中 | MUST |
| 汇报人/部门 | 微软雅黑，26pt，品牌 gray，水平居中，红色圆点分隔 | MUST |
| 公司全称 | 底部居中，22pt，品牌 gray + opacity 0.45 | MUST |
| 整体布局 | 纯色背景，无纹理，无边框，上下预留安全区 | MUST |
| 入场动画（仅 HTML） | 封面加载时 ASCII 逐行交错滑入（偶数行左侧滑入，奇数行右侧滑入，逐行 30ms 延迟），标题文字 1.2s 后淡入上浮 | MUST |

**ASCII Logo 数据：** 封面页固定使用 `brand-tokens.json` → `coverAscii.art` 中存储的 ASCII 字符画。**严禁 AI 自行生成或修改 ASCII 图**，必须从 brand-tokens.json 原样读取并嵌入。渲染规则：
- 使用 `<pre>` 标签 + `white-space: pre` + `font-family: monospace` 确保跨平台对齐
- 字体和变形参数从 `brand-tokens.json` → `typography.asciiArt` 读取：
  - `fontFamily` / `fontSize` / `lineHeight` 用于 `<pre>` 的 CSS
  - `scaleX` 用于 `<pre>` 的 `transform: scaleX(...)`，水平拉伸字符以还原视觉比例
  - `overallScaleX` / `overallScaleY` 用于外层 wrapper 的 `transform: scale(..., ...)` + `transform-origin: top center`，整体缩放至合适尺寸
- 每行独立 `<span class="ascii-line">`，偶数行左滑入、奇数行右滑入
- JS `setTimeout(i × 30ms)` 逐行交错触发，全部完成后标题淡入
- 每行去掉 15 个共同前导空格（`.substring(15)`），消除结构性右偏
- 位置：`top:16%`，水平居中（`left:50%; transform:translateX(-50%)`）
- **刷新重播：** 动效绑定 `.slide-page.active`，页面刷新自动重播

**封面无右上角/左上角独立 Logo。** ASCII 图案即是封面的品牌标识，不额外放置 PNG Logo。此规则仅适用于 ASCII 默认封面（个性化）；**严谨封面 red-template 例外——左上角放置集团彩稿 PNG Logo**（见「内部汇报红色封面」章节）。内页和结尾页的 Logo 规则不变。

**PPTX Template 封面回退：** ASCII 字符画和二进制雨在 PPTX 中无法渲染，改用预渲染静态背景图 + 固定位置文字叠加：

1. 背景图：`brand-tokens.json` → `templateCoverBgPptx.path`（`assets/template-cover-bg.png`），设为全幻灯片背景，等比缩放至 960×540pt
2. 文字框位置（背景图上叠加，强制固定，不可偏移）：

| 文字 | 位置 | 字号 | 颜色 | 对齐 |
|------|------|------|------|:--:|
| 标题 | 水平居中，`top:48%`（与 HTML 一致） | 64pt Bold | 品牌 dark | 居中 |
| 副标题 + 汇报人 + 部门 | 水平居中，`top:62%`（标题下方，留一行间距），合并为一个文字框，红色圆点（·）分隔 | 26pt | 品牌 gray | 居中 |
| 公司全称 | 水平居中，`top:82%`（与 HTML 一致） | 22pt | 品牌 gray | 居中 |

3. PPTX 文字框必须设置透明背景（`FillVisible=false` 或等效），**禁止填充任何颜色**——底图被遮挡会露出色块
4. 位置为 MUST，禁止 Agent 自行调整——ASCII 图案在背景图中位置固定，文字偏移会导致重叠

**使用时**：在 `pages.json` 中设置 `"scene": "template"`，渲染器自动切换到 ASCII 封面。不设置或设置为其他值时使用 Themed 封面（红底渐变 + 左上角 Logo）。

### 内部汇报红色封面（Red Template Cover）

内部汇报场景的第二种封面：红色设计位图底图 + 文字叠加，HTML/PPTX 100% 视觉一致。适合想要比 ASCII 字符画更正式、更精致的内部汇报封面。

**触发**：由硬门禁第 5 题「封面风格」由用户选择——「严谨」→ 封面 slide 设 `"background": "red-template"`；「个性化」→ 省略 `background`（ASCII 默认）。技术等价写法：`scene: "template"` + cover slide 的 `"background": "red-template"`。PPTX 输出时推荐严谨风格。

| 属性 | 值 | 刚性 |
|------|-----|:--:|
| 背景 | `brand-tokens.json` → `redTemplateCover.path`（`assets/cover-red-template.png`，1920×1080 位图），HTML 以 base64 全屏背景，PPTX 以全幻灯片背景 | MUST |
| 独立 Logo | **左上角集团红心 Logo**（= 集团彩稿 `logos.group.color`，与内页一致），位置固定：`left:6%` / `top:8%` / 125px 正方形（HTML；PPTX 62pt 正方形，坐标 `left:57.6pt` / `top:43.2pt` = 6%×960 / 8%×540），HTML/PPTX 一致 | MUST |
| 文字区 | 白色留白区（图片左半），`left:7%` / `max-width:50%`，**整体垂直居中**：`startY = (SH − totalH) / 2`（HTML 以 `height:100%` + flex 居中实现，内容中心 = 画布垂直中心 540px；PPTX 显式计算 startY），左对齐 | MUST |
| 标题 | 微软雅黑 Bold，64pt，品牌 dark，左对齐；**≤20 字符/行，禁止折行**；超限 Agent 建议用户改短或自行分为两行（以 `\n` 分行）；`line-height:1.3`；宽度随内容自适应（`white-space:nowrap`），上限 50% | MUST |
| 副标题 | 微软雅黑，30pt，品牌 gray，左对齐，**独立一行**（不与汇报人/部门/日期同行），**不加粗** | MUST |
| 汇报人/部门/日期 | 微软雅黑，**26pt（小于副标题）**，品牌 gray，左对齐，红色圆点（·）分隔，独立一行 | MUST |
| 公司全称 | 底部 `bottom:6%` / `left:7%`，22pt，品牌 gray（浅粉底带上） | MUST |
| 文字重叠 | **禁止**——任何文字元素不得重叠；**间距分层**：标题→副标题 16px（紧凑），副标题→汇报信息 32px（成组拉开） | MUST |

**图片缩放规则**：红色封面底图按全幻灯片等比缩放（HTML `background-size:contain`，PPTX 等比缩放至 960×540pt）。图片本身 16:9，与画布同比例，不裁切不变形。**禁止拉伸、裁切、压扁。**

**标题宽度说明**：文字区宽度从 42% 放宽为 `max-width:50%`——标题不折行，宽度随内容自适应，可向右扩展到放得下为止，但不超过 50%（20 字符 @64pt 约 44%，仍在白区安全范围内，不压右侧红区）。

**PPTX 实现**：红色封面底图设为全幻灯片背景，文字框叠加。字号按 PPTX 列：标题 43pt Bold、副标题 20pt、汇报信息 18pt、公司全称 14pt。集团彩稿 Logo 内嵌二进制，位置 `left:57.6pt` / `top:43.2pt`，`LockAspectRatio=true` + 单维度 62pt 正方形。文字块垂直居中：`startY = (540 − totalH) / 2`。文字框必须透明背景（`FillVisible=false`），禁止填充颜色。

### 封面二进制雨（仅 HTML，Geek 装饰）

- canvas 全屏 `01` 字符下落的 Matrix 风格动画
- 品牌主色字符，8% 极低透明度，不干扰正文
- 自动检测 `canvas[id^=binaryRain]` 并启动动画

### 封面双模式

- **Template（对内汇报）**：`pages.scene === 'template'` → 白色背景 + ASCII 字符画 + 二进制雨 + 居中排版；`cover.background: "red-template"` 时切换为红色设计位图封面 + 左对齐文字
- **Themed（对外展示）**：默认 → 渐变/纯色背景 + 左上 PNG Logo + 左对齐排版
- 封面背景选项（Themed）：primary-gradient / primary-solid / dark-solid / white
- 封面背景选项（Template）：省略（ASCII） / red-template（红色位图）

### 路径 A × Themed：从零创作型生成

用户描述需求，没有现成文件，需要对外展示效果 → 你策划内容 + 设计 skill 排版

1. 根据用户确认过的提纲策划页面结构、配图/图表方案
2. 将品牌数据（色板、字体层级、Logo 规则）交给设计 skill
3. **硬规则锁死，软规则由设计 skill 自由发挥**
4. 品牌数据层（你管）：色彩不准偏、字体不准换、Logo 不准动、结尾页格式固定
5. 表现层（设计 skill 管）：排版布局、装饰元素、图表风格、动画效果、阴影层次

### 路径 B × Template：已有文件对齐母版

用户提供已有 HTML/JSON 文件，需要对齐内部汇报母版

1. 读取已有文件，提取页面结构和内容
2. **替换所有颜色为品牌色板色值**（不只是主色，包括所有辅助色：绿→主色/辅色，蓝→深色/辅色，灰→品牌灰）。Template 路径下原文件的一切非品牌颜色必须全部清除
3. 替换字体为微软雅黑，修正字号到 Template 标准
4. 嵌入 Logo（内页右上角，画布宽度 4.2%，见 `layout.innerPageLogo.size`），符合深浅底规则
5. **检查 Logo 安全区**：右上角（画布宽度 4.2%，见 `layout.innerPageLogo.size`）范围不得有任何 UI 组件（翻页提示、页码、进度条等）。如有冲突，移动 UI 组件而非移动 Logo
6. 对齐母版布局（封面、目录、内容、结尾页统一版式）
7. **结尾页强制替换**：原文件的结尾/感谢页内容全部丢弃，替换为 VI 标准结尾（居中 Logo + slogan PNG）。此规则不可协商，Themed 模式下同样适用
8. VI skill 全控，设计 skill 不介入

### 路径 B × Themed：已有文件品牌重设计

用户提供已有文件，需要对外展示级别重新设计

1. 读取已有文件，提取内容信息
2. 将内容和品牌数据（色板、字体层级、Logo 规则）交给设计 skill
3. 设计 skill 在硬规则约束内重新设计排版和视觉
4. 品牌数据层锁死，表现层自由发挥（同路径 A × Themed 的边界）

### 纯内容咨询

如果用户只问"263 是做什么的"、"有哪些产品"等信息性问题：
- 从 `company-data.json` 提取相关信息回答
- 不需要读取 `brand-tokens.json`

## 品牌规则

### 色彩

两套配色方案，通过 `brand-tokens.json` → `colorSchemes` 选择：

- **集团红（group-red）**：主色 `#D0121B`，集团层面默认
- **商务蓝（business-blue）**：主色 `#1677FF`，待官方确认后启用

每个方案 9 个色值。所有颜色从 JSON 读取，不硬编码。

### 背景系统

- 内页：白色背景

### 布局

**HTML 画布：** 1920×1080（px），响应式缩放至视口。
**PPTX 幻灯片：** 960×540（pt），PowerPoint 16:9 宽屏默认尺寸。所有百分比规则按此基准换算 pt 值。

- 内页内容可用范围：`top:12% ~ bottom:18%`（为右上 Logo 和底部 footer 留出空间）
- **内容垂直居中：** 内容视觉重心围绕页面 50% 垂直中心对称分布，不得整体偏上或偏下
- 左右留白：≥ 5%
- 封面标题位置：`top:48%`，水平居中

### 响应式缩放（仅 HTML）

- 按视口等比缩放（`scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080)`）
- 取宽高缩放比的较小值，保证 1920×1080 画布始终完整可见
- CSS 变量 `--s` 控制缩放
- 播放器垂直居中：`position:fixed; top:50%; left:50%; transform:translate(-50%,-50%) scale(var(--s))`
- F11 → 浏览器原生全屏

### 字体

**正文字体：微软雅黑。** 字号值在不同输出格式下取不同数据源，数值即 pt（PPTX/PDF/印刷原生单位），不硬编码：

| 层级 | HTML 值（`sizes.*.template`） | PPTX 值（硬编码） | 刚性 |
|------|------------------------|------------------------|------|
| 封面标题 | 64 | 43 | Template MUST / Themed 区间 |
| 内容页标题 | 40 | 24 | 同上 |
| 副标题 | 30 | 20 | 同上 |
| 正文 | 26 | 18 | MUST |
| 图表标签/注脚 | 22 | 14 | MUST |

**Template：全部使用固定值。Themed：设计 skill 在区间内自由决定。** 数据源：`brand-tokens.json` → `typography.sizes`（Template 用 `*.template`，Themed 用 `*.themed.min/max` 区间）。PPTX 字号值从上表"PPTX 值"列取值，不在 JSON 中重复存储。

**字体回退链：** 微软雅黑 → Noto Sans SC → Source Han Sans SC → sans-serif。如果运行环境无微软雅黑（Mac/Linux/纯 Web），使用 **Noto Sans SC**（开源无版权，SIL Open Font License，Google/Adobe 联合出品，中文排版质量对标微软雅黑）。CSS font-family 完整栈从 `brand-tokens.json` → `typography.fontFamily` 读取。

**跨格式直出规则：** HTML/CSS 输出在数字后加 `pt` 后缀（如 `font-size: 64pt`），PPTX 直接写入数字（PPTX fontSize 原生单位即 pt）。**禁止任何 pt↔px 乘除换算。** 值从 JSON 读取为 number，单位由输出端明确补上。

### Logo

| 规则 | 刚性 |
|------|:--:|
| 内页 Logo 尺寸：画布宽度的 4.2%（`layout.innerPageLogo.size`） | MUST |
| Logo 安全区内禁止任何装饰元素、文字、页码、页脚组件 | MUST |
| 浅色底 → 彩稿 Logo / 深色底 → 反白 Logo | MUST |
| 结尾页：原内容全部丢弃，替换为居中 Logo + slogan PNG 图片（不可用文字代替） | MUST |
| 封面 Logo（Themed）：左上角，画布宽度 6.5%（`layout.coverLogo`），安全区同内页规则 | MUST |
| 封面 Logo（Template·ASCII 默认）：不使用 PNG Logo，以 ASCII 字符画替代（见"母版封面页"章节）；**严谨封面 red-template 例外：左上角集团彩稿 PNG Logo**（见「内部汇报红色封面」章节） | MUST |
| Logo 图片必须使用 `background-size: contain`（CSS background-image）或 `object-fit: contain`（`<img>` 标签），禁止裁切、禁止拉伸、禁止压扁 | MUST |
| Logo 图片容器禁止同时固定宽高两个维度为不匹配原图比例的值；只能固定单一维度，另一维度 auto 或等比推算 | MUST |

**Logo 安全区 = Logo 图片的矩形边界框。** 安全区外边界即 Logo 边缘，不需要额外 margin。坐标从 `brand-tokens.json` → `layout` 读取。

**绝对禁止：** 任何内容元素（标题、正文、页码、页脚、装饰、分割线、图标、背景图形）的任何像素进入安全区。Template 和 Themed 模式下同等适用，无一例外。

**内页安全区（`layout.innerPageLogo`）：**
- Logo 位于右上角，`right` / `top` 定位，`size` 正方形
- 内容区最大右边界 = 画布宽度 − right − size = 画布宽度 × 91.6%（以默认值 right:4.2%, size:4.2% 计）
- 页脚右侧元素（页码等）必须显式约束在此边界内，禁用 `space-between` 布局

**封面安全区（`layout.coverLogo`）：**
- Logo 位于左上角，`left` / `top` 定位，`size` 正方形
- 封面 Logo 尺寸（6.5%）大于内页（4.2%），视觉权重更高
- 安全区范围：X: left ~ left+size, Y: top ~ top+size
- 封面常见违规：装饰圆/半透明图形侵入左上角、标题文字 `padding-left` 不足导致进入安全区
- **生成封面时强制检查：** 所有装饰元素（背景圆、渐变块、几何图形）的左上边界必须 ≥ left+size，标题文字的 `left` 或 `padding-left` 必须 ≥ left+size

### 图片素材缩放规则（硬门禁）

**所有品牌图片素材（Logo PNG、slogan PNG）只允许等比缩放，绝对禁止裁切或变形。HTML 和 PPTX 同等适用。此规则优先级最高，覆盖一切排版决策。**

| # | 规则 | HTML 实现 | PPTX 实现 |
|---|------|-----------|-----------|
| 1 | 只允许等比缩放 | `background-size: contain` 或 `object-fit: contain` | `LockAspectRatio=true` |
| 2 | 只能固定单一维度 | `width`+`height:auto`，或宽=高正方形 | 仅设 Width 或仅设 Height |
| 3 | 禁止同时设两个不同宽高值 | 禁止 `width:300;height:100` | 禁止 Width≠Height 且不锁比例 |
| 4 | 禁止裁切模式 | 禁止 `cover`、`overflow:hidden` | 禁止 Crop、禁止裁剪 |
| 5 | Logo 容器始终正方形 | 宽=高，`contain` 内部适配 | Width=Height，`LockAspectRatio=true` |

**各场景正确写法：**

内页右上角 Logo（HTML: 80px = 1920×4.2%；PPTX: 40pt = 960×4.2%）：
```
HTML ✅ width:80px; height:80px;  (background-size:contain)
PPTX ✅ Width=40pt, Height=40pt, LockAspectRatio=true
```

封面左上角 Logo / Themed（HTML: 125px = 1920×6.5%；PPTX: 62pt = 960×6.5%）：
```
HTML ✅ width:125px; height:125px;  (background-size:contain)
PPTX ✅ Width=62pt, Height=62pt, LockAspectRatio=true
```
> 注意：封面 Logo 禁止使用百分比（`6.5%` 在 1920×1080 上宽高解析为 125×70，破坏正方形）。必须用 px/pt 固定值。

结尾页居中 Logo（HTML: 356px = 1080×33%；PPTX: 178pt = 540×33%）：
```
HTML ✅ width:356px; height:356px;  (background-size:contain)
PPTX ✅ Width=178pt, Height=178pt, LockAspectRatio=true
```

结尾页 Slogan（HTML: 960px = 1920×50%；PPTX: 480pt = 960×50%）：
```
HTML ✅ width:960px; height:auto;  (background-size:contain)
PPTX ✅ Width=480pt, LockAspectRatio=true, 不设 Height
```

**禁止做法（任何格式）：**
- ❌ 同时设定不同的宽高值（如 300×100）→ 图片被压扁/拉伸
- ❌ 裁切模式（`cover` / Crop）→ 图片边缘被切掉
- ❌ 不对 PPTX 图片设置 `LockAspectRatio` → 拖拽即变形
- ❌ 容器非正方形（宽≠高）+ Logo 图片 → Logo 在错误比例框内

**PPTX 图片嵌入：**
- 必须内嵌图片二进制到 .pptx 文件中，禁止使用外部路径链接
- LockAspectRatio 的正确设置顺序：① 插入图片 → ② 设置 `LockAspectRatio=true` → ③ 设置 Width（或 Height）单维度值。必须先锁比例再设尺寸，顺序反了会变形
- 所有 Logo 文件路径从 `brand-tokens.json` → `logos` 读取；slogan 从 `brand-tokens.json` → `slogan` 读取

**生成前自检（HTML & PPTX）：**
- [ ] 所有 Logo 容器为正方形（宽=高）
- [ ] 所有 Slogan 只固定宽度，高度按原图比例自适应
- [ ] 没有任何品牌图片使用裁切/拉伸模式
- [ ] 结尾页 Logo + slogan 格式正确
- [ ] 内页右上角 Logo 格式正确
- [ ] PPTX: 所有图片已内嵌（非外部链接）；LockAspectRatio 设置顺序正确

### 品牌上下文（Logo 按业务线切换）

默认使用集团 Logo。当用户指定业务线（如云通信）时，切换到该业务线的 Logo，其他品牌规则不变。

在 `pages.json` 中设置 `"logoSet": "cloud"` 切换到云通信 Logo，省略或 `"group"` 为集团 Logo。Logo 文件路径从 `brand-tokens.json` → `logos.group` / `logos.cloud` 读取。

### 硬规则

Template：全部锁死。Themed：以下 MUST 规则不可违反，其余交设计 skill。

从 `brand-tokens.json` → `hardRules` 读取完整清单。

### 结尾页

**顺序要求：结尾页必须是整个 PPT 的最后一页。** 无论 Template 还是 Themed 模式，生成或改写 PPT 时，结尾页必须是 slide 数组的最后一个元素。禁止将结尾页插入到中间位置。

**格式：** 居中 Logo + slogan PNG。尺寸按画布比例计算，不硬编码：

- **Logo：** 高度 = 画布高度 × 30%~36%，宽度按原图等比自适应。容器设为正方形（宽=高），CSS `background-size: contain` 保证图片不裁切不变形
- **Slogan：** 宽度 = 画布宽度 × 45%~55%，高度按原图比例自适应，**禁止硬编码固定高度**。使用 `background-size: contain` 或 `object-fit: contain`
- **间距：** Logo 与 slogan 之间留白 = 画布高度 × 6%~8%

以 1920×1080 画布为例：Logo 约 356px 正方形，slogan 约 960px 宽，间距约 76px。

**绝对禁止：** 同时固定 Logo 的宽和高为不相同的值（如 `width:288px;height:162px`）——这会创建一个非正方形容器，导致 Logo 在其中被挤压或留白过大。Logo 容器必须宽=高。

## 与设计 skill 协作

VI skill 是品牌数据层，设计 skill 是表现层。

| 层 | 谁负责 | 锁定的内容 |
|----|--------|-----------|
| 品牌数据层 | VI skill | 色彩、字体、Logo 规则、结尾页格式、硬规则 |
| 表现层 | 设计 skill | 排版布局、装饰元素、图表风格、动画、阴影 |

**Brand Data Contract：** VI skill 输出给设计 skill 的数据结构：

```json
{
  "colorScheme": "group-red",
  "colors": { "primary": "#D0121B", "primaryLight": "#FE343F", "primaryDark": "#AC000A", "accent": "#FF777F", "dark": "#2D3847", "gray": "#595959", "lightGray": "#F2F2F2", "white": "#FFFFFF", "black": "#000000" },
  "typography": { "fontFamily": "微软雅黑", "html": { "body": 26 }, "pptx": { "body": 18 } },
  "logo": { "innerPage": { "size": "4.2% of canvas width, square" }, "safeZone": "Logo bounding box, zero tolerance" },
  "hardRules": ["Logo安全区", "结尾页格式", "主色不可偏色"],
  "mode": "themed"
}
```

设计 skill 消费这个结构，在硬规则约束内自由创作。

## 输入格式

VI skill 不负责解析文件。外部 Agent 自行调用 MCP 或其他工具摘取内容后送入管线。

| 分级 | 格式 | 可靠性 |
|------|------|--------|
| 原生支持 | HTML、JSON | 路径 B 完整能力 |
| 尽力而为 | .pptx、.docx、.pdf、图片 | Agent 尽力提取 + VI 化，不保证完美 |

如果用户提供的文件格式不在原生支持列表中，告知用户："这个文件格式需要先提取内容。我会尽力处理，但可能需要你确认提取结果是否准确。"

## HTML 输出规范（仅 HTML）

零外部依赖，单一 HTML 文件，浏览器直接打开。播放壳：全屏/键盘翻页/点击翻页。

### Logo 嵌入（仅 HTML，PPTX 图片规范见"图片素材缩放规则"章节）

Logo 和 slogan 图片**必须**以 base64 data URI 嵌入 CSS `background-image`，**禁止**使用以下方式：

- **禁止** `<img src="...">` 标签引用 Logo 或 slogan
- **禁止** 外部文件路径（`url(assets/logos/...)` 或 `url(../assets/...)`）
- **禁止** 省略图片素材——结尾页必须有 slogan.png，内页必须有 Logo

正确格式：

```css
.logo-color-img { background: url(data:image/png;base64,...) no-repeat center/contain; }
.logo-white-img { background: url(data:image/png;base64,...) no-repeat center/contain; }
.slogan-img    { background: url(data:image/png;base64,...) no-repeat center/contain; }
```

- 内页内容可用范围：`top:12% ~ bottom:18%`，内容视觉重心围绕页面 50% 垂直中心对称分布
- 内页 Logo：右上角固定，位置和尺寸从 `brand-tokens.json` → `layout.innerPageLogo` 读取（`right` / `top` / `size`）
- 封面 Logo（Themed）：左上角，从 `layout.coverLogo` 读取
- 浅色底用 `.logo-color-img`，深色底用 `.logo-white-img`
- 结尾页：居中 Logo（`layout.innerPageLogo.size`）+ slogan.png（宽度 45%~55% 画布宽），垂直居中排列
- 字号不低于 20pt

## 数据图表规范

> HTML 实现参考（CSS/SVG）。PPTX 使用原生图表对象，品牌约束（色板、字号、安全区）同等适用，但实现语法由 PPTX 库决定。

### 通用约束（HTML / PPTX 通用）

1. **色值** — 系列色从 `brand-tokens.json` → `chartPalette` 读取，禁止自造衍生色值。上色方式见下方「系列上色规则」（重点突出 > 色阶方向，二选一上色，禁止混用）
2. **安全区** — 图表所有组成部分（图形、坐标轴、刻度、标注、图例）须完整约束在 `top:12% ~ bottom:18%` 内，不得侵犯右上 Logo 安全区
3. **禁止纯黑** `#000000` — 文字用 `#2D3847`（标题）/ `#595959`（标注）
4. **结构底色** — 表头底、斑马纹只能用 `#F2F2F2`（lightGray）或品牌主色极低透明度，不用自造浅色
5. **网格线/轴线** — 可用中性灰，不属品牌色违规

### 系列上色规则（chartPalette）

从 `brand-tokens.json` → `chartPalette` 读取，按当前 colorScheme 选择 `chartPalette` 下的对应子块（集团红 → `chartPalette.group-red`，商务蓝 → `chartPalette.business-blue`）。集团红色板已启用（7 档色阶 + 非重点静默色），商务蓝色板待官方确认，当前禁止启用。

**两种上色模式，按优先级二选一，禁止混用：**

**模式① 重点突出（最高优先）** — 图表有 1~2 个需要突出的数据时使用：
- 重点数据 = **品牌红 `#D0121B`**
- 其余数据 = **浅粉 `#FF777F` 或 淡灰 `#BFBFBF`**（二选一，按图表风格）
- 重点由 agent 从用户需求**自动判断**（如"增长 200%"、"创新高"、"核心指标"），不额外询问
- 效果：重点与非重点 ΔE ≥ 20，观众一眼锁定重点

**模式② 色阶方向（无重点时）** — 用 7 档色阶（`chartPalette.group-red.series`）：
- 按**用户自定义顺序**铺色（禁止按数值大小重新排序），第一行/列取色阶**一端**（最浅 `#F8B5B8` 或最深 `#72090E`）
- 方向由 agent 判断，但**必须二选一且全图一致**（全部由浅到深，或全部由深到浅）
- 颜色表**方向**，不表大小——观众靠位置认身份，色阶只强化渐变方向感

**优先级：模式① > 模式②。** 有重点就进重点模式，无重点才铺色阶。

**二次编码**（色阶相邻档色值相近，用以下方式强化系列身份）：

| 图表 | 二次编码 | 说明 |
|------|------|------|
| 折线图 | **线型 + 标记** | 实线/虚线/点线/点划线 + 方块/圆/三角/菱形等标记，三重身份锁定 |
| 柱状图 | **数值标签** | 柱顶直接标数值，身份交给标签 |
| 饼图/环形图 | **白色硬分割线 + 扇区标签** | 相邻扇区白线隔开 + 标签标注，颜色只做分组 |

### 字号阈值（HTML CSS/SVG 参考，PPTX 对应使用上表 PPTX 列字号）

**常规：≤8 个数据点。密集：>8 个数据点。**

| 条件 | 轴标签/图例 | 数据标注 |
|------|:--:|:--:|
| CSS 图表，≤8 数据点 | ≥ 20pt | ≥ 22pt |
| CSS 图表，>8 数据点 | ≥ 18pt | ≥ 20pt |
| SVG 折线图，≤8 点 | viewBox 内 18 | viewBox 内 16 |
| SVG 折线图，>8 点 | viewBox 内 16 | viewBox 内 14 |
| SVG 折线图，底线 | viewBox 内 12 | viewBox 内 12 |

> SVG 字号基于固定 `viewBox="0 0 740 520"`。

### 按图表类型（HTML 实现语法，PPTX 用原生图表复现相同约束）

**柱状图** — 系列色按「系列上色规则」从 `chartPalette` 读取。PPTX: 原生柱状图，系列色同规则。
**数据表格** — HTML: 数值列右对齐，表头底 + 品牌主色底线，峰值行高亮。PPTX: 原生表格，同上格式规则。
**折线图** — HTML: 单 SVG + 固定 viewBox，禁止 CSS/SVG 混用，线型 + 标记二次编码。PPTX: 原生折线图，同二次编码，最新数据点高亮。
**饼图/环形图** — HTML: conic-gradient + 白色硬停止分割线，扇区数 ≤ 7。PPTX: 原生饼图/环形图，同色板约束，扇区数 ≤ 7，扇区标签 + 图例标注。

**图表生成前自检：**
- [ ] 系列色全部来自 `chartPalette`，无自造色
- [ ] 上色模式二选一（重点突出 / 色阶方向），未混用；有重点则重点=品牌红、其余=浅粉/淡灰
- [ ] 色阶方向全图一致（全部由浅到深，或全部由深到浅）
- [ ] 用户未排序的数据未按数值大小重排
- [ ] 折线图有线型 + 标记；柱状图有数值标签；饼/环图有白分割线 + 扇区标签
- [ ] 饼/环图扇区数 ≤ 7

---

## 禁止事项

- 禁止使用非色板颜色（不自己发明颜色，含图表多系列）
- 禁止在 Template 路径下保留原文件的非品牌颜色（绿色/蓝色/橙色等必须全部替换为品牌色板值）
- 禁止保留原文件的结尾页内容（必须替换为 VI 标准：居中 Logo + slogan PNG）
- 禁止任何像素进入 Logo 安全区——安全区 = Logo 矩形边界框，无一例外。页脚页码用固定右边界，不得越界
- 禁止图表内容超出页面安全区或侵犯 Logo 安全区
- 禁止编造公司信息（名称、股票代码、产品、数据等）
- 禁止 font-size < 各格式底线（HTML 正文 ≥ 24pt 极限 ≥ 20pt；PPTX 正文 ≥ 16pt 极限 ≥ 12pt）
- 禁止在内页自定义 Logo 位置（右上角，画布宽度 4.2%，见 `layout.innerPageLogo.size`，固定）
- 禁止在 Logo 安全区放置任何装饰元素
- 禁止在 Template 路径下自行调整字号、布局、配色
- 禁止向用户暴露 Template/Themed 等内部术语**及内部文件名**（如 red-template、cover-red-template.png、template-cover-bg.png、scene/background 等字段值）。**模式/封面术语**在用户对话中永远使用「内部汇报」「对外展示」「个性化风格」「严谨商务风格」（集团 Logo、HTML/PPTX 等正常用词不受此限）
- 禁止向用户解释 VI 规范、母版机制、渲染流程等内部实现细节
- 禁止跳过透明声明（每次生成必须告知用户当前模式）
- 禁止自行生成或修改 ASCII 字符画 — 必须从 brand-tokens.json 原样读取
- 禁止裁切、拉伸、压扁任何品牌图片素材（Logo、slogan）—— HTML: `background-size: contain` 或 `object-fit: contain`；PPTX: `LockAspectRatio=true` + 仅设单一维度
- 禁止同时固定 Logo 图片容器的宽和高为不同值（如 `width:288px; height:162px`）—— 结尾页 Logo 容器必须宽=高（HTML & PPTX 通用）
- 禁止使用 `<img>` 标签引用品牌图片素材（仅 HTML）—— 必须使用 CSS `background-image` + base64 data URI
- 禁止 PPTX 中使用外部路径链接图片 —— 必须将图片二进制内嵌到 .pptx 文件中
- 禁止 PPTX 封面文字框填充颜色（`FillVisible=false`）—— 必须透明背景，避免遮挡封面底图
- 禁止省略图片素材 —— 每个内页必须有右上角 Logo，结尾页必须有居中 Logo + slogan
