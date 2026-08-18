# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个 **Claude Code skill 项目**。263 VI skill 为 Agent 提供品牌数据层（色板、字体、Logo、公司信息），用于生成品牌化的 PPT/HTML。Skill 入口：`.claude/skills/263group-brand-guidelines/SKILL.md`。

## 构建/生成命令

```bash
node generate.js <pages.json>   # 生成 <pages>.html（自包含幻灯片，零外部依赖）
```

无其他构建步骤、lint 或测试套件。

## 架构

**品牌数据层，不是渲染引擎。** VI skill 是 263 品牌规则的唯一真相源。内容策划交给 LLM，排版表现交给设计 skill。

### 数据流

```
用户需求 → VI skill（品牌决策）→ pages.json → generate.js → slides.html
```

### 输出格式

- **HTML**：1920×1080 画布，响应式缩放。`node generate.js <pages.json>` 渲染。
- **PPTX**：960×540pt（PowerPoint 16:9 宽屏默认）。无生成脚本。PPTX 输出优先用原生 PPTX 排版能力（= 对话中已加载的、能直接产出 .pptx 版式的专业PPT制作技能或设计类技能或设计 agent，**VI skill 本身不算**）；无则推荐改网页文件（HTML）或使用专业PPT制作技能或设计类技能；用户坚持代码生成 PPT 时，生成前警告并按 `pptx-python-guide.md` 实现要点。所有尺寸按 960×540 基准换算。

### 封面三种模式

| 模式 | 触发 | HTML | PPTX |
|------|------|------|------|
| Geek（工作汇报） | 硬锚词：汇报/述职/总结/周报/月报/季报/年报 | ASCII 字符画 + 二进制雨 | 静态截图底图（`template-cover-bg.png`）+ 文字叠加 |
| Geek 红色位图（工作汇报） | `scene:template` + `cover.background:red-template` | 红色设计位图底图（`cover-red-template.png`）+ 左对齐文字 | 同左，100% 一致 |
| Themed（对外展示） | 硬锚词：介绍/展示/宣传/发布会/对外/客户 | 红底渐变 + 左上 PNG Logo | 同左，PPTX 原生实现 |
| Formal（严谨兜底） | 待实现 | 位图底图 + 文字叠加 | 同左，100% 一致 |

### 两条路径

- **路径 A（从零生成）**：Agent 根据用户提纲策划内容 → pages.json → 渲染。
- **路径 B（改写已有）**：Agent 读取已有文件，提取内容，对齐品牌规则。

### Skill zip 打包

zip 从**根目录**按 19 文件清单构建（SKILL.md + pptx-python-guide.md + assets/*.png + renderer/slides/*.js + brand-tokens.json + company-data.json + generate.js），存入 `测试记录/263-vi-skill-MMDD.zip`。zip 必须自包含——SKILL.md 引用的每个文件都必须打包。缺文件会导致外部 AI 工具报错。

### 核心文件

| 文件 | 作用 |
|------|------|
| `.claude/skills/263group-brand-guidelines/SKILL.md` | Skill 定义，唯一真相源 |
| `brand-tokens.json` | 配色方案、字体层级、Logo 路径、ASCII 字符画、硬规则 |
| `company-data.json` | 公司事实、产品组合（3 板块 × 4 业务线） |
| `generate.js` | HTML 渲染器 + 播放壳（1920×1080 画布，响应式缩放） |
| `renderer/slides/*.js` | 按 slide 类型的渲染器：cover、section、toc、content、cards、timeline、custom、end |
| `Design-Decision.md` | 设计决策，两个限界上下文（品牌规范 + Agent 管线） |
| `开发日志.md` | 开发日志——已完成、待处理 |

### pages.json 结构

Agent 与渲染器之间的中间格式。顶层字段：`colorScheme`、`logoSet`、`scene`（Template 封面用）、`companyName`、`slides[]`。八种 slide 类型：`cover`、`section`、`toc`、`content`、`cards`、`timeline`、`custom`、`end`。结尾页必须在数组末尾。

## 关键约定

- **硬门禁**：生成前必须逐项确认，按场景分支（工作汇报 → 场景/配色/输出格式/封面风格；对外展示 → 场景/配色/视觉风格/输出格式）。Agent 先判断场景但判断后也必须逐一询问用户确认，禁止跳过、禁止假设默认值。用户话术用固定平实词，禁止暴露内部文件名。**封面风格推荐与输出格式联动**：选 PPT 文件才推荐严谨商务风格；选网页文件禁止推荐。**PPT 输出路径**：Q4 选 PPT 文件后——对话中已加载能产出 .pptx 版式的 PPT/设计技能或 agent（VI skill 本身不算）直接用；未加载则走话术 4a 推荐改网页文件或用专业PPT制作技能或设计类技能；用户坚持代码生成则话术 4b 生成前警告效果可能需人工调整，并按 `pptx-python-guide.md` 实现。
- **Logo 安全区**：零容忍——任何 UI 元素的任何像素都不得进入 Logo 边界框。安全区 = Logo 矩形框，**X/Y 双轴都算**（X: 画布宽 − right − width ~ 画布宽 − right，Y: top ~ top + height）。**顶部高于 Logo 底边的元素（如 top:12% 标题）右边界强制 ≤ 画布宽 − right − width（≈90.6%）**；内容主体区（top:28%）垂直已低于 Logo 底边不受限。数值按 token 实算，禁止硬编码派生值；键名用 `layout.innerPageLogo.width/height`（token 无 `size` 键）。
- **ASCII 字符画**：封面 ASCII Logo 存储在 `brand-tokens.json` → `coverAscii.art`。Agent 必须原样读取，禁止自行生成或修改。
- **禁止纯黑**：`#000000` 不得作为文字颜色。标题 = `dark` (#2D3847)，正文 = `gray` (#595959)。
- **结尾页**：始终是最后一页，居中 Logo + slogan PNG。原文件的结尾/感谢页必须替换，不得保留。
- **字体**：全局微软雅黑。字号 HTML 用 `pt` 后缀，PPTX 写裸数字。禁止 pt↔px 换算。
- **行距**：HTML 与 PPTX 两套规范（`typography.lineHeight`）。HTML 用 CSS line-height（主标题 1.3、其余 1.8、章节页大号数字 2.0），PPTX 用倍距（标题单倍、其余 1.2倍）。覆盖章节页/目录页（含 toc 类型）。禁止互套。
- **对话术语**：禁止对用户使用内部术语（Template/Themed/母版/硬规则）及内部文件名（red-template、cover-red-template.png、template-cover-bg.png 等）。模式/封面术语始终说「工作汇报」「对外展示」「个性化风格」「严谨商务风格」（集团 Logo、HTML/PPTX 等正常用词不受此限）。PPT 生成路径对用户说「专业PPT制作技能或设计类技能」「用Python代码生成」（Python/HTML 属正常技术词，可对用户说）。**对用户说的话只能逐字来自 SKILL.md「生成前确认 → 用户话术」编号话术（唯一输出源）**；交互措辞三铁律：① 确认问题逐字原样用固定话术；② 禁止向用户播报判断依据（命中/锚词/锁定等推理词不出现）；③ 完整「内部说法 → 用户话术」替换对照见 SKILL.md「生成前确认 → 内部思考词汇」。
- **Code review**：渲染器/UI 变更必须在浏览器实测——窗口缩放、翻页遍历、背景模式切换。只读代码不行。
- **图片缩放**：Logo/slogan 只允许等比缩放（HTML: `background-size:contain`；PPTX: `LockAspectRatio=true`）。Logo 容器必须正方形（宽=高）。Slogan 只固定宽度——**原生尺寸 1360×144（宽高比 9.44:1）存于 `brand-tokens.json` → `slogan`，工具需显式高度时 高度 = 宽度 ÷ 9.44**。禁止裁切/拉伸/同时固定不同宽高值。
- **PPTX 图片嵌入**：必须内嵌二进制，禁外部路径。LockAspectRatio 顺序：插入→锁比例→设单维度尺寸。封面文字框必须透明背景（`FillVisible=false`）。
- **PPTX 字号**：封面标题 43pt，其余见 SKILL.md 字体表。CSS pt 在 HTML 和 PowerPoint pt 解析不同——同数值不代表同比例，禁止直接复刻。
- **字体栈**：`微软雅黑, Microsoft YaHei, Noto Sans SC, Source Han Sans SC, sans-serif`。Noto Sans SC 为跨平台开源回退（SIL OFL）。
- **Skill zip**：`测试记录/263-vi-skill-MMDD.zip`，19 文件（含 `cover-red-template.png`、`template-cover-bg.png`、`pptx-python-guide.md`）。`brand-tokens.json` v2.5（含 chartPalette 图表色板——唯一 7 档红尺度 + 语义色红涨绿跌 + 两灰唯一命名 + slogan 原生尺寸/宽高比）。

## 参考资料

`视觉参考/` 包含 263 官方品牌文件（品牌视觉规范手册 PDF/PPTX、各版本 Logo、集团介绍文档）。不入 git。
