# 263group-brand-guidelines — 263 品牌 VI 数据层 Skill

为 AI Agent 提供 263 品牌规范数据层与生成流程，产出视觉统一的 263 品牌 PPT / 网页。**品牌数据层，不是渲染引擎**——内容是 263 品牌规则的唯一真相源（色板、字体、Logo、slogan、公司数据、合规词库）。

---

## 如果你是人类，请看这里

### 这是什么

`263group-brand-guidelines` 是一个 **skill 包**（一个 `263group-brand-guidelines/` 文件夹）。安装到 AI 工具的 skills 目录后，AI 就能帮你生成符合 263 品牌规范的 PPT / 网页。

**它能做什么：**
- 统一品牌视觉：色板、字体、Logo、slogan、封面、结尾页规范锁定
- 符合法规：广告法违禁词审查和提示（用于对外展示类内容生成）
- 多格式内容生成辅助：HTML（网页）和 PPT

### 安装

有两种方式，任选其一。

#### 方式一：zip 安装（推荐）

1. 拿到 `263group-brand-guidelines-<日期>.zip`（与 skill 同名 + 日期）
2. **解压**——得到 `263group-brand-guidelines/` 文件夹
3. 把整个 `263group-brand-guidelines/` 文件夹放到工具的 skills 目录：
   - **Claude Code**：项目级 `.claude/skills/263group-brand-guidelines/`，或用户级 `~/.claude/skills/263group-brand-guidelines/`
   - **其他 AI 工具**：按其指定的 skills 目录放置
4. 重启工具（或新开对话），skill 即可用
5. **确认数据文件**：在 `263group-brand-guidelines/` 文件夹中，确认包含`SKILL.md`、 `brand-tokens.json`、`company-data.json`、`ad-compliance.json`、`generate.js` 这 5 个文件。
6. **确认安装成功**：在 AI 对话中，使用“+”加载技能时可见本skill，或使用“/skills”在已安装列表中可见本skill，则安装成功。在对话中尝试生成一个简单的 PPT（例如「帮我做一个 Q3 工作汇报 PPT」），确认能正常工作。
> **更新**：拿到新版 zip → 解压 → 替换旧的 `263group-brand-guidelines/` 文件夹 → 新对话自动用新版，无需重装。

#### 方式二：GitHub 安装

```bash
git clone https://github.com/263-BRAND/brand-guidelines.git
```

克隆后，把 `.claude/skills/263group-brand-guidelines/` 目录复制（或链接）到目标工具的 skills 目录。

> **更新**：`git pull` 即可，无需重装。

### 使用

告诉 AI 你的需求即可，例如：
- 「帮我做一个 Q3 工作汇报 PPT」
- 「做一个对外公司介绍网页」

AI 会先与你确认：**使用场景 / 配色 / 输出格式 / 视觉风格 / 封面风格**，然后生成符合品牌规范的文件。

---

## 如果你是 Agent，请看这里

### 获取本 skill

```bash
git clone https://github.com/263-BRAND/brand-guidelines.git
```

skill 位于 `.claude/skills/263group-brand-guidelines/`。更新用 `git pull`。
如果人类希望你自主安装、自主调用，请读取上方「如果你是人类，请看这里 → 安装」按步骤执行。

### 你的职责

你负责 263 品牌数据层的全部决策。生成任何品牌内容前，**必须先完成「生成前确认」**——逐字询问用户并确认后，才能开始生成（见 `SKILL.md` → 生成前确认 → 用户话术）。

### 数据文件（位于本 skill 目录）

| 文件 | 内容 |
|------|------|
| `brand-tokens.json` | 色板、字体层级、Logo、slogan、行距、图表色板、封面图 |
| `company-data.json` | 公司事实、产品组合（3 板块 × 4 业务线）、solutions |
| `ad-compliance.json` | 广告法合规词库（极限词/承诺词 + 豁免清单）|
| `generate.js` | HTML 渲染器（`node generate.js <pages.json>`，自包含、任意 CWD 可运行）|
| `brand-check-pptx.py` | PPTX 品牌合规校验（python-pptx）|
| `pptx-python-guide.md` | PPTX 代码生成实现要点（仅「用户坚持代码生成 PPT」时读取）|

**所有品牌规则、生成流程、用户话术、合规机制的唯一真相源是 `SKILL.md`。** 生成前必须完整读取并遵循。

### 生成流程

1. **场景判断** → 工作汇报（内部）还是对外展示（外部），见 SKILL.md「场景判断」
2. **生成前确认** → 按场景分支逐字问完编号话术（工作汇报 → 1/2/3/5；对外展示 → 1/2/3/4）
3. **读取品牌数据** → `brand-tokens.json` + `company-data.json`（对外展示另读 `ad-compliance.json`）
4. **生成** → HTML 走 `generate.js`；PPTX 按「PPT 输出路径」分层决策

### 品牌合规（强制）

- **广告法审查**：对外展示提纲必须对照 `ad-compliance.json` 审查违禁词，命中 → 打断、列出给用户改、循环至干净
- **品牌色板白名单**：只用 `colorSchemes` + `semantic` + `chartPalette` 色值，禁止自造色
- **结尾页**：必须是最后一页（居中 Logo + slogan）
- **PPTX**：产出后按「PPTX 生成后自查」清单核对；代码生成路径用 `brand-check-pptx.py` 做交付断言
