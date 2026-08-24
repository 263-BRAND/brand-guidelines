# 263group-brand-guidelines — 263集团品牌 VI规范 Skill

为 AI Agent 提供 263集团品牌规范数据层与生成流程，产出视觉统一的 263 品牌 PPT / 网页。**品牌数据层，不是渲染引擎**——内容是 263 品牌规则的唯一真相源（色板、字体、Logo、slogan、公司数据、合规词库）。

**当前版本：v1.1.0**

---

## 如果你是人类，请看这里

### 这是什么

`263group-brand-guidelines` 是一个 **skill 包**（一个 `263group-brand-guidelines/` 文件夹）。安装到 AI 工具的 skills 目录后，AI 就能帮你生成符合 263 品牌规范的 PPT / 网页。

**它能做什么：**
- 统一品牌视觉：色板、字体、Logo、slogan、封面、结尾页规范锁定
- 符合法规：广告法违禁词审查和提示（用于对外展示类内容生成）
- 多格式内容生成辅助：HTML（网页）和 PPT

### 安装

按你的工具类型选择安装方式。

#### 方式一：客户端类 AI 工具（如 Workbuddy / Trae Work）

在工具界面直接上传 zip，无需手动解压：

1. 拿到 `263group-brand-guidelines-<日期>.zip`（测试包，与 skill 同名 + 日期）或 `263group-brand-guidelines-v<版本号>.zip`（正式发布包，与 skill 同名 + 版本号）
2. 点击对话框的 **「+」** → 选择 **「技能」** → **「管理技能」** → **上传 zip**
3. 工具自动解压并注册 skill

> **确认安装成功**：上传后，在工具的技能列表中应能看到本 skill。在对话中尝试生成一个简单的 PPT（例如「帮我做一个 Q3 工作汇报 PPT」），确认能正常工作。核对生效版本见「版本与更新确认」。
> **更新（重要）**：上传新版 zip 前**先删除已安装的旧版 skill**（技能管理里删除旧版），再上传新版。**仅把 zip 作为对话附件上传不会替换已安装的旧版**——agent 生成时仍调用旧版。更新后**新开会话**生效（skill 在会话启动时加载）。

#### 方式二：CLI agent（如 Claude Code）

告知 agent zip 文件路径，agent 自动解压安装到 skills 目录——无需人类手动解压：

> 「把 `263group-brand-guidelines-<日期>.zip` 解压安装到 `.claude/skills/263group-brand-guidelines/`」

1. agent 解压 zip → 得到 `263group-brand-guidelines/` 文件夹
2. agent 把整个文件夹放到 `.claude/skills/` 下（项目级或用户级 `~/.claude/skills/`）
3. **新开对话**后 skill 生效（skill 触发在会话启动时加载）

> **确认安装成功**：新对话中 `/skills` 应能看到本 skill；尝试生成一个简单的 PPT 确认正常。核对生效版本见「版本与更新确认」。
> **更新**：告知 agent 用新版 zip **覆盖安装**到同一目录（确保替换旧文件）；更新后新开对话生效。

#### 方式三：手动解压安装

1. 拿到 `263group-brand-guidelines-<日期>.zip`
2. **解压**——得到 `263group-brand-guidelines/` 文件夹
3. 把整个文件夹放到工具的 skills 目录：
   - **Claude Code**：项目级 `.claude/skills/263group-brand-guidelines/`，或用户级 `~/.claude/skills/263group-brand-guidelines/`
   - **其他 AI 工具**：按其指定的 skills 目录放置
4. 重启工具（或新开对话），skill 即可用

> **确认数据文件**：在 `263group-brand-guidelines/` 文件夹中，确认包含`SKILL.md`、 `brand-tokens.json`、`company-data.json`、`ad-compliance.json`、`generate.js` 这 5 个文件。
> **确认安装成功**：在 AI 对话中，使用“+”加载技能时可见本skill，或使用“/skills”在已安装列表中可见本skill，则安装成功。在对话中尝试生成一个简单的 PPT（例如「帮我做一个 Q3 工作汇报 PPT」），确认能正常工作。
> **更新**：拿到新版 zip → 解压 → **整体替换**旧的 `263group-brand-guidelines/` 文件夹 → 新对话自动用新版，无需重装。核对生效版本见「版本与更新确认」。

#### 方式四：GitHub 安装

```bash
git clone https://github.com/263-BRAND/brand-guidelines.git
```

克隆后，把 `.claude/skills/263group-brand-guidelines/` 目录复制（或链接）到目标工具的 skills 目录。

> **更新**：`git pull` 即可，无需重装。

### 版本与更新确认

**当前版本：v1.1.0**

**如何确认生效版本：** 打开已安装的 `263group-brand-guidelines/` 文件夹，查看 `SKILL.md` 头部 frontmatter 的 `version` 字段——应为 `1.1.0`（旧版无 `version` 字段或版本号更低）。

**更新陷阱（务必注意）：** 向对话「上传 zip 文件」**不等于**更新 skill——agent 生成时调用的是**已安装**的版本。更新必须：
1. 走工具的「技能管理 → 上传 zip 安装」入口（或手动 / CLI 覆盖目录），**不是**当作对话附件
2. **先删除旧版**再装新版（工具不覆盖同名旧 skill 时，旧版仍优先）
3. 更新后**新开会话**（skill 在会话启动时加载）

### 使用

告诉 AI 你的需求即可，例如：
- 「帮我做一个 Q3 工作汇报 PPT」
- 「做一个对外公司介绍网页」

AI 会先与你确认：**使用场景 / 配色 / 输出格式**（对外展示另确认**视觉风格**），然后生成符合品牌规范的文件。

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
2. **生成前确认** → 按场景分支逐字问完编号话术（工作汇报 → 1/2/3；对外展示 → 1/2/3/4）
3. **读取品牌数据** → `brand-tokens.json` + `company-data.json`（对外展示另读 `ad-compliance.json`）
4. **生成** → HTML 走 `generate.js`；PPTX 按「PPT 输出路径」分层决策

### 品牌合规（强制）

- **广告法审查**：对外展示提纲必须对照 `ad-compliance.json` 审查违禁词，命中 → 打断、列出给用户改、循环至干净
- **品牌色板白名单**：只用 `colorSchemes` + `semantic` + `chartPalette` 色值，禁止自造色
- **结尾页**：必须是最后一页（居中 Logo + slogan）
- **PPTX**：产出后按「PPTX 生成后自查」清单核对；代码生成路径用 `brand-check-pptx.py` 做交付断言
