# 263group-brand-guidelines — 263 品牌 VI 数据层 Skill

为 AI Agent（Claude Code 及各类 AI 工具）提供 263 品牌规范数据层与生成流程，让 Agent 能产出视觉统一的 263 品牌 PPT / 网页 / 文档。

**品牌数据层，不是渲染引擎。** 本 skill 是 263 品牌规则的唯一真相源（色板、字体、Logo、slogan、公司数据、合规词库）。内容策划交给 LLM，排版表现交给设计 skill 或本仓库的兜底渲染器。

---

## 这是什么

263group-brand-guidelines 是一个**自包含 skill 目录**：一个 `263group-brand-guidelines/` 文件夹内含有 Agent 生成 263 品牌内容所需的全部品牌数据、规则和渲染脚本。安装到任意 AI 工具的 skills 目录后，Agent 即可产出符合 263 品牌规范的 PPT / 网页。

**它为你做什么：**
- 统一品牌视觉：色板、字体、Logo、slogan、封面、结尾页全部规范锁定
- 强制合规：广告法违禁词审查、品牌色板白名单、结尾页固定
- 多格式输出：HTML（渲染器生成）和 PPT（设计技能 / 代码生成）

---

## 安装

将 `263group-brand-guidelines/` 目录放入目标工具的 skills 目录：

- **Claude Code**：项目级 `.claude/skills/263group-brand-guidelines/`，或用户级 `~/.claude/skills/263group-brand-guidelines/`
- **其他 AI 工具**：按其约定把该目录放入 skills 位置

Skill 由 `SKILL.md` 驱动，Agent 加载后自动读取品牌数据文件。

### 更新

替换 `263group-brand-guidelines/` 目录（或 `git pull`）后，新会话自动用新版——**无需重装**。skill 是运行时目录扫描，不是安装时复制。

---

## 使用

### 生成一份品牌 PPT / 网页

1. 告诉 Agent 需求（如「帮我做一个 Q3 工作汇报 PPT」或「做一个对外公司介绍网页」）
2. Agent 按「生成前确认」与你确认：使用场景 / 配色 / 输出格式 / 视觉风格 / 封面风格
3. Agent 读品牌数据 → 产出符合品牌规范的自包含文件

### 命令行渲染（HTML）

```bash
node generate.js pages.json   # 生成 pages.html（自包含幻灯片，1920×1080 画布，零外部依赖）
```

> `generate.js` 自动从 skill 目录解析品牌数据/资产文件，任意目录下运行均可。

### 两种使用场景

| 场景 | 触发词 | 封面 | 字体 |
|------|--------|------|------|
| **工作汇报**（内部） | 汇报/述职/总结/周报/月报/季报/年报 | 个性化（ASCII 字符画）或严谨商务风格（红色位图封面） | 微软雅黑栈 |
| **对外展示**（外部） | 介绍/展示/宣传/发布会/对外/客户 | 设计 skill 自由设计（品牌底线内）；渲染器默认兜底封面图 | 开源栈（Noto Sans SC），禁微软雅黑 |

### 两条生成路径

- **路径 A（从零生成）**：Agent 根据用户提纲策划内容 → 渲染
- **路径 B（改写已有）**：Agent 读取已有文件，提取内容，对齐品牌规则

---

## 品牌规则概要

| 规则 | 说明 |
|------|------|
| **配色** | 集团红（默认）；通信蓝（暂不可选，待官方确认）|
| **文字颜色** | 标题 `#2D3847`、正文 `#595959`；禁止纯黑 |
| **字体** | 工作汇报 = 微软雅黑栈；对外展示 = 开源栈（Noto Sans SC），禁微软雅黑 |
| **Logo** | 等比缩放，安全区零容忍，禁止裁切变形 |
| **结尾页** | 必须是最后一页，居中 Logo + slogan |
| **封面** | 工作汇报固定两风格；对外展示品牌底线内自由设计 |

详细规则见 `SKILL.md`（唯一真相源）。

---

## 品牌合规机制

品牌规范对 Agent 是声明式的，本 skill 通过三层闸门把关键规则变成强制：

| 层 | 机制 | 强制强度 |
|----|------|---------|
| **HTML 侧** | `generate.js` fail-loud：结尾页必须最后 / 颜色白名单 / 对外展示禁微软雅黑 | 真 harness（必经渲染路径）|
| **广告法审查** | 对外展示提纲审查违禁词/极限词，命中打断、用户修改后继续 | Agent 自查 + 代码兜底 |
| **PPTX 侧** | 生成后自查清单；代码生成路径用 `brand-check-pptx.py` 做交付断言 | 4b 硬强制 / 设计技能路径清单核对 |

```bash
# PPTX 品牌校验（有 python-pptx 环境时）
python brand-check-pptx.py 产出.pptx --scheme group-red            # 工作汇报
python brand-check-pptx.py 产出.pptx --scheme group-red --external  # 对外展示（额外禁微软雅黑）
```

---

## 目录结构

```
263group-brand-guidelines/            # skill 自包含目录（zip 解压后即此结构）
├── SKILL.md                          # Skill 定义（唯一真相源：生成流程/规则/话术）
├── pptx-python-guide.md              # PPTX 代码生成实现要点
├── brand-tokens.json                 # 品牌视觉规范：色板/字体/Logo/slogan/行距/图表色板/封面
├── company-data.json                 # 公司事实、产品组合、solutions
├── ad-compliance.json                # 广告法合规词库
├── generate.js                       # HTML 渲染器 + 播放壳
├── brand-check-pptx.py               # PPTX 品牌合规检查
├── assets/                           # Logo、slogan、封面位图
└── renderer/slides/*.js              # 8 种 slide 类型渲染器
```

### pages.json 结构

Agent 与渲染器之间的中间格式。顶层字段：`colorScheme`、`logoSet`、`scene`、`companyName`、`slides[]`。

八种 slide 类型：`cover`、`section`、`toc`、`content`、`cards`、`timeline`、`custom`、`end`。**结尾页必须在数组末尾**。

---

## Skill zip 交付

zip 按 **22 文件清单**构建为**自包含 skill 目录结构**（`263group-brand-guidelines/` 为 zip 根）。解压后该目录即完整 skill，可直接用作 skills 目录。zip 必须自包含——SKILL.md 引用的每个文件都必须打包，缺文件会导致外部 AI 工具报错。
