# VI Skill 重构 — 对齐 CONTEXT.md 设计树

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `skills/263-vi.md`、`brand-tokens.json`、`company-data.json` 与 `CONTEXT.md` 设计树对齐——引入 Template/Themed 双模式、2×2 路径矩阵、字体层级修正、产品四层结构。

**Architecture:** 品牌数据层不改渲染引擎。generate.js 不变。brand-tokens.json 扩展字号层级 + 硬规则；company-data.json 重写产品结构对齐讲义；263-vi.md 重写工作流逻辑。

**Tech Stack:** JSON 数据文件 + Markdown skill 指令（Agent 消费，非编译代码）

## Global Constraints

- 最小字号 20pt（非 16px）
- 正文字体：微软雅黑
- 主色：`#D0121B`（集团红）
- 色值从 brand-tokens.json 读取，不硬编码
- generate.js 接口不变（`tokens.colorSchemes`、`tokens.typography.fontFamily`、`tokens.layout`、`tokens.backgrounds`、`tokens.logos[logoSet]`、`tokens.slogan`）

---

### Task 1: 修正 brand-tokens.json — 字体层级

**Files:**
- Modify: `brand-tokens.json`

**Interfaces:**
- Produces: `typography.minSize` → `20`（number）, `typography.scale` → 包含 Template/Themed 两套值，`typography.scale.coverTitle.template` → `"64pt"` 等

- [ ] **Step 1: 更新 typography 字段**

将 `typography` 从旧结构（minSize: 16, sizes 全 px 旧值）改为新结构：

```json
"typography": {
  "fontFamily": "\"微软雅黑\", \"Microsoft YaHei\", sans-serif",
  "minSize": 20,
  "scale": {
    "coverTitle":   { "template": "64pt", "themed": { "min": "56pt", "max": "72pt" } },
    "contentTitle": { "template": "40pt", "themed": { "min": "36pt", "max": "44pt" } },
    "subtitle":     { "template": "30pt", "themed": { "min": "28pt", "max": "32pt" } },
    "body":         { "template": "26pt", "themed": { "min": "24pt", "max": "28pt" } },
    "caption":      { "template": "22pt", "themed": { "min": "20pt", "max": "24pt" } }
  }
}
```

删除旧的 `sizes` 字段（`coverTitle`/`sectionTitle`/`pageTitle`/`subtitle`/`body`/`caption`）。generate.js 不依赖 `sizes`，只读 `fontFamily`。

- [ ] **Step 2: 验证 generate.js 不报错**

Run: `node -e "const t = require('./brand-tokens.json'); console.log(t.typography.minSize); console.log(t.typography.fontFamily); console.log(t.typography.scale.body.template);"`
Expected: 输出 `20`、字体名、`26pt`，无报错。

- [ ] **Step 3: 验证 generate.js 正常输出**

Run: `node generate.js examples/pages.json`
Expected: 正常生成 HTML，无报错。

- [ ] **Step 4: Commit**

```bash
git add brand-tokens.json
git commit -m "fix: update typography scale — minSize 16→20pt, add Template/Themed sizing"
```

---

### Task 2: 扩展 brand-tokens.json — Logo 结构 + 硬规则

**Files:**
- Modify: `brand-tokens.json`

**Interfaces:**
- Consumes: Task 1 的 `typography` 新结构
- Produces: `logos.cloud.white` → `"assets/logos/logo-cloud-white.png"`, `logos.businessLines` → 业务线→Logo 映射, `hardRules` → 硬规则清单

- [ ] **Step 1: 补全云通信 Logo 反白稿路径**

文件 `视觉参考/logo-云通信-白.png` 已存在。在 `logos.cloud` 下新增 `"white": "assets/logos/logo-cloud-white.png"`。

- [ ] **Step 2: 新增业务线 Logo 映射**

在 `logos` 下新增 `businessLines` 字段：

```json
"businessLines": {
  "group": { "color": "assets/logos/logo-group-color.png", "white": "assets/logos/logo-group-white.png" },
  "cloud-communication": { "color": "assets/logos/logo-cloud-color.png", "white": "assets/logos/logo-cloud-white.png" }
}
```

- [ ] **Step 3: 新增硬规则清单**

在 JSON 顶层新增 `hardRules`：

```json
"hardRules": {
  "logo": {
    "innerPageSize": "113x113px",
    "safeZone": "Logo安全区内禁止任何装饰元素、文字、图标、分割线",
    "shallowBg": "彩稿Logo",
    "darkBg": "反白Logo",
    "endingPage": "居中Logo + slogan PNG"
  },
  "typography": {
    "absoluteMinSize": "20pt",
    "bodyMinSize": "24pt",
    "fontFamily": "微软雅黑"
  },
  "color": {
    "primary": "#D0121B",
    "disallowed": "严禁使用非色板颜色"
  }
}
```

- [ ] **Step 4: 验证 JSON 合法**

Run: `node -e "const t = require('./brand-tokens.json'); console.log(t.logos.cloud.white); console.log(t.hardRules.logo.innerPageSize); console.log(Object.keys(t.logos.businessLines));"`
Expected: 输出云通信白 Logo 路径、`113x113px`、`[ 'group', 'cloud-communication' ]`。

- [ ] **Step 5: Commit**

```bash
git add brand-tokens.json
git commit -m "feat: add business-line logo mapping and hard rules to brand-tokens.json"
```

---

### Task 3: 重写 company-data.json — 产品四层结构

**Files:**
- Modify: `company-data.json`

**Interfaces:**
- Produces: `products` 数组改为三大板块 × 四业务线 × 产品能力结构；新增 `qualifications`、`stats` 字段

- [ ] **Step 1: 用讲义结构重写 `products`**

删除旧的 3 个产品条目（`global-network`/`intelligent-communication`/`digital-service`），替换为：

```json
"products": [
  {
    "id": "global-network",
    "name": "全球网络",
    "positioning": "筑牢通信基石，打造全球信息高速公路",
    "businessLines": [
      {
        "name": "环球专线",
        "description": "搭建跨境通信的高速通路",
        "capabilities": [
          "IPLC/IEPL专线",
          "海缆资源：APG/PEACE/JUPITER",
          "优质传输通道，低延迟，多路径可选",
          "计费模式灵活，有效节约跨境网络成本",
          "端到端一站式交付，覆盖多国POP节点"
        ]
      },
      {
        "name": "国际专网",
        "description": "解决多点跨境组网的复杂性连接，三层解决方案",
        "capabilities": [
          "SR-MPLS：底层网络，2000+精细化应用识别策略",
          "SD-WAN：融合专线与公网智能路由，覆盖100+城市/45+国内节点",
          "SASE安全方案：云端零信任+云防火墙+云应用防护"
        ]
      },
      {
        "name": "数据中心",
        "description": "高品质IDC托管服务",
        "capabilities": [
          "SLA 99.99%高可用保障",
          "运营商中立，支持丰富线路灵活接入",
          "Tier 3+等级，国标A级+国际T3双标准",
          "全链路冗余设计：电源/空调/配电无感知切换",
          "7×24驻场安保，多重生物识别门禁，机柜独立电子锁",
          "DCI互联：北京/上海/杭州/香港/东京/新加坡"
        ]
      },
      {
        "name": "移动通信",
        "description": "移动通信转售业务，覆盖国内和北美",
        "capabilities": [
          "一卡双号：一张SIM卡同时拥有中国内地号和境外当地号",
          "语音处理平台：通信质检/运营计费一站式",
          "AI内容风控：AI+人工双重质检，高危关键词自动挂断",
          "套餐定制灵活计费，API接口快速接入企业办公平台"
        ]
      }
    ]
  },
  {
    "id": "smart-services",
    "name": "智能服务",
    "positioning": "传统通信能力与AI技术深度融合，赋能千行百业数字化升级",
    "businessLines": [
      {
        "name": "呼叫中心AICC",
        "description": "AI驱动的智能联络中心，全场景重塑客户沟通",
        "capabilities": [
          "智能质检：全量录音转译+情绪识别+合规预审",
          "智能客服：7×24AI坐席，自助解决80%常见问题",
          "智能外呼：精准营销触达+AI语音交互",
          "虚拟坐席：实时话术推荐，缩短平均处理时长"
        ]
      },
      {
        "name": "企业直播",
        "description": "自研RTC技术，全流程管家式直播服务",
        "capabilities": [
          "自研RTC毫秒级超低延迟音视频互动",
          "3D虚拟直播/数字人直播",
          "全流程管家式服务：策划/会务/互动/数据分析",
          "年稳定支持约6000场高级别活动",
          "覆盖营销/培训/3D虚拟/私域直播场景"
        ]
      },
      {
        "name": "企业邮箱",
        "description": "自研架构，二十余年稳定服务15万+企业",
        "capabilities": [
          "263云邮（标准SaaS产品）",
          "信创SaaS：业内首款信创公有云邮箱",
          "私有云邮箱：适配国产化生态，支持定制部署",
          "AI赋能：智能过滤/分类/摘要"
        ]
      },
      {
        "name": "智能终端",
        "description": "软硬结合的智能通信终端",
        "capabilities": [
          "企业会议终端：VCX-6/6M（小型）/ VCX-9Z（大型）/ VCX-3（桌面智能）",
          "家庭终端：家庭电话（中美同号）/ 安防监控 / 数字电视盒子"
        ]
      }
    ]
  },
  {
    "id": "digital-content",
    "name": "数字内容",
    "positioning": "数据驱动+智能体技术，探索数智前沿，激活组织效能",
    "businessLines": [
      {
        "name": "数字员工",
        "description": "AI办公新范式，覆盖对内提效+对外增值",
        "capabilities": [
          "智能问答与办公助理：结合企业知识库解决问答幻觉",
          "会议与文档智能化：自动转写音视频为文字纪要",
          "企业知识沉淀：文档/图片/表格智能拆分为结构化知识",
          "数字分身：一张照片+录音生成，动作自然高度还原人声",
          "数字IP：品牌代言/直播带货/客服接待/培训讲解"
        ]
      },
      {
        "name": "智能体平台",
        "description": "企业AI能力中台，快速创建和管理Agent",
        "capabilities": [
          "低代码创建与部署：自然语言流程编排，周期从数周缩至分钟级",
          "垂直场景适配：金融/电商/制造/政务等行业定制",
          "多模型接入与管理：灵活选择最优模型，避免绑定",
          "TokenHub算力调度平台：统一API管理+精细化成本管控"
        ]
      },
      {
        "name": "知识管理",
        "description": "集成私有知识数据，提升AI回复准确性和安全性",
        "capabilities": [
          "支持结构化/半结构化/非结构化知识形态",
          "知识库直接与智能体关联，实时生效",
          "智能创建知识框架，迭代学习知识内容"
        ]
      },
      {
        "name": "内容质检",
        "description": "AI+人工双重风控，全量场景实时监测",
        "capabilities": [
          "全量实时监测：AI实时质检，高危敏感词自动挂断",
          "AI+人工双重保障：防误检和漏检",
          "灵活规则配置：关键词/情绪/意图/语气四维自定义",
          "全链路内容风控：文字/图像/音视频全覆盖"
        ]
      }
    ]
  }
]
```

- [ ] **Step 2: 新增 `qualifications` 和 `stats` 字段**

在 JSON 顶层（`milestones` 之前）插入：

```json
"qualifications": {
  "certifications": [
    "公安部等保2.0三级备案",
    "ISO20000国际认证",
    "ISO27001国际认证"
  ],
  "titles": [
    "京沪两市专精特新小巨人企业",
    "连续6年北京市企业技术中心",
    "中国互联网综合实力前百家企业",
    "北京数字经济企业百强",
    "北京高精尖企业百强",
    "社会责任治理水平AA级评价"
  ]
},
"stats": {
  "softwareCopyrights": 594,
  "patents": 23,
  "offices": 12,
  "rdCenters": ["北京昌平", "上海", "杭州"],
  "enterpriseCustomers": "15万+",
  "global500Customers": "三分之一的世界500强",
  "individualUsers": "千万级"
},
```

- [ ] **Step 3: 验证 JSON 合法 + 结构完整**

Run:
```bash
node -e "
const d = require('./company-data.json');
console.log('Products:', d.products.length, 'sections');
d.products.forEach(p => console.log('  ' + p.name + ': ' + p.businessLines.length + ' business lines'));
console.log('Qualifications:', d.qualifications.certifications.length + ' certs, ' + d.qualifications.titles.length + ' titles');
console.log('Stats:', Object.keys(d.stats).join(', '));
"
```
Expected: 3 sections × 4 business lines, 6 qualifications, 8 stats keys。

- [ ] **Step 4: Commit**

```bash
git add company-data.json
git commit -m "feat: rewrite product hierarchy to 3-section×4-line structure, add qualifications and stats"
```

---

### Task 4: 重写 skills/263-vi.md — 核心工作流

**Files:**
- Modify: `skills/263-vi.md`

**Interfaces:**
- Consumes: `brand-tokens.json`（Task 1+2 结构）、`company-data.json`（Task 3 结构）
- Produces: Agent 可执行的品牌工作流指令

- [ ] **Step 1: 重写文件头部（YAML frontmatter + 职责 + 数据文件表）**

保持 YAML 不变，更新职责描述和数据文件表：

```markdown
## 你的职责

当用户需要输出涉及 263 品牌的内容时，你负责品牌数据层的全部决策：

1. 判断生成模式（Template 还是 Themed）— 从用户自然语言推断
2. 确定品牌上下文（配色方案 + Logo 归属）
3. 从 `brand-tokens.json` 和 `company-data.json` 读取品牌数据
4. 在输出开头透明声明当前模式

## 品牌数据文件

| 文件 | 内容 | 何时读取 |
|------|------|----------|
| `brand-tokens.json` | 色板、字体层级、Logo、硬规则 | 任何视觉输出 |
| `company-data.json` | 公司信息、产品、里程碑、资质 | 需要公司/产品信息时 |
| `design-skill-recommendations.json` | 平台设计 skill 推荐 | 无设计 skill 时 |
| `CONTEXT.md` | 领域模型（术语定义、产品详情） | 不确定术语含义时 |
```

- [ ] **Step 2: 写入生成模式判断逻辑**

```markdown
## 生成模式判断

从用户自然语言推断 Template 还是 Themed，**不穷举关键词，按特征推理**：

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
```

- [ ] **Step 3: 写入输出透明声明逻辑**

```markdown
## 输出透明声明

每次生成视觉内容时，**开头第一句**必须声明模式：

- Template 判断时：`"我将按**内部汇报**的设计方式制作（统一母版）。如果你是用于对外展示，请告诉我，我会切换设计风格。"`
- Themed 判断时：`"我将按**对外展示**的设计方式制作（品牌主题 + 个性化设计）。如果你是用于内部工作汇报，请告诉我具体场景，我会切换为统一母版。"`

目的：用户不需要预先知道有两个模式。看到声明即可纠正。
```

- [ ] **Step 4: 重写工作流 — 四条路径**

删除旧的"流程 A/B/C"，替换为基于 2×2 矩阵的四路径：

```markdown
## 工作流

### 前置步骤（四条路径共用）

1. **判断模式** → Template 还是 Themed（见上方判断逻辑）
2. **确定品牌上下文** → 配色方案（默认集团红）+ Logo 归属（默认集团 Logo，按业务线切换）
3. **输出透明声明** → 告知用户当前模式和切换方式
4. **读取品牌数据** → `brand-tokens.json`（必须）+ `company-data.json`（按需）

### 路径选择

| | 路径 A（从零生成） | 路径 B（改写已有） |
|---|---|---|
| **Template** | 按母版填空 | 对齐母版规范 |
| **Themed** | 品牌数据 + 设计 skill 创作 | 品牌约束内重新设计 |

### 路径 A × Template：从零按母版生成

用户描述需求，没有现成文件 → 你按固定母版从零生成

1. 根据用户需求策划大纲和页面结构
2. 每页按母版填空（封面页固定布局、内容页标准版式）
3. **全部硬规则锁死**：字号、颜色、Logo 位置均不可变
4. 设计 skill **不介入**
5. 无设计 skill 时：用 `node generate.js <pages.json>` 兜底渲染

### 路径 A × Themed：从零创作型生成

用户描述需求，没有现成文件，需要对外展示效果 → 你策划内容 + 设计 skill 排版

1. 根据用户需求策划大纲、页面结构、配图/图表方案
2. 将品牌数据（色板、字体层级、Logo 规则）交给设计 skill
3. **硬规则锁死，软规则由设计 skill 自由发挥**
4. 品牌数据层（你管）：色彩不准偏、字体不准换、Logo 不准动、结尾页格式固定
5. 表现层（设计 skill 管）：排版布局、装饰元素、图表风格、动画效果、阴影层次

### 路径 B × Template：已有文件对齐母版

用户提供已有 HTML/JSON 文件，需要对齐内部汇报母版

1. 读取已有文件，提取页面结构和内容
2. 替换所有颜色为品牌色板色值
3. 替换字体为微软雅黑，修正字号到 Template 标准
4. 嵌入 Logo（内页右上角 113×113px，符合深浅底规则）
5. 对齐母版布局（封面、目录、内容、结尾页统一版式）
6. VI skill 全控，设计 skill 不介入

### 路径 B × Themed：已有文件品牌重设计

用户提供已有文件，需要对外展示级别重新设计

1. 读取已有文件，提取内容信息
2. 将内容和品牌数据（色板、字体层级、Logo 规则）交给设计 skill
3. 设计 skill 在硬规则约束内重新设计排版和视觉
4. 品牌数据层锁死，表现层自由发挥（同路径 A × Themed 的边界）
```

- [ ] **Step 5: 重写品牌规则章节**

```markdown
## 品牌规则

### 色彩

两套配色方案，通过 `brand-tokens.json` → `colorSchemes` 选择：

- **集团红（group-red）**：主色 `#D0121B`，集团层面默认
- **商务蓝（business-blue）**：主色 `#1677FF`，待官方确认后启用

每个方案 9 个色值。所有颜色从 JSON 读取，不硬编码。

### 字体

**正文字体：微软雅黑。** 字体层级从 `brand-tokens.json` → `typography.scale` 读取：

| 层级 | Template（固定） | Themed（区间） | 刚性 |
|------|-----------------|---------------|------|
| 封面标题 | 64pt | 56–72pt | Template MUST / Themed 区间 |
| 内容页标题 | 40pt | 36–44pt | 同上 |
| 副标题 | 30pt | 28–32pt | 同上 |
| 正文 | 26pt | 24–28pt 底线 | MUST |
| 图表标签/注脚 | 22pt | ≥20pt 极限 | MUST |

**Template：全部使用固定值。Themed：设计 skill 在区间内自由决定。**

### Logo

| 规则 | 刚性 |
|------|:--:|
| 内页 Logo 尺寸：113×113px | MUST |
| Logo 安全区内禁止任何装饰元素 | MUST |
| 浅色底 → 彩稿 Logo / 深色底 → 反白 Logo | MUST |
| 结尾页：居中 Logo + slogan PNG | MUST |
| 封面 Logo 位置不做限制 | — |

### 品牌上下文（Logo 按业务线切换）

默认使用集团 Logo。当用户指定业务线（如云通信）时，切换到该业务线的 Logo，其他品牌规则不变。

从 `brand-tokens.json` → `logos.businessLines` 查 Logo 路径。

### 硬规则

Template：全部锁死。Themed：以下 MUST 规则不可违反，其余交设计 skill。

从 `brand-tokens.json` → `hardRules` 读取完整清单。
```

- [ ] **Step 6: 更新 skill 协作章节**

```markdown
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
  "colors": { "primary": "#D0121B", ... },
  "typography": { "fontFamily": "微软雅黑", "scale": { ... } },
  "logo": { "colorB64": "...", "whiteB64": "...", "innerPage": { "size": "113x113px" } },
  "hardRules": ["Logo安全区", "结尾页格式", "主色不可偏色"],
  "mode": "themed"
}
```

设计 skill 消费这个结构，在硬规则约束内自由创作。不会因为数据格式而绑定特定设计 skill。
```

- [ ] **Step 7: 添加输入格式分级**

在禁止事项之前插入：

```markdown
## 输入格式

VI skill 不负责解析文件。外部 Agent 自行调用 MCP 或其他工具摘取内容后送入管线。

| 分级 | 格式 | 可靠性 |
|------|------|--------|
| 原生支持 | HTML、JSON | 路径 B 完整能力 |
| 尽力而为 | .pptx、.docx、.pdf、图片 | Agent 尽力提取 + VI 化，不保证完美 |

如果用户提供的文件格式不在原生支持列表中，告知用户："这个文件格式需要先提取内容。我会尽力处理，但可能需要你确认提取结果是否准确。"
```

- [ ] **Step 8: 更新禁止事项**

```markdown
## 禁止事项

- 禁止使用非色板颜色（不自己发明颜色）
- 禁止编造公司信息（名称、股票代码、产品、数据等）
- 禁止 font-size < 20pt（极限底线，正文 < 24pt 也不建议）
- 禁止在内页自定义 Logo 位置（右上角 113×113px 固定）
- 禁止在 Logo 安全区放置任何装饰元素
- 禁止在 Template 路径下自行调整字号、布局、配色
- 禁止跳过透明声明（每次生成必须告知用户当前模式）
```

- [ ] **Step 9: 保持 HTML 输出规范章节不变**

保留现有的"HTML 输出规范（无设计 skill 时）"章节，但把 `16px` 改为 `20pt`。

- [ ] **Step 10: 验证**

阅读完整文件，确认：四条路径描述完整、字体值正确、模式判断逻辑不引用关键词表、引用路径正确（`brand-tokens.json` 字段名匹配 Task 1+2）。

- [ ] **Step 11: Commit**

```bash
git add skills/263-vi.md
git commit -m "feat: rewrite VI skill — Template/Themed modes, 2×2 path matrix, typography scale, input tiers"
```

---

### Task 5: 同步 CONTEXT.md 产品详情链接

**Files:**
- Modify: `CONTEXT.md`

**Interfaces:**
- Consumes: 无
- Produces: CONTEXT.md 产品组合表精简为摘要，指向 `company-data.json` 作为权威源

- [ ] **Step 1: 在 CONTEXT.md 产品组合章节加注**

在"产品组合"标题下添加一行：

```markdown
> **权威数据源：** `company-data.json`。以下为摘要，完整产品能力列表以 JSON 为准。
```

- [ ] **Step 2: Commit**

```bash
git add CONTEXT.md
git commit -m "docs: add authority reference from CONTEXT.md to company-data.json"
```

---

### Task 6: 全量一致性验证

**Files:**
- Read: `CONTEXT.md`, `brand-tokens.json`, `company-data.json`, `skills/263-vi.md`

- [ ] **Step 1: 交叉验证字号值**

对照 CONTEXT.md → brand-tokens.json → 263-vi.md 的字号值是否一致：

| 检查点 | CONTEXT.md | brand-tokens.json | 263-vi.md |
|--------|-----------|-------------------|-----------|
| 最小字号 | 20pt | `minSize: 20` | 禁止 < 20pt |
| 封面标题 | 56-72pt | 64pt / 56-72pt | 64pt / 56-72pt |
| 正文底线 | 24pt | 26pt / 24-28pt | 26pt / 24-28pt |

- [ ] **Step 2: 交叉验证产品结构**

对照 CONTEXT.md 产品组合表 → company-data.json → 263-vi.md 引用路径：

- CONTEXT.md 三板四线名称与 company-data.json 一致
- 263-vi.md 引用的 JSON 路径（`logos.businessLines`、`hardRules`、`typography.scale`）在 brand-tokens.json 中真实存在

- [ ] **Step 3: 验证 generate.js 兼容性**

Run: `node generate.js examples/pages.json`
Expected: 不因 brand-tokens.json 结构变更而报错。

- [ ] **Step 4: Commit（如有修正）**

```bash
git add -A
git commit -m "chore: cross-file consistency fixes"
```
