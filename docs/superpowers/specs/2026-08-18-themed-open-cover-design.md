# Themed 对外展示路径开放：封面品牌底线 + 兜底封面图 + 字体开源

**日期：** 2026-08-18
**状态：** 设计定稿待审
**路径分类：** Architectural（改变 Themed 路径的设计哲学与约束边界）

## 背景与目标

用户需求：对外展示（Themed）版本给 agent 开放设计渲染自由度，但须遵循品牌规范与公司数据。封面设计不固定（给出品牌底线），结尾页固定（同 template），字体使用开源无版权风险的字体。

现状核对后确认：结尾页已固定、Themed 表现层已自由。**真正要改的只有三处：① 封面开放（+ 品牌底线）；② 新增兜底封面图；③ 字体按场景分流。**

## 现状核对（改动前基线）

| 要求 | 现状 |
|------|------|
| 结尾页固定（同 template） | ✅ 已固定（`SKILL.md` L273"此规则不可协商，Themed 模式下同样适用"） |
| Themed 表现层自由 | ✅ 已自由（`SKILL.md` L259-261：排版/装饰/图表风格/动画/阴影） |
| 数据层锁死 | ✅ 核心哲学（色彩/字体/Logo/结尾页格式固定） |
| 封面设计不固定 | ❌ 当前固定（渐变/纯色背景 + 左上 PNG Logo + 左对齐排版） |
| 字体开源无版权风险 | ⚠️ 部分（字体栈微软雅黑第一，闭源） |

## 交付物 1：Themed 封面品牌底线

SKILL.md 新增章节「对外展示封面（Themed）」——定义自由范围与品牌底线。

**自由范围**（设计 skill 决定）：封面版式、色板内配色组合、装饰、图形语言、动效、封面信息布局。

**品牌底线（不可碰，自由外的硬地板）：**
1. **色板**：只用 `colorSchemes[colorScheme]` 9 色 + `chartPalette` 色阶 7 档 + 语义色（仅图表涨跌）；禁止自造色
2. **Logo**：封面必须带 263 品牌标识（PNG Logo 或 ASCII 图形）；Logo 安全区零容忍（左上角，`layout.coverLogo` 读取位置/尺寸）；**封面 Logo 一律彩稿（`logo-group-color`），禁止反白**——无论封面深浅底（2026-08-18 用户补充）。若封面深色导致彩稿不可读，调整布局（Logo 置于浅色区域）而非换反白
3. **公司数据**：不编造（公司名/股票代码/业务/口号）
4. **文字**：禁止纯黑；标题 `dark #2D3847` / 正文 `gray #595959`；字号底线（HTML ≥ 20pt / PPTX ≥ 12pt）
5. **字体**：对外展示用开源栈（Noto Sans SC → Source Han Sans SC），禁微软雅黑
6. **结尾页**：固定居中 Logo + slogan（全系统一致，不可协商）
7. **封面信息**：标题/副标题/发布人/日期从 pages.json cover 字段读取，不凭空编造

**兜底封面图是例外**：固定图像资产（用户提供），其自身配色不受色板约束（同 red-template 位图先例）；但叠加其上的文字、Logo 必须遵循品牌底线。

## 交付物 2：Themed 兜底封面图

**来源：** 用户提供 `视觉参考/background-red-themed_v1.png`（1920×1080，RGBA）。**暂用稿——用户明确"后期可能替换图片"**。渲染实现必须图无关：路径从 token 读取，换图只替换 PNG 文件、不动渲染代码与规则。
**观察：** 画面为浅蓝灰底 + 右侧蓝色几何元素，左 ~40% 为干净浅色区（用于文字）。**浅底 → 深色文字 + 彩色 Logo**（与 red-template 的深色底不同）。
**Logo 规范：** 封面 Logo 一律彩稿（`logo-group-color`），**禁止反白**（用户补充规则，见交付物 1 品牌底线 point 2）。
**入库：** 缩放/压平至 `assets/cover-themed-fallback.png`（1920×1080，与画布同比例，`contain` 不裁切）。**统一白底压平为 RGB**——原图 RGBA 含透明通道，PPTX 全幻灯片背景需确定底色，白底压平后 HTML/PPTX 100% 一致，无底色漂移风险。

**触发（2026-08-19 实现时纠正为默认）：** 渲染器（generate.js）渲染 Themed 封面时**默认即兜底封面图**——无需设背景键；只有显式指定其它背景（如 `primary-gradient`）才走渐变。设计能力判定同 PPTX 客观尺子：本次对话是否加载能产出 HTML/PPTX 版式的设计类技能或 agent，VI skill/代码能力不算——仅加载 VI skill → 无设计能力 → 兜底图。`"background": "themed-fallback"` 保留作显式别名。

**渲染（模式同 red-template：位图底 + 文字叠加）：**
- HTML：base64 全屏背景（`.themed-fallback-bg` class，`center/contain`）+ 叠加文字
- PPTX：全幻灯片背景（内嵌二进制）+ 文字框叠加，100% 视觉一致
- 封面元素：彩色 Logo 左上角（`layout.coverLogo`，left:6%/top:8%/125px 正方形）；文字块左侧垂直居中（left:7%，max-width:50%）；标题 `dark` 不折行（`\n` 手动分行，≤20 字符/行）；副标题独立行 `gray`；发布人/部门/日期 `gray` 圆点分隔；公司全称 bottom:6% `gray`

**文字深浅判定：** 兜底图是浅底 → `isDark = false` → 文字 `dark`/`gray`。**Logo 不随深浅切换，一律彩稿 `logo-color-img`（禁止反白）。**

## 交付物 3：字体分流

- `brand-tokens.json` 新增 `typography.fontFamilyOpenSource` = `"Noto Sans SC", "Source Han Sans SC", sans-serif`
- SKILL.md 字体章节按场景取栈：
  - **工作汇报**（Template/内部）：微软雅黑栈（现状不变，`typography.fontFamily`）
  - **对外展示**（Themed/外部）：开源栈（`typography.fontFamilyOpenSource`）——对外分发/嵌入无版权风险（SIL OFL）
- 生成前自检补字体栈核对项
- 设计决策依据：微软雅黑闭源（微软许可），对外分发（网页 HTML 内嵌、交客户文件）有许可风险；Noto Sans SC / Source Han Sans SC 为 SIL OFL 开源，任何使用无风险。对内（工作汇报，自己人看）保留微软雅黑（渲染最稳）。

## 实现细节

**brand-tokens.json：**
- `typography.fontFamilyOpenSource` 新增
- `redTemplateCover` 旁新增 `themedFallbackCover`：`path` + `note`（同先例：纯数据，规则在 SKILL.md）

**generate.js：**
- 读取 `themedFallbackCover.path` → base64 → `.themed-fallback-bg` CSS class
- 校验特例：封面 `background` 允许 `themed-fallback`

**renderer/slides/cover.js：**
- Themed 分支内新增 `renderThemedFallback`（同 `renderRedTemplate` 结构：全屏位图底 + 彩色 Logo 左上 + 左侧深色文字 + 公司全称 bottom:6%）

**pptx-python-guide.md：**
- 第 4 节补兜底封面：全幻灯片背景（内嵌二进制）+ 文字框叠加（透明 FillVisible=false）

**SKILL.md：**
- 新增「对外展示封面（Themed）」章节（品牌底线 + 兜底图触发 + 文字/Logo 深浅规则）
- 字体章节按场景分流
- 封面双模式章节补兜底图选项
- 生成前自检补字体栈 + 兜底图核对

**zip：** 19 → 20 文件（含 `cover-themed-fallback.png`）

## 同步面

CLAUDE.md（架构/核心文件 + 关键约定：语义色已封死，本次补 Themed 封面底线 + 字体分流）、Design-Decision.md（新决策记录）、开发日志.md、memory。

## 测试计划

- 浏览器实测：兜底封面 HTML 渲染（文字/Logo 深浅正确、缩放、翻页）；PPTX 兜底背景一致性
- 自由封面底线核查：设计 skill 产出偏离底线时能否被规则拦下（自检）
- 字体栈切换：对外展示产出不含微软雅黑
- Trae 复测：对外展示封面自由度 + 兜底触发 + 字体

## 依赖

- 兜底封面原图：✅ 已提供（v1，用户确认使用）
- 实现顺序：品牌底线规则 + 字体分流不依赖图片，可先行；兜底封面渲染依赖图片入库
