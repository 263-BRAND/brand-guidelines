# 263group-brand-guidelines — 263 品牌 VI 数据层 Skill

为 AI Agent（Claude Code 及各类 AI 工具）提供 263 品牌规范数据层与生成流程，让 Agent 能产出视觉统一的 263 品牌 PPT / 网页 / 文档。

**品牌数据层，不是渲染引擎。** 本 skill 是 263 品牌规则的唯一真相源（色板、字体、Logo、slogan、公司数据、合规词库）。内容策划交给 LLM，排版表现交给设计 skill 或本仓库的兜底渲染器。

***

## 快速开始

### 安装

Skill 是**自包含目录**（`263group-brand-guidelines/`，内含 SKILL.md + 全部数据文件 + 渲染脚本 + 资产）。安装方式：

- **zip 交付包**（推荐，企业版/个人版通用）：解压 `263-vi-skill-MMDD.zip` → 得到 `263group-brand-guidelines/` 目录 → 按工具要求放到 skills 目录（Claude Code：项目 `.claude/skills/` 或用户级 `~/.claude/skills/`；其他工具按其约定）
- **git 仓库**：仓库根是开发/测试源；也可 `git pull` 更新（无需重装，新会话自动用新版）

Skill 由 `SKILL.md` 驱动，Agent 加载后自动读取品牌数据（`brand-tokens.json`、`company-data.json`、`ad-compliance.json`）——所有数据文件以 skill 目录为基准，`generate.js` 内部自动解析（任意 CWD 可运行）。

### 分发与更新（2026-08-20）

| 方式 | 适用 | 更新 |
|------|------|------|
| **zip 交付包**（主） | 全公司企业版/个人版，所有工具 | 替换 zip 目录，重开会话 |
| **git 仓库**（备份/开发源） | 可 clone 的场景 | `git pull`，无需重装 |
| **企业受管配置** | Claude Code Enterprise | IT 统一推送，优先级最高 |

> **无需重装**：skill 是运行时目录扫描，不是安装时复制——替换目录或 `git pull` 后新会话自动用新版。**marketplace 暂不采用**（改调用名、复制进缓存覆盖用户本地改动、需额外配置）。

### 生成一份品牌 PPT/网页

1. 告诉 Agent 需求（如「帮我做一个 Q3 工作汇报 PPT」或「做一个对外公司介绍网页」）
2. Agent 按「生成前确认」逐项与你确认：使用场景 / 配色 / 视觉风格 / 输出格式 / 封面风格
3. Agent 读品牌数据 → 生成 HTML 走 `node generate.js <pages.json>`；生成 PPT 走「PPT 输出路径」分层决策
4. 产出符合品牌规范的自包含文件

### 命令行渲染（HTML）

```bash
node generate.js pages.json   # 生成 pages.html（自包含幻灯片，1920×1080 画布，零外部依赖）
```

***

## 架构

### 数据流

```
用户需求 → 263group-brand-guidelines（品牌决策）→ pages.json → generate.js → slides.html
```

### 两种使用场景

| 场景           | 触发词                  | 封面                              | 字体                      |
| ------------ | -------------------- | ------------------------------- | ----------------------- |
| **工作汇报**（内部） | 汇报/述职/总结/周报/月报/季报/年报 | 个性化（ASCII 字符画）或严谨商务风格（红色位图封面）   | 微软雅黑栈                   |
| **对外展示**（外部） | 介绍/展示/宣传/发布会/对外/客户   | 设计 skill 自由设计（品牌底线内）；渲染器默认兜底封面图 | 开源栈（Noto Sans SC），禁微软雅黑 |

### 两条生成路径

- **路径 A（从零生成）**：Agent 根据用户提纲策划内容 → pages.json → 渲染
- **路径 B（改写已有）**：Agent 读取已有文件，提取内容，对齐品牌规则

***

## 目录结构

仓库根是**开发/测试工作区**（维护用）；**分发 zip 是自包含 skill 目录**（`263group-brand-guidelines/` 内含下方同名列的数据/脚本/资产）。仓库根文件与分发 zip 是同源的两套拷贝——改仓库后重建 zip 同步（`测试记录/build-skill-zip.py`）。

```
263viForAgent/                        # git 仓库（开发源）
├── .claude/skills/263group-brand-guidelines/
│   ├── SKILL.md                  # Skill 定义（唯一真相源，含全部生成流程/规则/话术）
│   └── pptx-python-guide.md      # PPTX 代码生成实现要点（仅「用户坚持代码生成 PPT」时读取）
├── brand-tokens.json             # 品牌视觉规范：色板/字体层级/Logo/slogan/行距/图表色板/封面图
├── company-data.json             # 公司事实、产品组合（3 板块 × 4 业务线）、solutions 8 场景
├── ad-compliance.json            # 广告法合规词库（极限词/承诺词 + 代码层豁免清单）
├── generate.js                   # HTML 渲染器 + 播放壳（1920×1080 画布，响应式缩放，__dirname 自包含）
├── brand-check-pptx.py           # PPTX 品牌合规检查（可选工具，python-pptx，script_dir 自包含）
├── renderer/slides/*.js          # 按 slide 类型的渲染器：cover/section/toc/content/cards/timeline/custom/end
├── assets/                       # Logo、slogan、封面位图（cover-red-template / cover-themed-fallback / template-cover-bg）
├── company-data/                 # 分文件公司数据（facts/products/profile-zh/profile-en）
├── CLAUDE.md                     # Claude Code 工作指南（面向维护者）
├── Design-Decision.md            # 设计决策记录（限界上下文 + 各决策记录）
├── 开发日志.md                    # 开发日志（已完成、待处理）
└── 测试记录/                     # 测试记录与 skill zip 交付包（不入 git）
```

### pages.json 结构

Agent 与渲染器之间的中间格式。顶层字段：`colorScheme`、`logoSet`、`scene`、`companyName`、`slides[]`。

八种 slide 类型：`cover`、`section`、`toc`、`content`、`cards`、`timeline`、`custom`、`end`。**结尾页必须在数组末尾**。

***

## 品牌合规机制（三层闸门）

品牌规范对 Agent 是声明式的，本项目通过三层闸门把关键规则变成强制：

| 层          | 机制                                                                                              | 强制强度                         |
| ---------- | ----------------------------------------------------------------------------------------------- | ---------------------------- |
| **HTML 侧** | `generate.js` fail-loud：结尾页必须最后 / custom.html 颜色白名单 / 对外展示禁微软雅黑                                 | 真 harness（HTML 必经渲染路径，物理绕不过） |
| **广告法审查**  | 对外展示提纲对照 `ad-compliance.json` 审查违禁词/极限词，命中打断、列出给用户改、循环至干净；generate.js 精确匹配兜底（exit 1）            | Agent 自查 + 代码兜底              |
| **PPTX 侧** | SKILL.md「PPTX 生成后自查」7 条清单；4b 代码生成路径用 `brand-check-pptx.py` 做交付断言（不通过不产出）；设计技能产出路径为可选检具 + 清单人工核对 | 4b 硬强制 / 设计技能路径无机器强制（诚实边界）   |

```bash
# PPTX 品牌校验（有 python-pptx 环境时）
python brand-check-pptx.py 产出.pptx --scheme group-red            # 工作汇报
python brand-check-pptx.py 产出.pptx --scheme group-red --external  # 对外展示（额外禁微软雅黑）
```

***

## Skill zip 交付

zip 按 **22 文件清单**构建为**自包含 skill 目录结构**（`263group-brand-guidelines/` 为 zip 根），存入 `测试记录/263-vi-skill-MMDD.zip`，构建脚本 `测试记录/build-skill-zip.py`。zip 必须自包含——SKILL.md 引用的每个文件都必须打包，缺文件会导致外部 AI 工具报错。

**zip 内结构**（`263group-brand-guidelines/` 下）：`SKILL.md` + `pptx-python-guide.md` + `brand-tokens.json` + `company-data.json` + `ad-compliance.json` + `generate.js` + `brand-check-pptx.py` + `assets/*.png`（含 cover-red-template.png / cover-themed-fallback.png / template-cover-bg.png）+ `renderer/slides/*.js`（含 toc.js）——共 22 文件。解压后该目录即完整 skill，可直接用作 skills 目录。

***

## 开发说明

- **渲染**：HTML 渲染依赖 Node.js（`node generate.js <pages.json>`）。环境无 node 时禁止降级约束——按「Node.js 可用性分支」手动生成自包含 HTML 或交外部渲染
- **测试**：测试记录与 skill zip 位于 `测试记录/`（不入 git）；测试提示词参考 `测试记录/测试提示词-*.md`
- **Code review 惯例**：渲染器/UI 变更必须在浏览器实测（窗口缩放、翻页遍历、背景模式切换），只读代码不行
- **维护参考**：`CLAUDE.md`（Claude Code 工作指南）、`Design-Decision.md`（设计决策）、`开发日志.md`（历史进度）

***

## 参考资料

- `视觉参考/` — 263 官方品牌文件（品牌视觉规范手册 PDF/PPTX、各版本 Logo、集团介绍文档）。**不入 git**
- `docs/superpowers/` — 早期设计文档与实现计划（历史归档）

