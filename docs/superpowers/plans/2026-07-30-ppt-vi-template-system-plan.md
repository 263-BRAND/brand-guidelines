# PPT VI 模板系统 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建 Phase 1 PPT 模板系统：渲染器支持 6 种页面类型，双色板，零外部依赖，Agent 产出 pages.json 即可生成合规 slides.html。

**Architecture:** Node.js 脚本 `generate.js` 读取 `pages.json` + `vi-tokens.json`，输出自包含的 `slides.html`。每个 slide 类型一个渲染函数，注入 VI tokens 和播放壳。公司数据和 Logo 嵌入输出文件中。

**Tech Stack:** Node.js (built-in modules only: fs, path), 纯 HTML/CSS/JS 输出，零 npm 依赖

## Global Constraints

- 字体：微软雅黑，min-size: 16px，max-size: 48px（渲染器校验，违规拒绝）
- 色板：group-red (`#D0121B`) / business-blue (`#1677FF`)，中性色共享
- 内页 Logo：右上角固定，距右 ~80px，距顶 ~46px，~113×113px（1920×1080 基准等比缩放）
- 封面 Logo：不做位置和大小限制
- 翻页：PageUp/PageDown/方向键/空格/点击，翻页笔兼容
- 零外部依赖，输出为单一自包含 HTML 文件，浏览器直接打开

---

### Task 1: VI tokens 配置

**Files:**
- Create: `vi-tokens.json`

**Produces:**
- `vi-tokens.json` — 色板、字体、布局、Logo 路径的完整定义

- [ ] **Step 1: 创建 vi-tokens.json**

创建文件 `vi-tokens.json`，内容如下：

```json
{
  "slide": {
    "width": 1920,
    "height": 1080
  },
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
    "sizes": {
      "coverTitle": "48px",
      "sectionTitle": "36px",
      "pageTitle": "32px",
      "subtitle": "24px",
      "body": "20px",
      "caption": "16px"
    },
    "minSize": 16
  },
  "logos": {
    "group": {
      "color": "assets/logos/logo-group-color.png",
      "white": "assets/logos/logo-group-white.png"
    },
    "cloud": {
      "color": "assets/logos/logo-cloud-color.png",
      "white": "assets/logos/logo-cloud-white.svg"
    }
  },
  "layout": {
    "contentLogo": {
      "right": "80px",
      "top": "46px",
      "width": "113px",
      "height": "113px"
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add vi-tokens.json
git commit -m "feat: add vi-tokens.json with dual color schemes and typography"
```

---

### Task 2: Schema 定义

**Files:**
- Create: `schema.json`

**Produces:**
- `schema.json` — 6 种页面类型的字段定义，agent 用此文件了解可用的页面结构

- [ ] **Step 1: 创建 schema.json**

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "263 PPT Pages Schema",
  "type": "object",
  "required": ["colorScheme", "slides"],
  "properties": {
    "colorScheme": {
      "type": "string",
      "enum": ["group-red", "business-blue"],
      "description": "色系选择"
    },
    "logoSet": {
      "type": "string",
      "enum": ["group", "cloud"],
      "default": "group",
      "description": "Logo 集合"
    },
    "slides": {
      "type": "array",
      "items": { "$ref": "#/$defs/slide" }
    }
  },
  "$defs": {
    "slide": {
      "oneOf": [
        { "$ref": "#/$defs/cover" },
        { "$ref": "#/$defs/section" },
        { "$ref": "#/$defs/content" },
        { "$ref": "#/$defs/cards" },
        { "$ref": "#/$defs/timeline" },
        { "$ref": "#/$defs/end" }
      ]
    },
    "cover": {
      "type": "object",
      "required": ["type", "title"],
      "properties": {
        "type": { "const": "cover" },
        "title": { "type": "string", "description": "封面主标题" },
        "subtitle": { "type": "string", "description": "副标题" },
        "date": { "type": "string" },
        "presenter": { "type": "string" },
        "department": { "type": "string" },
        "backgroundStyle": {
          "type": "string",
          "enum": ["solid", "gradient"],
          "default": "gradient"
        }
      }
    },
    "section": {
      "type": "object",
      "required": ["type", "sectionNumber", "title"],
      "properties": {
        "type": { "const": "section" },
        "sectionNumber": { "type": "string", "description": "如 01, 02" },
        "title": { "type": "string", "description": "章节标题" },
        "subtitle": { "type": "string" }
      }
    },
    "content": {
      "type": "object",
      "required": ["type", "title", "blocks"],
      "properties": {
        "type": { "const": "content" },
        "title": { "type": "string" },
        "sectionLabel": { "type": "string", "description": "如 01 / 公司概况" },
        "blocks": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["heading", "body"],
            "properties": {
              "heading": { "type": "string" },
              "body": { "type": "string" }
            }
          }
        }
      }
    },
    "cards": {
      "type": "object",
      "required": ["type", "title", "columns", "items"],
      "properties": {
        "type": { "const": "cards" },
        "title": { "type": "string" },
        "sectionLabel": { "type": "string" },
        "columns": { "type": "integer", "minimum": 2, "maximum": 4, "default": 3 },
        "items": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["title", "description"],
            "properties": {
              "icon": { "type": "string" },
              "title": { "type": "string" },
              "description": { "type": "string" }
            }
          }
        }
      }
    },
    "timeline": {
      "type": "object",
      "required": ["type", "title", "events"],
      "properties": {
        "type": { "const": "timeline" },
        "title": { "type": "string" },
        "sectionLabel": { "type": "string" },
        "source": { "type": "string", "description": "引用 company-data 中的数据路径" },
        "events": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["year", "title"],
            "properties": {
              "year": { "type": "string" },
              "title": { "type": "string" },
              "description": { "type": "string" }
            }
          }
        }
      }
    },
    "end": {
      "type": "object",
      "required": ["type"],
      "properties": {
        "type": { "const": "end" },
        "text": { "type": "string", "default": "感谢聆听" },
        "showContact": { "type": "boolean", "default": false },
        "contactInfo": { "type": "string" }
      }
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add schema.json
git commit -m "feat: add schema.json with 6 slide type definitions"
```

---

### Task 3: 公司数据层

**Files:**
- Create: `company-data/facts.json`
- Create: `company-data/products.json`
- Create: `company-data/profile-zh.md`
- Create: `company-data/profile-en.md`

**Produces:**
- Agent 可引用的公司信息数据源

- [ ] **Step 1: 创建 facts.json**

```json
{
  "company": {
    "fullNameZh": "二六三网络通信股份有限公司",
    "fullNameEn": "263 Network Communication, Inc.",
    "shortNames": ["263集团", "二六三集团", "263公司", "二六三公司"],
    "stockCode": "002467",
    "founded": "1997",
    "headquarters": "北京",
    "offices": ["上海", "广州", "深圳", "杭州", "香港"]
  },
  "brand": {
    "vision": "全球互联网通信云服务领导者",
    "mission": "提升沟通体验和组织效率",
    "purpose": "连接世界 沟通你我",
    "strategy": "打造智能云连接 赋能数字化转型",
    "values": ["正直", "务实", "包容", "担当", "团队合作", "主动作为"]
  },
  "milestones": [
    { "year": "1997", "title": "公司成立", "description": "创立于北京，提供互联网接入服务，接入号码 263" },
    { "year": "2010", "title": "深交所上市", "description": "在深圳证券交易所上市，股票代码 002467" },
    { "year": "2015", "title": "云通信战略", "description": "全面转型云通信服务，推出企业邮箱、云会议等产品" },
    { "year": "2020", "title": "国际化布局", "description": "成立海外分支机构，服务覆盖全球" },
    { "year": "2023", "title": "AI 赋能", "description": "推出 AI 数字员工云小朵，RAG 智能客服接入集团官网" }
  ]
}
```

- [ ] **Step 2: 创建 products.json**

```json
{
  "products": [
    {
      "id": "mail",
      "name": "企业邮箱",
      "tagline": "安全稳定的企业级邮件系统",
      "description": "支持自定义域名、反垃圾邮件、无限容量、移动办公，日处理邮件超 15 亿封。"
    },
    {
      "id": "meeting",
      "name": "云会议",
      "tagline": "高清视频会议解决方案",
      "description": "支持千人同时在线，屏幕共享、实时字幕、会议录制，服务可用性 99.99%。"
    },
    {
      "id": "live",
      "name": "企业直播",
      "tagline": "一站式企业直播营销平台",
      "description": "支持推流、互动、数据分析、回放，助力企业高效获客与品牌传播。"
    },
    {
      "id": "contact-center",
      "name": "云呼叫中心",
      "tagline": "智能全渠道客户联络中心",
      "description": "整合电话、在线客服、智能语音导航，提升客户服务效率。"
    }
  ]
}
```

- [ ] **Step 3: 创建 profile-zh.md**

```markdown
# 二六三网络通信股份有限公司

## 公司简介

263 集团（股票代码：002467）创立于 1997 年，是全球领先的互联网通信云服务商。总部位于北京，并在上海、广州、深圳、杭州、香港和海外设有办事机构。

263 集团深耕行业二十余年，以"提升沟通体验和组织效率"为使命，致力于"打造智能云连接，赋能数字化转型"。公司核心产品包括企业邮箱、云会议、企业直播、云呼叫中心等，服务超过 700 万企业客户，日处理消息量超过 15 亿条。

## 愿景

全球互联网通信云服务领导者

## 使命

提升沟通体验和组织效率

## 价值观

正直、务实、包容、担当、团队合作、主动作为
```

- [ ] **Step 4: 创建 profile-en.md**

```markdown
# 263 Network Communication, Inc.

## Company Profile

263 Group (Stock Code: 002467), founded in 1997, is a global leader in internet communication cloud services. Headquartered in Beijing, with offices in Shanghai, Guangzhou, Shenzhen, Hangzhou, Hong Kong, and overseas.

## Vision

Global Leader in Internet Communication Cloud Services

## Mission

Enhancing Communication Experience and Organizational Efficiency
```

- [ ] **Step 5: Commit**

```bash
git add company-data/
git commit -m "feat: add company data layer with facts, products, and profiles"
```

---

### Task 4: Logo 资产

**Files:**
- Copy: `assets/logos/logo-group-color.png` ← `视觉参考/LOGO-Color-集团-红心.png`
- Copy: `assets/logos/logo-group-white.png` ← `视觉参考/logo-集团-白.png`
- Copy: `assets/logos/logo-cloud-color.png` ← `视觉参考/logo-云通信-蓝.png`

**Produces:**
- Logo 文件供渲染器内嵌使用

- [ ] **Step 1: 复制 Logo 文件到 assets/logos/**

```bash
mkdir -p assets/logos
cp "视觉参考/LOGO-Color-集团-红心.png" "assets/logos/logo-group-color.png"
cp "视觉参考/logo-集团-白.png" "assets/logos/logo-group-white.png"
cp "视觉参考/logo-云通信-蓝.png" "assets/logos/logo-cloud-color.png"
```

- [ ] **Step 2: Commit**

```bash
git add assets/logos/
git commit -m "feat: add logo assets for group and cloud variants"
```

---

### Task 5: 渲染器核心 + 播放壳

**Files:**
- Create: `generate.js`

**Produces:**
- `generate.js` — CLI 入口，读取 pages.json + vi-tokens.json，调用各 slide 渲染函数，输出自包含 slides.html
- 播放壳（全屏、键盘/翻页笔导航、点击翻页）内置于输出 HTML 中

**Consumes:** `vi-tokens.json`, `schema.json`（用于校验）, `company-data/`, Logo assets

- [ ] **Step 1: 创建 generate.js 核心框架**

```javascript
const fs = require('fs');
const path = require('path');

// Read input files
const pagesPath = process.argv[2] || 'examples/sample-pages.json';
const tokens = JSON.parse(fs.readFileSync('vi-tokens.json', 'utf-8'));
const pages = JSON.parse(fs.readFileSync(pagesPath, 'utf-8'));

// Validate required fields
if (!pages.colorScheme || !tokens.colorSchemes[pages.colorScheme]) {
  console.error(`Invalid colorScheme: ${pages.colorScheme}. Must be one of: ${Object.keys(tokens.colorSchemes).join(', ')}`);
  process.exit(1);
}
if (!pages.slides || !Array.isArray(pages.slides) || pages.slides.length === 0) {
  console.error('pages.json must contain a non-empty "slides" array.');
  process.exit(1);
}

// Build each slide
const slideTypes = ['cover','section','content','cards','timeline','end'];
const slideHtmlArray = pages.slides.map((slide, i) => {
  if (!slide.type || !slideTypes.includes(slide.type)) {
    console.error(`Slide ${i}: unknown or missing type. Must be one of: ${slideTypes.join(', ')}`);
    process.exit(1);
  }
  const renderFn = require(`./renderer/slides/${slide.type}.js`);
  return renderFn(slide, tokens, pages, i);
});

const fullSlidesHtml = slideHtmlArray.join('\n');

// Embed logos as base64
function logoBase64(logoPath) {
  if (!fs.existsSync(logoPath)) return '';
  const ext = path.extname(logoPath).toLowerCase();
  const mime = ext === '.svg' ? 'image/svg+xml' : 'image/png';
  const data = fs.readFileSync(logoPath).toString('base64');
  return `data:${mime};base64,${data}`;
}

const logos = tokens.logos[pages.logoSet || 'group'];
const logoColorB64 = logoBase64(logos.color);
const logoWhiteB64 = logoBase64(logos.white);

// Build output HTML
const html = buildHtml({
  slides: fullSlidesHtml,
  tokens,
  colorScheme: pages.colorScheme,
  logoColorB64,
  logoWhiteB64,
  totalSlides: pages.slides.length
});

const outPath = pagesPath.replace('.json', '.html');
fs.writeFileSync(outPath, html, 'utf-8');
console.log(`Generated: ${outPath} (${pages.slides.length} slides)`);

function buildHtml({ slides, tokens, colorScheme, logoColorB64, logoWhiteB64, totalSlides }) {
  /* see Step 2 */
}
```

- [ ] **Step 2: 创建 buildHtml 函数（HTML 外壳 + 播放壳）**

在 `generate.js` 中实现 `buildHtml` 函数：

```javascript
function buildHtml({ slides, tokens, colorScheme, logoColorB64, logoWhiteB64, totalSlides }) {
  const c = tokens.colorSchemes[colorScheme];
  const t = tokens.typography;
  const l = tokens.layout;
  const W = tokens.slide.width;
  const H = tokens.slide.height;

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>263 PPT - ${colorScheme}</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { background:#000; display:flex; justify-content:center; align-items:center; height:100vh; overflow:hidden; font-family:${t.fontFamily}; }
#player { width:${W}px; height:${H}px; position:relative; overflow:hidden; transform-origin:center center; }
.slide-page { position:absolute; top:0; left:0; width:100%; height:100%; display:none; }
.slide-page.active { display:block; }
/* Inline assets */
.logo-color { content: url(${logoColorB64}); }
.logo-white { content: url(${logoWhiteB64}); }
/* VI tokens as CSS variables */
:root {
  --primary: ${c.primary};
  --primary-light: ${c.primaryLight};
  --primary-dark: ${c.primaryDark};
  --accent: ${c.accent};
  --dark: ${c.dark};
  --gray: ${c.gray};
  --light-gray: ${c.lightGray};
  --white: ${c.white};
  --black: ${c.black};
  --font-cover-title: ${t.sizes.coverTitle};
  --font-section-title: ${t.sizes.sectionTitle};
  --font-page-title: ${t.sizes.pageTitle};
  --font-subtitle: ${t.sizes.subtitle};
  --font-body: ${t.sizes.body};
  --font-caption: ${t.sizes.caption};
  --content-logo-right: ${l.contentLogo.right};
  --content-logo-top: ${l.contentLogo.top};
  --content-logo-width: ${l.contentLogo.width};
  --content-logo-height: ${l.contentLogo.height};
}
.min-font-check { font-size:${t.sizes.caption}; }
</style>
</head>
<body>
<div id="player">
${slides}
</div>
<script>
(function() {
  const slides = document.querySelectorAll('.slide-page');
  let current = 0;
  const total = ${totalSlides};

  function show(idx) {
    slides[current].classList.remove('active');
    current = ((idx % total) + total) % total;
    slides[current].classList.add('active');
  }

  // Click navigation: left half = prev, right half = next
  document.getElementById('player').addEventListener('click', (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (e.clientX < rect.left + rect.width / 2) {
      show(current - 1);
    } else {
      show(current + 1);
    }
  });

  // Keyboard + clicker compatibility
  document.addEventListener('keydown', (e) => {
    const key = e.key || e.code;
    if (key === 'ArrowRight' || key === 'ArrowDown' || key === 'PageDown' || key === ' ' || key === 'Space') {
      e.preventDefault();
      show(current + 1);
    } else if (key === 'ArrowLeft' || key === 'ArrowUp' || key === 'PageUp') {
      e.preventDefault();
      show(current - 1);
    } else if (key === 'Home') {
      e.preventDefault();
      show(0);
    } else if (key === 'End') {
      e.preventDefault();
      show(total - 1);
    } else if (key === 'f' || key === 'F') {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        document.documentElement.requestFullscreen();
      }
    }
  });

  // Show first slide
  show(0);

  // Auto-resize to fit viewport
  function resize() {
    const pw = ${W}, ph = ${H};
    const scaleX = window.innerWidth / pw;
    const scaleY = window.innerHeight / ph;
    const scale = Math.min(scaleX, scaleY);
    document.getElementById('player').style.transform = 'scale(' + scale + ')';
  }
  window.addEventListener('resize', resize);
  resize();

  // Font size validation
  const allElements = document.querySelectorAll('.slide-page *');
  allElements.forEach(el => {
    const style = window.getComputedStyle(el);
    const fontSize = parseFloat(style.fontSize);
    if (fontSize > 0 && fontSize < ${t.minSize}) {
      console.warn('VI violation: font-size ' + fontSize + 'px < ${t.minSize}px minimum on element', el);
    }
  });
})();
</script>
</body>
</html>`;
}
```

- [ ] **Step 3: Create renderer/slides/ directory**

```bash
mkdir -p renderer/slides
```

- [ ] **Step 4: Commit**

```bash
git add generate.js renderer/
git commit -m "feat: add renderer core with player shell and navigation"
```

---

### Task 6: 渲染器 — cover 封面

**Files:**
- Create: `renderer/slides/cover.js`

**Consumes:** `vi-tokens.json` (via tokens param)

**Produces:** `renderSlide(slide, tokens, pages, index) => HTML string`

- [ ] **Step 1: 创建 cover.js 渲染函数**

```javascript
// renderer/slides/cover.js
// Cover slide: free-form logo, gradient background, centered title block

function renderSlide(slide, tokens, pages, index) {
  const c = tokens.colorSchemes[pages.colorScheme];
  const W = tokens.slide.width;
  const H = tokens.slide.height;
  const bgStyle = slide.backgroundStyle === 'solid' ? c.primary : `linear-gradient(135deg, ${c.primary} 0%, ${c.primaryDark} 100%)`;

  return `
<div class="slide-page" id="s${index}" style="background:${bgStyle}; position:relative;">
  <div style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;padding-left:6%;">
    <div style="position:absolute;top:8%;left:6%;">
      <img class="logo-white" style="width:${W * 0.28}px;height:auto;" alt="Logo">
    </div>
    <h1 style="font-size:${tokens.typography.sizes.coverTitle};font-weight:bold;color:${c.white};margin-bottom:16px;max-width:80%;">${escapeHtml(slide.title)}</h1>
    ${slide.subtitle ? `<p style="font-size:${tokens.typography.sizes.subtitle};color:rgba(255,255,255,0.85);margin-bottom:32px;">${escapeHtml(slide.subtitle)}</p>` : ''}
    <div style="width:60px;height:4px;background:${c.white};margin-bottom:32px;"></div>
    <div style="font-size:${tokens.typography.sizes.body};color:rgba(255,255,255,0.7);line-height:1.8;">
      ${slide.presenter ? `<span>${escapeHtml(slide.presenter)}</span>` : ''}
      ${slide.department ? `<span style="margin-left:16px;">${escapeHtml(slide.department)}</span>` : ''}
      ${slide.date ? `<span style="margin-left:16px;">${escapeHtml(slide.date)}</span>` : ''}
    </div>
    <div style="position:absolute;bottom:6%;left:6%;font-size:${tokens.typography.sizes.caption};color:rgba(255,255,255,0.5);">
      ${escapeHtml(pages.companyName || '二六三网络通信股份有限公司')}
    </div>
  </div>
</div>`;
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

module.exports = renderSlide;
```

- [ ] **Step 2: Commit**

```bash
git add renderer/slides/cover.js
git commit -m "feat: add cover slide renderer"
```

---

### Task 7: 渲染器 — content 通用内容页

**Files:**
- Create: `renderer/slides/content.js`

**Produces:** 标题 + 文本段落块的通用内容页渲染

- [ ] **Step 1: 创建 content.js**

```javascript
// renderer/slides/content.js
function renderSlide(slide, tokens, pages, index) {
  const c = tokens.colorSchemes[pages.colorScheme];
  const l = tokens.layout.contentLogo;
  const lightBg = slide.background === 'dark' ? false : true;
  const bgColor = lightBg ? c.white : c.dark;
  const textColor = lightBg ? c.dark : c.white;
  const logoB64 = lightBg ? 'logo-color' : 'logo-white';

  // Validate font sizes
  const bodySize = parseInt(tokens.typography.sizes.body);
  if (bodySize < tokens.typography.minSize) {
    console.error(`Slide ${index}: body font-size ${bodySize}px < minimum ${tokens.typography.minSize}px`);
    process.exit(1);
  }

  const blocksHtml = (slide.blocks || []).map(b => `
    <div style="margin-bottom:24px;">
      <h3 style="font-size:${tokens.typography.sizes.subtitle};color:${c.primaryLight};margin-bottom:8px;font-weight:bold;">${escapeHtml(b.heading)}</h3>
      <p style="font-size:${tokens.typography.sizes.body};color:${textColor};line-height:1.8;">${escapeHtml(b.body)}</p>
    </div>`).join('\n');

  return `
<div class="slide-page" id="s${index}" style="background:${bgColor}; position:relative;">
  <!-- Fixed logo top-right -->
  <div style="position:absolute;top:${l.top};right:${l.right};width:${l.width};height:${l.height};">
    <img class="${logoB64}" style="width:100%;height:100%;object-fit:contain;" alt="Logo">
  </div>
  <!-- Header -->
  <div style="position:absolute;top:18%;left:6%;right:6%;">
    ${slide.sectionLabel ? `<div style="font-size:${tokens.typography.sizes.caption};color:${c.primary};letter-spacing:2px;margin-bottom:4px;">${escapeHtml(slide.sectionLabel)}</div>` : ''}
    <h2 style="font-size:${tokens.typography.sizes.pageTitle};font-weight:bold;color:${textColor};">${escapeHtml(slide.title)}</h2>
  </div>
  <!-- Body -->
  <div style="position:absolute;top:32%;left:6%;right:6%;bottom:15%;overflow-y:auto;">
    ${blocksHtml}
  </div>
  <!-- Footer line + info -->
  <div style="position:absolute;bottom:9%;left:6%;right:6%;height:1px;background:${c.primary};opacity:0.4;"></div>
  <div style="position:absolute;bottom:3%;left:6%;right:6%;display:flex;justify-content:space-between;font-size:${tokens.typography.sizes.caption};color:${c.gray};">
    <span>${escapeHtml(pages.companyName || '二六三网络通信股份有限公司')}</span>
    <span>${index + 1} / ${pages.slides.length}</span>
  </div>
</div>`;
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

module.exports = renderSlide;
```

- [ ] **Step 2: Commit**

```bash
git add renderer/slides/content.js
git commit -m "feat: add content slide renderer with fixed logo position"
```

---

### Task 8: 渲染器 — section 章节过渡页

**Files:**
- Create: `renderer/slides/section.js`

- [ ] **Step 1: 创建 section.js**

```javascript
// renderer/slides/section.js
function renderSlide(slide, tokens, pages, index) {
  const c = tokens.colorSchemes[pages.colorScheme];
  const l = tokens.layout.contentLogo;
  const bgColor = slide.background === 'light' ? c.white : c.primary;

  return `
<div class="slide-page" id="s${index}" style="background:${bgColor}; position:relative;">
  <div style="position:absolute;top:${l.top};right:${l.right};width:${l.width};height:${l.height};">
    <img class="${bgColor === c.white ? 'logo-color' : 'logo-white'}" style="width:100%;height:100%;object-fit:contain;" alt="Logo">
  </div>
  <div style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;">
    <div style="font-size:${tokens.typography.sizes.coverTitle};font-weight:bold;color:${c.primaryLight};opacity:0.15;letter-spacing:8px;">${escapeHtml(slide.sectionNumber)}</div>
    <h2 style="font-size:${tokens.typography.sizes.sectionTitle};font-weight:bold;color:${bgColor === c.white ? c.dark : c.white};margin-top:-24px;">${escapeHtml(slide.title)}</h2>
    ${slide.subtitle ? `<p style="font-size:${tokens.typography.sizes.subtitle};color:${bgColor === c.white ? c.gray : 'rgba(255,255,255,0.7)'};margin-top:12px;">${escapeHtml(slide.subtitle)}</p>` : ''}
    <div style="width:60px;height:3px;background:${bgColor === c.white ? c.primary : c.white};margin-top:24px;"></div>
  </div>
</div>`;
}

function escapeHtml(str) { return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
module.exports = renderSlide;
```

- [ ] **Step 2: Commit**

```bash
git add renderer/slides/section.js
git commit -m "feat: add section divider slide renderer"
```

---

### Task 9: 渲染器 — cards 卡片网格页

**Files:**
- Create: `renderer/slides/cards.js`

- [ ] **Step 1: 创建 cards.js**

```javascript
// renderer/slides/cards.js
function renderSlide(slide, tokens, pages, index) {
  const c = tokens.colorSchemes[pages.colorScheme];
  const l = tokens.layout.contentLogo;
  const cols = slide.columns || 3;
  const gap = '20px';
  const cardWidth = `calc((100% - ${(cols - 1) * 20}px) / ${cols})`;

  const cardsHtml = (slide.items || []).map(item => `
    <div style="flex:0 0 ${cardWidth};background:${c.white};border-radius:8px;padding:28px 24px;box-shadow:0 2px 12px rgba(0,0,0,0.06);border-top:3px solid ${c.primary};">
      ${item.icon ? `<div style="font-size:32px;margin-bottom:12px;">${escapeHtml(item.icon)}</div>` : ''}
      <h3 style="font-size:${tokens.typography.sizes.subtitle};color:${c.dark};font-weight:bold;margin-bottom:8px;">${escapeHtml(item.title)}</h3>
      <p style="font-size:${tokens.typography.sizes.body};color:${c.gray};line-height:1.7;">${escapeHtml(item.description)}</p>
    </div>`).join('\n');

  return `
<div class="slide-page" id="s${index}" style="background:${c.lightGray}; position:relative;">
  <div style="position:absolute;top:${l.top};right:${l.right};width:${l.width};height:${l.height};">
    <img class="logo-color" style="width:100%;height:100%;object-fit:contain;" alt="Logo">
  </div>
  <div style="position:absolute;top:12%;left:6%;right:6%;">
    ${slide.sectionLabel ? `<div style="font-size:${tokens.typography.sizes.caption};color:${c.primary};letter-spacing:2px;margin-bottom:4px;">${escapeHtml(slide.sectionLabel)}</div>` : ''}
    <h2 style="font-size:${tokens.typography.sizes.pageTitle};font-weight:bold;color:${c.dark};">${escapeHtml(slide.title)}</h2>
  </div>
  <div style="position:absolute;top:28%;left:6%;right:6%;bottom:6%;display:flex;flex-wrap:wrap;gap:${gap};align-content:flex-start;">
    ${cardsHtml}
  </div>
  <div style="position:absolute;bottom:3%;right:6%;font-size:${tokens.typography.sizes.caption};color:${c.gray};">${index + 1} / ${pages.slides.length}</div>
</div>`;
}

function escapeHtml(str) { return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
module.exports = renderSlide;
```

- [ ] **Step 2: Commit**

```bash
git add renderer/slides/cards.js
git commit -m "feat: add cards grid slide renderer"
```

---

### Task 10: 渲染器 — timeline 时间轴页

**Files:**
- Create: `renderer/slides/timeline.js`

- [ ] **Step 1: 创建 timeline.js**

```javascript
// renderer/slides/timeline.js
function renderSlide(slide, tokens, pages, index) {
  const c = tokens.colorSchemes[pages.colorScheme];
  const l = tokens.layout.contentLogo;
  const events = slide.events || [];

  const eventsHtml = events.map((evt, i) => `
    <div style="display:flex;align-items:flex-start;margin-bottom:28px;position:relative;">
      <div style="flex:0 0 100px;text-align:right;padding-right:20px;">
        <span style="font-size:${tokens.typography.sizes.subtitle};font-weight:bold;color:${c.primary};">${escapeHtml(evt.year)}</span>
      </div>
      <div style="width:12px;height:12px;background:${c.primary};border-radius:50%;flex-shrink:0;margin-top:6px;z-index:1;"></div>
      <div style="flex:1;padding-left:20px;">
        <h3 style="font-size:${tokens.typography.sizes.subtitle};color:${c.dark};font-weight:bold;margin-bottom:4px;">${escapeHtml(evt.title)}</h3>
        ${evt.description ? `<p style="font-size:${tokens.typography.sizes.body};color:${c.gray};line-height:1.6;">${escapeHtml(evt.description)}</p>` : ''}
      </div>
    </div>`).join('\n');

  return `
<div class="slide-page" id="s${index}" style="background:${c.white}; position:relative;">
  <div style="position:absolute;top:${l.top};right:${l.right};width:${l.width};height:${l.height};">
    <img class="logo-color" style="width:100%;height:100%;object-fit:contain;" alt="Logo">
  </div>
  <div style="position:absolute;top:12%;left:6%;right:6%;">
    ${slide.sectionLabel ? `<div style="font-size:${tokens.typography.sizes.caption};color:${c.primary};letter-spacing:2px;margin-bottom:4px;">${escapeHtml(slide.sectionLabel)}</div>` : ''}
    <h2 style="font-size:${tokens.typography.sizes.pageTitle};font-weight:bold;color:${c.dark};">${escapeHtml(slide.title)}</h2>
  </div>
  <div style="position:absolute;top:26%;left:15%;right:10%;bottom:8%;overflow-y:auto;">
    <div style="border-left:2px solid ${c.lightGray};padding-left:0;">
      ${eventsHtml}
    </div>
  </div>
  <div style="position:absolute;bottom:3%;right:6%;font-size:${tokens.typography.sizes.caption};color:${c.gray};">${index + 1} / ${pages.slides.length}</div>
</div>`;
}

function escapeHtml(str) { return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
module.exports = renderSlide;
```

- [ ] **Step 2: Commit**

```bash
git add renderer/slides/timeline.js
git commit -m "feat: add timeline slide renderer"
```

---

### Task 11: 渲染器 — end 结束页

**Files:**
- Create: `renderer/slides/end.js`

- [ ] **Step 1: 创建 end.js**

```javascript
// renderer/slides/end.js
function renderSlide(slide, tokens, pages, index) {
  const c = tokens.colorSchemes[pages.colorScheme];
  const bgStyle = slide.background === 'light' ? c.white : `linear-gradient(135deg, ${c.primary} 0%, ${c.primaryDark} 100%)`;
  const isLight = slide.background === 'light';
  const textColor = isLight ? c.dark : c.white;
  const subColor = isLight ? c.gray : 'rgba(255,255,255,0.7)';

  return `
<div class="slide-page" id="s${index}" style="background:${bgStyle}; position:relative;">
  <div style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;">
    <h1 style="font-size:${tokens.typography.sizes.coverTitle};font-weight:bold;color:${textColor};margin-bottom:16px;">${escapeHtml(slide.text || '感谢聆听')}</h1>
    <div style="width:60px;height:3px;background:${c.primary};margin-bottom:24px;"></div>
    <p style="font-size:${tokens.typography.sizes.body};color:${subColor};margin-bottom:8px;">${escapeHtml(pages.companyName || '二六三网络通信股份有限公司')}</p>
    <p style="font-size:${tokens.typography.sizes.caption};color:${subColor};">股票代码：002467</p>
  </div>
</div>`;
}

function escapeHtml(str) { return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
module.exports = renderSlide;
```

- [ ] **Step 2: Commit**

```bash
git add renderer/slides/end.js
git commit -m "feat: add end slide renderer"
```

---

### Task 12: Agent 指令文档

**Files:**
- Create: `agent-prompt.md`

- [ ] **Step 1: 创建 agent-prompt.md**

````markdown
# 263 PPT Agent 指令

## 你的角色

你是一个专业的 PPT 内容策划 agent。用户给你需求描述（自然语言 + 可选文档），你产出一个 `pages.json` 文件，交给渲染器生成符合 263 VI 规范的幻灯片。

## 你控制的 vs 渲染器控制的

**你负责（内容决策）：**
- 选择页面类型和顺序
- 组织内容结构
- 填写标题、正文、数据
- 从 company-data/ 引用事实信息

**渲染器负责（禁止你写入 pages.json）：**
- CSS、颜色值、字号、字体
- Logo 位置、大小、样式
- 页面边距、间距、对齐方式
- 任何视觉格式属性

## 可用页面类型（Phase 1）

| 类型 | 用途 | 必填字段 |
|------|------|----------|
| `cover` | 封面 | `title` |
| `section` | 章节过渡页 | `sectionNumber`, `title` |
| `content` | 通用内容页 | `title`, `blocks: [{heading, body}]` |
| `cards` | 卡片网格 | `title`, `columns`, `items: [{title, description}]` |
| `timeline` | 时间轴 | `title`, `events: [{year, title, description}]` |
| `end` | 结束页 | 无（可选 `text`） |

## 核心规则

1. **公司信息从 `company-data/` 引用，禁止编造。** 公司名、股票代码、愿景使命、发展历程 — 这些必须从 company-data 文件中提取，不要凭记忆写。
2. **`colorScheme` 默认为 `"group-red"`**，用户指定则用用户指定的。可选值：`"group-red"` 或 `"business-blue"`。
3. **`logoSet` 默认为 `"group"`**，云通信产品线用 `"cloud"`。
4. **禁止在 pages.json 中写入任何 CSS、颜色值、字号、位置信息。**
5. **用 `source` 字段引用数据源**，而非硬编码。例如 `"source": "facts.json#milestones"` 让渲染器自动拉取历程数据。
6. **提供结构化字段**，渲染器负责样式。每页只给内容，不给排版指令。
7. **封面 Logo 位置和大小由你自由决定**，但内页 Logo 固定（渲染器自动处理）。

## pages.json 骨架

```json
{
  "colorScheme": "group-red",
  "logoSet": "group",
  "slides": [
    { "type": "cover", "title": "标题", "subtitle": "副标题", "date": "2026-07-30", "presenter": "姓名", "department": "部门" },
    { "type": "section", "sectionNumber": "01", "title": "章节名" },
    { "type": "content", "title": "页面标题", "sectionLabel": "01 / 章节", "blocks": [
      { "heading": "小标题", "body": "正文内容..." }
    ]},
    { "type": "cards", "title": "产品矩阵", "columns": 3, "sectionLabel": "02 / 产品", "items": [
      { "icon": "📧", "title": "企业邮箱", "description": "..." }
    ]},
    { "type": "timeline", "title": "发展历程", "sectionLabel": "03 / 历程", "events": [
      { "year": "1997", "title": "公司成立", "description": "..." }
    ]},
    { "type": "end", "text": "感谢聆听" }
  ]
}
```

## 工作流程

1. 阅读用户需求 + 附件文档
2. 从 `company-data/` 中定位需要引用的数据
3. 选择页面类型组合，组织内容结构
4. 输出 `pages.json` — 只包含结构化内容，不含任何视觉属性
````

- [ ] **Step 2: Commit**

```bash
git add agent-prompt.md
git commit -m "feat: add agent instruction prompt"
```

---

### Task 13: 示例 pages.json + 集成验证

**Files:**
- Create: `examples/sample-pages.json`

**Produces:** 端到端可用的示例文件，验证完整流程

- [ ] **Step 1: 创建示例 pages.json**

```json
{
  "colorScheme": "group-red",
  "logoSet": "group",
  "companyName": "二六三网络通信股份有限公司",
  "slides": [
    {
      "type": "cover",
      "title": "全球互联网通信云服务领导者",
      "subtitle": "263 云通信产品介绍",
      "date": "2026-07-30",
      "presenter": "郭跃",
      "department": "云通信事业部"
    },
    {
      "type": "section",
      "sectionNumber": "01",
      "title": "关于我们",
      "subtitle": "了解二六三集团"
    },
    {
      "type": "content",
      "sectionLabel": "01 / 公司概况",
      "title": "关于二六三集团",
      "blocks": [
        {
          "heading": "公司概述",
          "body": "263 集团（股票代码：002467）创立于 1997 年，是全球领先的互联网通信云服务商。总部位于北京，并在上海、广州、深圳、杭州、香港和海外设有办事机构。"
        },
        {
          "heading": "核心优势",
          "body": "深耕行业二十余年，服务超过 700 万企业客户，日处理消息量超过 15 亿条，服务可用性达 99.99%。"
        }
      ]
    },
    {
      "type": "section",
      "sectionNumber": "02",
      "title": "产品矩阵",
      "subtitle": "一站式云通信解决方案"
    },
    {
      "type": "cards",
      "sectionLabel": "02 / 产品矩阵",
      "title": "云通信产品体系",
      "columns": 4,
      "items": [
        { "icon": "📧", "title": "企业邮箱", "description": "安全稳定的企业级邮件系统，支持自定义域名与移动办公。" },
        { "icon": "📹", "title": "云会议", "description": "高清视频会议，千人同时在线，屏幕共享与实时协作。" },
        { "icon": "📡", "title": "企业直播", "description": "一站式直播营销平台，推流、互动、数据分析全覆盖。" },
        { "icon": "📞", "title": "云呼叫中心", "description": "智能全渠道客户联络，整合电话、在线客服与语音导航。" }
      ]
    },
    {
      "type": "section",
      "sectionNumber": "03",
      "title": "发展历程",
      "subtitle": "二十余年深耕通信行业"
    },
    {
      "type": "timeline",
      "sectionLabel": "03 / 发展历程",
      "title": "二十余年深耕通信行业",
      "events": [
        { "year": "1997", "title": "公司成立", "description": "创立于北京，提供互联网接入服务" },
        { "year": "2010", "title": "深交所上市", "description": "在深圳证券交易所上市，股票代码 002467" },
        { "year": "2015", "title": "云通信战略", "description": "全面转型云通信服务" },
        { "year": "2020", "title": "国际化布局", "description": "成立海外分支机构，服务覆盖全球" },
        { "year": "2023", "title": "AI 赋能", "description": "推出 AI 数字员工云小朵，RAG 智能客服" }
      ]
    },
    {
      "type": "end",
      "text": "感谢聆听"
    }
  ]
}
```

- [ ] **Step 2: 运行 generate.js 生成 slides.html**

```bash
node generate.js examples/sample-pages.json
```

- [ ] **Step 3: 在浏览器中打开验证**

打开 `examples/sample-pages.html`，验证：
- 8 个 slide 全部渲染
- 翻页键（方向键 / PageUp/Down / 空格）正常工作
- 封面 Logo 正常显示
- 内页 Logo 固定在右上角
- 字号无违规（无 < 16px）

- [ ] **Step 4: Commit**

```bash
git add examples/ renderer/slides/
git commit -m "feat: add sample pages.json and verify end-to-end rendering"
```

---

### Task 14: 清理临时文件

- [ ] **Step 1: 删除临时文件**

```bash
rm -rf temp-media/ color-preview.html logo-preview.html
git add -A
git commit -m "chore: remove temporary preview files"
```
