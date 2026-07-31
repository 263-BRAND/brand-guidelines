# 263 VI 规范 Skill 重构设计

**日期：** 2026-07-31
**状态：** 设计阶段
**上继：** `2026-07-30-ppt-vi-template-system-design.md`（Phase 1 实现）

---

## 背景

当前 VI 系统在 Phase 1 中构建了渲染器（generate.js）+ VI 应用器（vi-apply.js）+ Agent 指令（agent-prompt.md），存在两个结构性问题：

1. **VI skill 承担了不该承担的渲染职责。** 参考文件 `ai-competition-ppt-v4.html` 证明，同样的色号 `#D0121B`，有设计能力的人产出远优于当前渲染器。VI 规范应该管"品牌正确"，设计排版应该交给专业的设计 skill。

2. **忽略了用户场景分化。** 用户分为两类：已有设计 skill 的（只需品牌数据），和没有设计 skill 的（需要兜底帮助）。当前系统没有考虑这种分化。

## 核心思路

**VI skill 只做品牌的唯一真相源。内容策划交给 LLM，排版渲染交给设计 skill。**

```
LLM / Agent（内容策划）
    ↓
设计 skill（排版渲染）← 读取 brand-tokens.json
    ↓
专业排版 PPT（HTML / PPTX / 等）

VI skill 的角色：
→ 确认品牌参数（配色、Logo）
→ 输出 brand-tokens.json + company-data.json 文件路径
→ 不干预内容和排版
```

## 架构

```
用户: "帮我做一份云通信产品介绍的PPT"
                ↓
          VI skill（入口）
                ↓
    1. 确认配色方案（集团红 / 商务蓝，默认集团红）
    2. 确认 Logo 方案（集团标 / 云通信标）
                ↓
    3. 环境检测（静默）
       ├── 什么平台？
       └── 有什么设计/PPT skill 可用？
                ↓
    ┌───────────┴───────────┐
    │                       │
 有设计 skill             无设计 skill
    │                       │
    ↓                       ↓
VI skill 输出：            VI skill 输出：
  brand-tokens.json        brand-tokens.json
  company-data.json        company-data.json
  委托设计 skill           用内置基础渲染器
    │                      生成 HTML
    ↓                      标出升级建议
专业排版 PPT               │
                         兜底可用 HTML
```

### 三层职责

| 层 | 负责方 | 职责 |
|----|--------|------|
| 内容策划 | LLM / Agent | 决定页面类型和顺序、组织内容、从 company-data.json 提取信息 |
| 品牌数据 | VI skill | 提供 brand-tokens.json + company-data.json |
| 排版渲染 | 设计 skill / 兜底渲染器 | 将内容 + 品牌数据渲染为可播放的幻灯片 |

## 品牌数据文件

### `brand-tokens.json` — 视觉层

设计 skill 必读。包含色板、字体、Logo 路径、背景规则。

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
    "cover": ["primary-gradient", "primary-solid", "dark-solid", "white"],
    "inner": ["white", "light-gray"]
  }
}
```

### `company-data.json` — 内容层

Agent 按需读取。包含公司基本信息、产品、发展历程。

```json
{
  "name": {
    "full": "二六三网络通信股份有限公司",
    "short": "263集团",
    "en": "NET263 Ltd."
  },
  "stock": "002467",
  "founded": 1997,
  "headquarters": "北京",
  "vision": "全球数智通信服务商",
  "mission": "连接世界 沟通你我",
  "products": [
    {
      "name": "全球网络",
      "description": "全球企业互联、数据中心服务等"
    },
    {
      "name": "智能通信",
      "description": "云通信平台、企业邮箱、视频会议等"
    },
    {
      "name": "数字服务",
      "description": "数字化解决方案"
    }
  ],
  "milestones": [
    { "year": "1997", "event": "公司成立" },
    { "year": "2010", "event": "深交所上市" }
  ],
  "profile": {
    "zh": "company-data/profile-zh.md",
    "en": "company-data/profile-en.md"
  }
}
```

### 谁用哪份文件

| 文件 | 使用者 | 何时读 |
|------|--------|--------|
| `brand-tokens.json` | 设计 skill / 兜底渲染器 | 每次必读 |
| `company-data.json` | LLM / Agent | 用户需求涉及公司信息时 |

## VI Skill 行为

定位为极简的"品牌开关"。不策划内容、不渲染排版。

### 完整交互流程

```
触发条件：用户提到"PPT""幻灯片""介绍""汇报""路演"等，且涉及 263 品牌

1. 确认配色方案
   → "使用集团红还是商务蓝？"（默认集团红）

2. 确认 Logo 方案
   → 根据业务线推断（全球网络/云通信 → cloud，其他 → group）
   → 不确定时询问

3. 环境检测（静默，不打扰用户）
   → 识别运行平台
   → 检测是否有设计/排版/PPT 类 skill

4. 输出品牌数据
   → "品牌数据已准备好：brand-tokens.json / company-data.json"
   → 有设计 skill：委托设计 skill 接手
   → 无设计 skill：用兜底渲染器生成 + 建议安装设计 skill
```

### VI skill 不做的事

- 不输出 pages.json（内容策划是 LLM 的职责）
- 不生成 CSS/HTML（排版是设计 skill 的职责）
- 不拼接页面结构、不选页面类型

## 兜底渲染器

当没有设计 skill 时使用。保留当前 `generate.js` 的精简版。

### 保留的内容

- 6 种页面类型渲染器（cover / section / content / cards / timeline / end）
- 播放壳（全屏/键盘翻页/点击翻页）
- Logo 自动深底反白
- 背景系统（封面 4 选项，内页白/浅灰）
- 字号 < 16px 阻断

### 不新增的内容

- 设计装饰（阴影、动画、渐变效果）
- 复杂布局变体
- 卡片悬停动效

### 输出提示

兜底渲染完成后，在响应末尾标注：

> 当前使用内置基础模板。建议为你的平台安装设计类 skill 以获得专业排版效果。

## 设计 Skill 接口

设计 skill 读取 `brand-tokens.json`，使用其中的色值、字体、Logo 进行排版。

### 最小约定

1. 设计 skill 从 `brand-tokens.json` 读取所有视觉参数
2. 配色使用 `colorSchemes.<scheme>` 中的值，不自己发明
3. 字体使用 `typography.fontFamily`，字体大小参考 `typography.sizes`
4. 内页 Logo 放在 `layout.innerPageLogo` 指定的位置
5. Logo 深底反白由设计 skill 自行判断或接受 Agent 指定

### 设计 skill 不需要关心的事

- 公司全称、股票代码、愿景使命（这不是排版的事）
- 色值是否准确（信任 brand-tokens.json）
- Logo 文件从哪来（路径已指定）

## 平台适配

### 基本原则

VI skill 的核心逻辑（确认配色 → 输出数据文件）在所有平台上一致。差异仅在于：

1. 设计 skill 的检测方式
2. 推荐的具体设计 skill 名称

### 已知平台

| 平台 | 设计 skill 推荐 | 状态 |
|------|---------------|:--:|
| Claude Code | `ui-ux-pro-max` / `frontend-design` | 待调研 |
| Codex | 待调研 | 待调研 |
| Trae | 待调研 | 待调研 |
| Web chatbot（不支持 skill） | 无，走兜底渲染 | — |
| Web chatbot（支持 skill） | 取决于平台 skill 生态 | 待调研 |

### 设计 skill 推荐列表

独立维护在一个确定位置（如 `design-skill-recommendations.json`），VI skill 运行时读取。格式：

```json
{
  "claude-code": {
    "skills": ["ui-ux-pro-max"],
    "fallbackMessage": "建议安装 ui-ux-pro-max skill"
  },
  "codex": {
    "skills": ["待调研"],
    "fallbackMessage": "建议安装 XXX"
  },
  "trae": {
    "skills": ["待调研"],
    "fallbackMessage": "建议安装 XXX"
  }
}
```

## 迁移计划

### 保留的文件

| 文件 | 处理方式 |
|------|---------|
| `brand-tokens.json`（原 `vi-tokens.json`） | 重命名，内容精简（去掉 slide 尺寸等非品牌字段） |
| `company-data/` → `company-data.json` | 合并为单一 JSON，方便跨平台引用 |
| `assets/logos/` | 不变 |
| `assets/slogan.png` | 不变 |
| `renderer/` | 保留为兜底渲染器 |
| `generate.js` | 保留精简版 |

### 废弃的文件

| 文件 | 原因 |
|------|------|
| `agent-prompt.md` | 内容策划交给 LLM，不再需要 Agent 指令 |
| `schema.json` | pages.json 不再由 VI skill 管控 |
| `vi-apply.js` | 路径 B 功能由设计 skill 替代 |

### 不再维护的功能

- 路径 A 的渲染器排版升级（Phase 2 中的布局变体、装饰元素等）
- 路径 B 的 vi-apply.js 打磨
- 12 种页面类型扩展（不再需要，LLM 自由决定页面类型）

---

## 设计决策记录

1. **两份 JSON 而非一份：** `brand-tokens.json`（视觉）和 `company-data.json`（内容）分离，设计 skill 只需要读前者，Agent 按需读取后者。

2. **JSON 文件引用而非 prompt 注入：** JSON 是精确的（`#D0121B` 不会变），prompt 是模糊的（模型可能"理解"成其他红色）。

3. **内容策划交给 LLM：** LLM 天然具备页面结构规划能力，不需要 VI skill 管控页面类型和顺序。

4. **兜底渲染器保留：** 保证无设计 skill 的用户仍能产出可用的 HTML 幻灯片。

5. **设计 skill 推荐列表独立维护：** 新增平台或设计 skill 时只需改一个配置文件，不改 VI skill 逻辑。
