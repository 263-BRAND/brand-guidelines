# VI Skill Refactor — 从渲染引擎到品牌数据层

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 VI 系统从渲染引擎重构为纯品牌数据层，内容策划交给 LLM，排版交给设计 skill。

**Architecture:** 两份 JSON 数据文件（brand-tokens.json + company-data.json）+ 一份设计 skill 推荐配置 + 一个 Claude Code skill 文件 + 精简的兜底渲染器。`agent-prompt.md`、`schema.json`、`vi-apply.js` 废弃。

**Tech Stack:** Node.js (兜底渲染器), JSON (数据文件), Markdown (skill 文件), 零外部依赖。

## Global Constraints

- 品牌色值精确: `#D0121B` (集团红), `#1677FF` (商务蓝)
- 字体: 微软雅黑, 最小字号 16px
- 内页 Logo 固定右上角 113×113px
- 内页背景仅限 white / light-gray
- 封面 Logo 自由放置
- 兜底输出为单一自包含 HTML 文件

---

### Task 1: 创建 brand-tokens.json

**Files:**
- Create: `brand-tokens.json`

**Interfaces:**
- Produces: `brand-tokens.json` — 色板、字体层级、Logo 路径、背景系统

从 `vi-tokens.json` 提取品牌相关字段，移除 `slide.width/height`（渲染器硬编码 1920×1080），移除 `logo.cloud.white`（当前无此文件）。

- [ ] **Step 1: 写入 brand-tokens.json**

```json
{
  "version": "2.0",
  "colorSchemes": {
    "group-red": {
      "primary": "#D0121B",
      "primaryLight": "#FE343F",
      "primaryDark": "#AC000A",
      "accent": "#FF777F",
      "dark": "#2D3847",
      "gray": "#595959",
      "lightGray": "#F2F2F2",
      "white": "#FFFFFF",
      "black": "#000000"
    },
    "business-blue": {
      "primary": "#1677FF",
      "primaryLight": "#4A9BFF",
      "primaryDark": "#0055CC",
      "accent": "#E6F0FF",
      "dark": "#2D3847",
      "gray": "#595959",
      "lightGray": "#F2F2F2",
      "white": "#FFFFFF",
      "black": "#000000"
    }
  },
  "typography": {
    "fontFamily": "\"微软雅黑\", \"Microsoft YaHei\", sans-serif",
    "minSize": 16,
    "sizes": {
      "coverTitle": "48px",
      "sectionTitle": "36px",
      "pageTitle": "32px",
      "subtitle": "24px",
      "body": "20px",
      "caption": "16px"
    }
  },
  "logos": {
    "group": {
      "color": "assets/logos/logo-group-color.png",
      "white": "assets/logos/logo-group-white.png"
    },
    "cloud": {
      "color": "assets/logos/logo-cloud-color.png"
    }
  },
  "slogan": "assets/slogan.png",
  "layout": {
    "innerPageLogo": {
      "right": "80px",
      "top": "46px",
      "width": "113px",
      "height": "113px"
    }
  },
  "backgrounds": {
    "cover": {
      "primary-gradient": "linear-gradient(135deg, {primary} 0%, {primaryDark} 100%)",
      "primary-solid": "{primary}",
      "dark-solid": "{dark}",
      "white": "{white}"
    },
    "inner": {
      "white": "{white}",
      "light-gray": "{lightGray}"
    }
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add brand-tokens.json
git commit -m "feat: add brand-tokens.json — visual layer separated from vi-tokens.json"
```

---

### Task 2: 创建 company-data.json

**Files:**
- Create: `company-data.json`

**Interfaces:**
- Produces: `company-data.json` — 公司基本信息、产品、发展历程

合并 `company-data/facts.json` + `company-data/products.json` 为单个文件。profile 长文保留在 `company-data/profile-zh.md` 和 `company-data/profile-en.md`，在 JSON 中仅引用路径。

- [ ] **Step 1: 写入 company-data.json**

```json
{
  "name": {
    "fullZh": "二六三网络通信股份有限公司",
    "fullEn": "263 Network Communication, Inc.",
    "short": "263集团"
  },
  "stock": "002467.SZ",
  "founded": "1997-12-28",
  "headquarters": "北京市昌平区超前路13号",
  "operationCenter": "北京市朝阳区和平里东土城路14号建达大厦17-18层",
  "website": "https://www.net263.com",
  "phone": "010-84291263",
  "brand": {
    "positioning": "全球数智通信服务商",
    "vision": "全球数智通信服务商",
    "mission": "提升沟通体验和组织效率",
    "purpose": "连接世界 沟通你我"
  },
  "customerScale": {
    "enterprise": "15万+",
    "individual": "千万级"
  },
  "products": [
    {
      "id": "global-network",
      "name": "全球网络",
      "tagline": "构建新一代信息高速公路",
      "description": "拥有计算、存储、网络、5G、安全等基础设施综合能力，提供数据中心、虚拟专网、国际海缆及移动通信的技术支持与运营维护。",
      "subProducts": ["数据中心", "虚拟专网", "国际海缆", "移动通信"]
    },
    {
      "id": "intelligent-communication",
      "name": "智能通信",
      "tagline": "AI融合的通信解决方案",
      "description": "将语音通话、即时消息、视频直播、邮件服务等通信产品与AI技术融合，打造智能客服、智能助理、智联中心等系列产品。",
      "subProducts": ["智能客服", "智能助理", "智联中心", "企业邮箱", "云会议", "企业直播"]
    },
    {
      "id": "digital-service",
      "name": "数字服务",
      "tagline": "数据驱动+智能技术，全链条数字化",
      "description": "以数据驱动+智能技术为核心，构建覆盖数字人、智能体、知识库、内容风控的全链条数字化服务体系。",
      "subProducts": ["数字人", "智能体", "知识库", "内容风控"]
    }
  ],
  "milestones": [
    { "year": "1997", "title": "公司成立", "description": "1997年12月28日，创立于北京，推出互联网接入服务(ISP)试运营。" },
    { "year": "1998", "title": "首推主叫计费拨号上网", "description": "国内首推的主叫计费拨号上网接入服务正式运营，同年推出个人免费邮箱系统，注册用户突破200万。" },
    { "year": "2000", "title": "全国最大ISP服务商", "description": "推出95963全国统一接入号，成为全国最大的ISP服务商。" },
    { "year": "2001", "title": "四星级IDC + 2000万邮箱用户", "description": "成为国内四星级互联网数据中心服务商(IDC)，263免费邮箱注册用户突破2000万。" },
    { "year": "2002", "title": "推出263企业邮箱", "description": "推出263企业邮箱，免费邮箱转型收费邮箱，开启全面商用新征程。" },
    { "year": "2003", "title": "国内最大IP长途代理", "description": "推出96446业务，成长为国内最大的IP长途电话代理商。" },
    { "year": "2004", "title": "多方通信商用牌照", "description": "开通950509多方通话，成为首批拥有国内多方通信商用试验许可牌照的电信增值服务商之一。" },
    { "year": "2008", "title": "进军海外华人通信", "description": "入资美国VoIP运营商iTalkBB，开始海外华人通信服务的业务部署。" },
    { "year": "2010", "title": "深交所A股上市", "description": "2010年9月8日，深圳A股挂牌上市，股票代码002467。" },
    { "year": "2011", "title": "推出263电话会议", "description": "推出263电话会议，发力企业会议市场。" },
    { "year": "2012", "title": "发布云通信产品战略", "description": "发布263云通信产品战略，整合企业邮箱、电话会议和IM，布局企业融合通信。" },
    { "year": "2014", "title": "获得虚拟运营商牌照", "description": "获得移动通信转售业务试点资质(虚拟运营商)，开始移动通信业务运营。" },
    { "year": "2015", "title": "全资收购展视互动", "description": "全资收购直播厂商展视互动，加码企业通信协作市场。" },
    { "year": "2016", "title": "与NTT合作IDC业务", "description": "与NTT集团合作成立合资公司，获得互联网资源协作牌照，专注于国际IDC业务开拓。" },
    { "year": "2017", "title": "联合Arkadin云通信", "description": "联合Arkadin提供云通信解决方案，提供领先的中国市场电话会议解决方案。" },
    { "year": "2018", "title": "收购日升集团", "description": "收购日升集团100%股权，提供企业跨境数据通信服务。" },
    { "year": "2019", "title": "发布\"视频+\"战略", "description": "发布\"视频+\"战略，夯实音视频基础实力。" },
    { "year": "2020", "title": "推出263云视", "description": "推出263云视，提升企业视频沟通与协作效率。" },
    { "year": "2021", "title": "推进办公国产化", "description": "推出信创版企业邮箱，率先推进办公应用国产化。" },
    { "year": "2022", "title": "AI数字化战略", "description": "启动\"打造智能云连接 赋能数字化转型\"战略。" },
    { "year": "2023", "title": "推出AI数字人", "description": "推出AI数字人，打造智能新连接。" },
    { "year": "2024", "title": "三大增长引擎", "description": "布局企业全球化、数字化、智能化三大增长引擎。" },
    { "year": "2025", "title": "布局数智通信", "description": "布局数智通信，发力AI应用。" }
  ],
  "profile": {
    "zh": "company-data/profile-zh.md",
    "en": "company-data/profile-en.md"
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add company-data.json
git commit -m "feat: add company-data.json — merged from company-data/ facts + products"
```

---

### Task 3: 创建设计 skill 推荐配置文件

**Files:**
- Create: `design-skill-recommendations.json`

**Interfaces:**
- Produces: `design-skill-recommendations.json` — 平台→推荐设计 skill 的映射

- [ ] **Step 1: 写入 design-skill-recommendations.json**

```json
{
  "claude-code": {
    "skills": [],
    "fallbackMessage": "建议安装 ui-ux-pro-max 或 frontend-design skill 以获得专业排版效果。安装后重新运行即可自动调用。"
  },
  "codex": {
    "skills": [],
    "fallbackMessage": "建议安装 PPT 制作相关 skill。"
  },
  "trae": {
    "skills": [],
    "fallbackMessage": "建议安装 PPT 制作相关 skill。"
  },
  "web": {
    "skills": [],
    "fallbackMessage": "当前使用内置基础模板。如需专业设计效果，建议使用 Claude Code / Codex / Trae 等桌面工具并安装设计类 skill。"
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add design-skill-recommendations.json
git commit -m "feat: add design-skill-recommendations.json — platform-specific design skill map"
```

---

### Task 4: 创建 VI Skill 文件（Claude Code）

**Files:**
- Create: `skills/263-vi.md`

Claude Code skill 文件。VI 规范作为 skill 嵌入到项目中，告诉 agent 如何使用品牌数据。

- [ ] **Step 1: 写入 skills/263-vi.md**

```markdown
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
| `brand-tokens.json` | 色板、字体、Logo 路径、背景规则 | 每次 |
| `company-data.json` | 公司名称、产品、发展历程等信息 | 按需 |
| `design-skill-recommendations.json` | 平台设计 skill 推荐 | 无设计 skill 时 |

## 核心品牌规则

### 色板

两套配色方案，通过 `colorSchemes` 选择：

- **集团红（group-red）**：主色 `#D0121B`，用于集团层面的 PPT 和对外物料（默认）
- **商务蓝（business-blue）**：主色 `#1677FF`，用于云通信产品线或技术导向的物料

每个配色方案包含 9 个色值：primary / primaryLight / primaryDark / accent / dark / gray / lightGray / white / black。所有颜色必须从 `brand-tokens.json` 读取，不自己发明。

### 字体

- 字体：微软雅黑
- 绝对底线：font-size < 16px 不可用。这是一条硬规则，违反会导致内容无法通过审查。

### Logo

- 集团 Logo：用于集团层面的物料（默认）
- 云通信 Logo：用于云通信产品线的物料
- 内页 Logo 固定在右上角（约 113×113px，距右 80px，距顶 46px，基于 1920×1080）
- 封面 Logo 位置不做限制
- 深色背景 → 反白 Logo；浅色背景 → 彩稿 Logo

### 背景系统

- 封面页：可选 primary-gradient / primary-solid / dark-solid / white
- 内页：仅限 white 或 light-gray

## 工作流程

### 开始前：确认品牌参数

1. **配色**：集团红还是商务蓝？（默认集团红）
2. **Logo**：集团标还是云通信标？（根据业务线推断，默认集团标）

### 流程 A：检测到设计 skill（推荐）

如果当前环境有可用的设计/UI/PPT 类 skill（如 `ui-ux-pro-max`、`frontend-design` 等）：

1. 读取 `brand-tokens.json`，将品牌数据交给设计 skill
2. 说："品牌数据已准备好（brand-tokens.json），由 [设计 skill 名称] 接手排版。"
3. 设计 skill 按其最佳实践渲染，你只需确保品牌色值不被覆盖

### 流程 B：无设计 skill（兜底）

如果当前环境没有设计 skill：

1. 读取 `design-skill-recommendations.json`，显示对应平台的安装建议
2. 使用内置基础渲染器生成 HTML 幻灯片：
   ```bash
   node generate.js <pages.json>
   ```
3. 在输出末尾标注安装建议

### 流程 C：纯内容咨询

如果用户只问"263 是做什么的"、"有哪些产品"等信息性问题，不涉及 PPT 制作：
- 从 `company-data.json` 提取相关信息回答
- 不需要读取 `brand-tokens.json`

## HTML 输出规范（无设计 skill 时）

当使用兜底渲染器时，按以下规范输出：
- 零外部依赖，单一 HTML 文件，浏览器直接打开
- 播放壳：全屏/键盘翻页/点击翻页
- 内页 Logo 固定
- 深底自动反白
- 字号不低于 16px

## 与设计 skill 协作

当你把品牌数据交给设计 skill 时，明确以下边界：

- **你管的**：告诉我品牌色是什么、Logo 在哪、用什么字体
- **你不管的**：卡片怎么排、动画怎么做、阴影用几层 — 设计 skill 自行决定

## 禁止事项

- 不要在生成的页面中使用非 263 色板的颜色
- 不要编造公司信息（名称、股票代码、数据等）
- 不要用 font-size < 16px
- 不要在内页自定义 Logo 位置
```

- [ ] **Step 2: 提交**

```bash
git add skills/263-vi.md
git commit -m "feat: add 263-vi skill — brand data layer skill for Claude Code"
```

---

### Task 5: 更新兜底渲染器 generate.js

**Files:**
- Modify: `generate.js:18` — 读取路径从 `vi-tokens.json` → `brand-tokens.json`
- Modify: `renderer/slides/cover.js` — 使用硬编码 slide 尺寸
- Modify: `renderer/slides/section.js` — 同上
- Modify: `renderer/slides/content.js` — 同上
- Modify: `renderer/slides/cards.js` — 同上
- Modify: `renderer/slides/timeline.js` — 同上
- Modify: `renderer/slides/end.js` — 同上

移除对旧 `vi-tokens.json` 的依赖，改为读取 `brand-tokens.json`。slide 尺寸硬编码 1920×1080。

- [ ] **Step 1: 更新 generate.js 第 18 行**

```javascript
// 将
const tokens = JSON.parse(fs.readFileSync('vi-tokens.json', 'utf-8'));
// 改为
const tokens = JSON.parse(fs.readFileSync('brand-tokens.json', 'utf-8'));
```

- [ ] **Step 2: 更新 generate.js — 硬编码 slide 尺寸**

在 `buildHtml` 函数中（第 126-127 行），将：

```javascript
var W = opts.tokens.slide.width;
var H = opts.tokens.slide.height;
```

改为：

```javascript
var W = 1920;
var H = 1080;
```

- [ ] **Step 3: 验证 generate.js 仍能读取 tokens**

运行已有示例验证：

```bash
node generate.js examples/sample-pages.json
```

**预期:** 生成 `examples/sample-pages.html`，无错误。

- [ ] **Step 4: 提交**

```bash
git add generate.js
git commit -m "fix: update generate.js to read brand-tokens.json, hardcode slide dimensions"
```

---

### Task 6: 清理废弃文件

**Files:**
- Remove/Archive: `agent-prompt.md`
- Remove/Archive: `schema.json`
- Remove/Archive: `vi-apply.js`

这些文件的功能被替代：
- `agent-prompt.md` → 内容策划交给 LLM，品牌规则在 `skills/263-vi.md`
- `schema.json` → 页面类型不再由 VI skill 管控
- `vi-apply.js` → 路径 B 功能由设计 skill 替代

- [ ] **Step 1: 移除废弃文件**

```bash
git rm agent-prompt.md schema.json vi-apply.js
```

- [ ] **Step 2: 提交**

```bash
git commit -m "refactor: remove deprecated files — replaced by brand data layer + design skill delegation"
```

---

### Task 7: 删除旧 vi-tokens.json

**Files:**
- Remove: `vi-tokens.json` — 已被 `brand-tokens.json` 替代

这是对 Task 1 的收尾 — 确保旧文件不残留。

- [ ] **Step 1: 删除旧文件**

```bash
git rm vi-tokens.json
```

- [ ] **Step 2: 提交**

```bash
git commit -m "refactor: remove vi-tokens.json — replaced by brand-tokens.json"
```

---

### Task 8: 端到端验证

**Files:**
- 无新文件，验证已有流程。

- [ ] **Step 1: 验证兜底渲染器流程**

```bash
node generate.js examples/sample-pages.json
```

**预期:**
- 生成 `examples/sample-pages.html`
- 浏览器打开后，幻灯片可翻页、Fullscreen
- 色值使用 `brand-tokens.json` 中的值
- Logo 正确显示

- [ ] **Step 2: 验证 JSON 文件结构**

```bash
node -e "const b = require('./brand-tokens.json'); console.log('colorSchemes:', Object.keys(b.colorSchemes)); console.log('logos:', Object.keys(b.logos));"
node -e "const c = require('./company-data.json'); console.log('name:', c.name.short); console.log('products:', c.products.length); console.log('milestones:', c.milestones.length);"
node -e "const d = require('./design-skill-recommendations.json'); console.log('platforms:', Object.keys(d));"
```

**预期:**
```
colorSchemes: group-red, business-blue
logos: group, cloud
name: 263集团
products: 3
milestones: 23
platforms: claude-code, codex, trae, web
```

- [ ] **Step 3: 提交验证脚本（可选）**

不提交验证命令，这是手动验证步骤。通过后继续。

---

### Task 9: 更新 PROJECT-STATUS.md

**Files:**
- Modify: `PROJECT-STATUS.md`

更新项目状态文档，反映架构变更。

- [ ] **Step 1: 更新 PROJECT-STATUS.md 的"核心思路"部分**

将：

```
**"只约束 VI，不限制布局。"** — 这是一套 agent 可读的 VI 设计系统，不是固定页面模板。Agent 负责内容策划和页面类型组合，VI 系统保证视觉一致性。
```

改为：

```
**"品牌数据层，不是渲染引擎。"** — VI skill 是 263 品牌数据的唯一真相源。内容策划交给 LLM，排版渲染交给设计 skill。VI skill 只输出 brand-tokens.json + company-data.json。
```

- [ ] **Step 2: 更新三条路径图**

将路径图更新为：

```
用户需求
├── 有设计 skill → VI skill 输出品牌数据 → 设计 skill 专业排版
└── 无设计 skill → VI skill 输出品牌数据 → 兜底渲染器生成 HTML + 升级建议
```

- [ ] **Step 3: 更新"已完成"表**

在顶部添加新条目：

```markdown
| 文件 | 用途 | 状态 |
|------|------|:--:|
| `brand-tokens.json` | 品牌视觉规范（替代 vi-tokens.json） | ✓ |
| `company-data.json` | 公司信息（合并 company-data/） | ✓ |
| `design-skill-recommendations.json` | 平台设计 skill 推荐 | ✓ |
| `skills/263-vi.md` | Claude Code VI skill 文件 | ✓ |
```

- [ ] **Step 4: 更新"待继续"表**

移除：
- 排版升级相关条目
- 12 种页面类型扩展
- vi-apply.js 打磨

新增：
```markdown
- [ ] **补全设计 skill 推荐列表** — 调研 Codex / Trae 平台可用的设计 skill
- [ ] **Web chatbot 适配方案** — 前端渲染器（浏览器端 generate）
- [ ] **设计 skill 调研** — 确认各平台最适合的 PPT/设计 skill
```

- [ ] **Step 5: 提交**

```bash
git add PROJECT-STATUS.md
git commit -m "docs: update PROJECT-STATUS for VI skill refactor"
```

---
