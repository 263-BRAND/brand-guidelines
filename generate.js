// generate.js — 263 PPT Renderer
// Usage: node generate.js <pages.json>
// Output: <pages>.html (self-contained, zero-dependency slideshow)

const fs = require('fs');
const path = require('path');

const pagesPath = process.argv[2];
if (!pagesPath) {
  console.error('Usage: node generate.js <pages.json>');
  process.exit(1);
}
if (!fs.existsSync(pagesPath)) {
  console.error('File not found: ' + pagesPath);
  process.exit(1);
}

const tokens = JSON.parse(fs.readFileSync('brand-tokens.json', 'utf-8'));
const pages = JSON.parse(fs.readFileSync(pagesPath, 'utf-8'));

// Validate colorScheme
if (!pages.colorScheme || !tokens.colorSchemes[pages.colorScheme]) {
  console.error('Invalid colorScheme: ' + pages.colorScheme + '. Must be one of: ' + Object.keys(tokens.colorSchemes).join(', '));
  process.exit(1);
}
if (!pages.slides || !Array.isArray(pages.slides) || pages.slides.length === 0) {
  console.error('pages.json must contain a non-empty "slides" array.');
  process.exit(1);
}

// Validate scene: 工作汇报 = "template"，对外展示 = 省略；其他值非法（堵 agent 错写 scene 值绕过广告法检查）
if (pages.scene !== undefined && pages.scene !== 'template') {
  console.error('Invalid scene: "' + pages.scene + '". Must be "template"（工作汇报）或省略（对外展示）。');
  process.exit(1);
}

// 结尾页仅用于文件结尾（品牌硬规则，内/外皆强制）——最后必须是 end，且 end 只能出现在最后位置（中间夹 end/感谢页即违规）；原文件的结尾/感谢页必须替换，不得保留
var lastSlide = pages.slides[pages.slides.length - 1];
if (!lastSlide || lastSlide.type !== 'end') {
  console.error('结尾页必须是最后一页：slide ' + (pages.slides.length - 1) + ' 的 type 为 "' + (lastSlide ? lastSlide.type : 'undefined') + '"，应为 "end"。见 SKILL.md「结尾页」。');
  process.exit(1);
}
for (var e = 0; e < pages.slides.length - 1; e++) {
  if (pages.slides[e].type === 'end') {
    console.error('结尾页仅用于文件结尾：slide ' + e + ' 的 type 为 "end"，但不在最后一页（结尾页必须是整个 PPT 唯一的最后一页）。见 SKILL.md「结尾页」。');
    process.exit(1);
  }
}

// Resolve background templates with color scheme values
var c = tokens.colorSchemes[pages.colorScheme];
function resolveBg(bgTemplate) {
  var result = bgTemplate;
  var keys = Object.keys(c);
  for (var i = 0; i < keys.length; i++) {
    result = result.replace(new RegExp('\\{' + keys[i] + '\\}', 'g'), c[keys[i]]);
  }
  return result;
}

// 元数据键统一跳过（token 对象里非值键）：backgrounds 的 note、colorSchemes 的 semantic（容器）/note（说明）——遍历时剔除，防被当背景模板/色值解析
var TOKEN_META_KEYS = { note: 1, semantic: 1 };
var resolvedBg = { cover: {}, inner: {} };
var bgPresets = tokens.backgrounds;
var coverKeys = Object.keys(bgPresets.cover).filter(function (key) { return !TOKEN_META_KEYS[key]; });
for (var i = 0; i < coverKeys.length; i++) {
  resolvedBg.cover[coverKeys[i]] = resolveBg(bgPresets.cover[coverKeys[i]]);
}
var innerKeys = Object.keys(bgPresets.inner).filter(function (key) { return !TOKEN_META_KEYS[key]; });
for (var j = 0; j < innerKeys.length; j++) {
  resolvedBg.inner[innerKeys[j]] = resolveBg(bgPresets.inner[innerKeys[j]]);
}

// Validate slide backgrounds
// 封面禁红色系（2026-08-19）：彩稿 Logo 主色即品牌红，红底吞 Logo；dark-solid 深底触发反白 Logo，同样违反「封面一律彩稿禁反白」底线 → 一并剔除
var coverForbiddenBg = { 'primary-gradient': 1, 'primary-solid': 1, 'dark-solid': 1 };
var innerBgKeys = Object.keys(resolvedBg.inner);
for (var k = 0; k < pages.slides.length; k++) {
  var slide = pages.slides[k];
  var t = slide.type;
  if (t === 'cover') {
    if (slide.background && coverForbiddenBg[slide.background]) {
      console.error('Slide ' + k + ' (cover): forbidden background "' + slide.background + '" — 封面背景禁红色系（dark-solid 深底会反白 Logo，亦禁）。合法封面背景：themed-fallback（默认）/ white。见 SKILL.md「对外展示封面（Themed）→ 品牌底线」。');
      process.exit(1);
    }
    if (slide.background && slide.background !== 'red-template' && slide.background !== 'themed-fallback' && slide.background !== 'white' && !resolvedBg.cover[slide.background]) {
      console.error('Slide ' + k + ' (cover): invalid background "' + slide.background + '". Must be one of: white, red-template, themed-fallback');
      process.exit(1);
    }
  } else if (slide.background && !resolvedBg.inner[slide.background]) {
    console.error('Slide ' + k + ' (' + t + '): invalid background "' + slide.background + '". Inner slides must use: ' + innerBgKeys.join(', '));
    process.exit(1);
  }
}

// 广告法合规审查（仅对外展示；工作汇报 scene=template 不查）——2026-08-20
// 对外展示输出前，对 pages.json 全部文本字段做违禁词/极限词精确匹配（先剔除非豁免短语压误报）。
// 命中 → exit(1) 打断生成（硬门禁循环：agent 把命中和位置列给用户，用户改词后重跑直到审查干净）。
// custom.html 跳过：含标签/属性，子串匹配误报率高，内容层面由 agent 自查兜底。
var adCheckScene = pages.scene !== 'template';
if (adCheckScene) {
  if (!fs.existsSync('ad-compliance.json')) {
    console.error('广告法合规审查（对外展示）未执行：缺少 ad-compliance.json 词库文件。zip 必须自包含该文件。');
    process.exit(1);
  }
  var adCompliance = JSON.parse(fs.readFileSync('ad-compliance.json', 'utf-8'));
  // 顶层文本字段（companyName——页脚渲染可见）一并入扫
  var adTopTexts = [];
  if (pages.companyName) adTopTexts.push({ label: 'companyName', text: pages.companyName });
  var adHit = findAdViolation(pages.slides, adCompliance.bannedWords || [], adCompliance.exempt || [], adTopTexts);
  if (adHit) {
    var adWhere = (adHit.slide === 'page') ? ('顶层字段 "' + adHit.field + '"') : ('slide ' + adHit.slide + ' 字段 "' + adHit.field + '"');
    console.error('广告法合规审查未通过（对外展示）—— ' + adWhere + ' 命中「' + adHit.category + '」违禁词："' + adHit.word + '"（原文："' + adHit.text + '"）。按 SKILL.md「对外展示 → 广告法合规审查」流程：把命中和位置列给用户，用户改词后重跑直到审查干净。');
    process.exit(1);
  }
}

// 广告法词库匹配辅助：先剔除非豁免短语（防精确匹配误报），再对剩余文本做小写不敏感子串匹配
function stripExemptWords(text, exemptWords) {
  var t = String(text).toLowerCase();
  for (var i = 0; i < exemptWords.length; i++) {
    t = t.split(String(exemptWords[i]).toLowerCase()).join('');
  }
  return t;
}
function adTextFields(slide) {
  var out = [];
  function add(label, text) {
    if (text !== undefined && text !== null && String(text).length > 0) out.push({ label: label, text: String(text) });
  }
  var type = slide.type;
  if (type === 'cover') {
    add('title', slide.title); add('subtitle', slide.subtitle); add('presenter', slide.presenter); add('department', slide.department); add('date', slide.date);
  } else if (type === 'section') {
    add('title', slide.title); add('subtitle', slide.subtitle); add('sectionNumber', slide.sectionNumber);
  } else if (type === 'toc') {
    add('title', slide.title); add('sectionLabel', slide.sectionLabel);
    if (Array.isArray(slide.items)) slide.items.forEach(function (it, i) { add('items[' + i + '].index', it.index); add('items[' + i + '].text', it.text); });
  } else if (type === 'content') {
    add('title', slide.title); add('sectionLabel', slide.sectionLabel);
    if (Array.isArray(slide.blocks)) slide.blocks.forEach(function (bl, i) { add('blocks[' + i + '].heading', bl.heading); add('blocks[' + i + '].body', bl.body); });
  } else if (type === 'cards') {
    add('title', slide.title); add('sectionLabel', slide.sectionLabel);
    if (Array.isArray(slide.items)) slide.items.forEach(function (it, i) { add('items[' + i + '].icon', it.icon); add('items[' + i + '].title', it.title); add('items[' + i + '].description', it.description); });
  } else if (type === 'timeline') {
    add('title', slide.title); add('sectionLabel', slide.sectionLabel);
    if (Array.isArray(slide.events)) slide.events.forEach(function (ev, i) { add('events[' + i + '].year', ev.year); add('events[' + i + '].title', ev.title); add('events[' + i + '].description', ev.description); });
  }
  return out;
}
function findAdViolation(slides, bannedWords, exemptWords, topTexts) {
  // 更具体的词（更长）优先匹配：让「100%可靠」按「承诺词」上报，不被「100%」抢成「极限词」，分类更准
  var bannedSorted = bannedWords.slice().sort(function (a, b) {
    var wa = (typeof a === 'string') ? a : (a.word || '');
    var wb = (typeof b === 'string') ? b : (b.word || '');
    return wb.length - wa.length;
  });
  function check(text, label, slideLabel) {
    var remaining = stripExemptWords(text, exemptWords);
    for (var b = 0; b < bannedSorted.length; b++) {
      var bw = bannedSorted[b];
      var w = (typeof bw === 'string') ? bw : (bw.word || '');
      if (w && remaining.indexOf(String(w).toLowerCase()) !== -1) {
        return { slide: slideLabel, field: label, word: w, category: (typeof bw === 'string') ? '违禁词' : (bw.category || '违禁词'), text: String(text) };
      }
    }
    return null;
  }
  // 顶层文本字段（companyName——页脚渲染可见）先扫
  if (topTexts) {
    for (var t = 0; t < topTexts.length; t++) {
      var topHit = check(topTexts[t].text, topTexts[t].label, 'page');
      if (topHit) return topHit;
    }
  }
  for (var s = 0; s < slides.length; s++) {
    var fields = adTextFields(slides[s]);
    for (var f = 0; f < fields.length; f++) {
      var hit = check(fields[f].text, fields[f].label, s);
      if (hit) return hit;
    }
  }
  return null;
}

// 品牌色卡白名单（custom.html 颜色扫描用）：colorScheme 全部色值（9 色，含 semantic 非 note）+ chartPalette 全色值，小写去重
function buildColorWhitelist(tokens, colorScheme) {
  var set = {};
  function add(v) {
    if (typeof v === 'string' && /^#([0-9a-f]{6}|[0-9a-f]{3})$/i.test(v)) set[v.toLowerCase()] = 1;
  }
  var c = tokens.colorSchemes[colorScheme];
  var keys = Object.keys(c);
  for (var i = 0; i < keys.length; i++) {
    if (TOKEN_META_KEYS[keys[i]]) continue;
    add(c[keys[i]]);
  }
  if (c.semantic) {
    var sKeys = Object.keys(c.semantic);
    for (var j = 0; j < sKeys.length; j++) {
      if (TOKEN_META_KEYS[sKeys[j]]) continue;
      add(c.semantic[sKeys[j]]);
    }
  }
  var cp = tokens.chartPalette && tokens.chartPalette[colorScheme];
  if (cp && cp.series) { for (var k = 0; k < cp.series.length; k++) add(cp.series[k].hex); }
  if (cp && cp.muted) { for (var m = 0; m < cp.muted.length; m++) add(cp.muted[m].hex); }
  return set;
}
function normalizeHex(hex) {
  var h = String(hex).toLowerCase();
  if (h.length === 4) return '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3]; // #RGB → #RRGGBB
  return h;
}
function rgbToHex(r, g, b) {
  function ch(x) {
    x = Math.max(0, Math.min(255, Math.round(Number(x))));
    return (x < 16 ? '0' : '') + x.toString(16);
  }
  return '#' + ch(r) + ch(g) + ch(b);
}
function hslToHex(h, s, l) {
  h = (((Number(h) % 360) + 360) % 360) / 360;
  s = Math.max(0, Math.min(1, Number(s) / 100));
  l = Math.max(0, Math.min(1, Number(l) / 100));
  function hue2(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }
  var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  var p = 2 * l - q;
  return rgbToHex(hue2(p, q, h + 1 / 3) * 255, hue2(p, q, h) * 255, hue2(p, q, h - 1 / 3) * 255);
}
// 色板外常见命名色（CSS 命名色不在品牌色板内；white/black/transparent/currentColor/inherit 等关键词合法）
var OFF_PALETTE_NAMED = { red:1, blue:1, green:1, yellow:1, pink:1, purple:1, orange:1, gray:1, grey:1, brown:1, cyan:1, magenta:1, lime:1, gold:1, silver:1, navy:1, teal:1, maroon:1, olive:1, violet:1, indigo:1, salmon:1, coral:1, tan:1, khaki:1, aqua:1, fuchsia:1 };
function scanCustomHtmlColors(html, whitelist) {
  var text = String(html);
  // 1) #hex（3/6/8 位，8 位剥 alpha；(?![\da-f]) 防 7 位/超长 hex 被截断误读或漏读）
  var hexes = text.match(/#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})(?![\da-f])/gi);
  if (hexes) {
    for (var i = 0; i < hexes.length; i++) {
      var norm = normalizeHex(hexes[i].slice(0, 7));
      if (!whitelist[norm]) return hexes[i];
    }
  }
  // 2) rgb()/rgba()/hsl()/hsla()：归一化到 hex 对照白名单（rgba(255,255,255,.8) 白 80% 透明度是红底规则推荐的合法用法）
  var funcs = text.match(/(rgb|rgba|hsl|hsla)\(([^)]*)\)/gi);
  if (funcs) {
    for (var j = 0; j < funcs.length; j++) {
      var parts = funcs[j].match(/([\d.]+)/g);
      if (!parts || parts.length < 3) continue;
      var kind = funcs[j].toLowerCase();
      var hex = (kind.indexOf('hsl') === 0) ? hslToHex(parts[0], parts[1], parts[2]) : rgbToHex(parts[0], parts[1], parts[2]);
      if (!whitelist[hex]) return funcs[j];
    }
  }
  // 3) 命名色（color 类属性后的纯单词值）：色板外常见命名色违规（white/black/transparent/currentColor 等放行）
  var named = text.match(/\b(?:color|background|background-color|border(?:-top|-right|-bottom|-left)?-color)\s*:\s*([a-zA-Z]+)/gi);
  if (named) {
    for (var k = 0; k < named.length; k++) {
      var name = named[k].split(':')[1].trim().toLowerCase();
      if (OFF_PALETTE_NAMED[name]) return named[k];
    }
  }
  return null;
}
// 对外展示字体栈禁微软雅黑（闭源，对外分发/嵌入有许可风险）
function scanCustomHtmlFonts(html) {
  var m = String(html).match(/微软雅黑|Microsoft\s*YaHei/i);
  return m ? m[0] : null;
}

// Load slide renderers
const slideTypes = ['cover', 'section', 'toc', 'content', 'cards', 'timeline', 'end', 'custom'];
const renderers = {};
for (const t of slideTypes) {
  renderers[t] = require('./renderer/slides/' + t + '.js');
}

// 品牌色卡强制：custom.html 是 HTML 路径唯一能塞任意色/字体的口子，渲染后扫描（非白名单色值 exit 1；对外展示禁微软雅黑）
const colorWhitelist = buildColorWhitelist(tokens, pages.colorScheme);

// Render each slide
const slideHtmlArray = [];
for (let i = 0; i < pages.slides.length; i++) {
  const slide = pages.slides[i];
  if (!slide.type || !slideTypes.includes(slide.type)) {
    console.error('Slide ' + i + ': unknown or missing type "' + (slide.type || '') + '". Must be one of: ' + slideTypes.join(', '));
    process.exit(1);
  }
  const renderFn = renderers[slide.type];
  const html = renderFn(slide, tokens, pages, i, resolvedBg);
  if (slide.type === 'custom') {
    const customColor = scanCustomHtmlColors(html, colorWhitelist);
    if (customColor) {
      console.error('Slide ' + i + ' (custom): 颜色 ' + customColor + ' 不在品牌色板白名单内。custom.html 只能用 colorSchemes / semantic / chartPalette 色值（见 SKILL.md「品牌规则 → 色彩」）。');
      process.exit(1);
    }
    if (adCheckScene) {
      const customFont = scanCustomHtmlFonts(html);
      if (customFont) {
        console.error('Slide ' + i + ' (custom): 对外展示自定义 HTML 含禁用字体 "' + customFont + '"（微软雅黑闭源，对外分发/嵌入有许可风险，见 SKILL.md「字体栈」）。');
        process.exit(1);
      }
    }
  }
  slideHtmlArray.push(html);
}

// Embed logos as base64
function logoBase64(logoPath) {
  if (!fs.existsSync(logoPath)) {
    console.warn('Warning: logo not found: ' + logoPath);
    return '';
  }
  const ext = path.extname(logoPath).toLowerCase();
  const mime = ext === '.svg' ? 'image/svg+xml' : 'image/png';
  const data = fs.readFileSync(logoPath).toString('base64');
  return 'data:' + mime + ';base64,' + data;
}

const logoSet = pages.logoSet || 'group';
const logos = tokens.logos[logoSet] || tokens.logos.group;
const logoColorB64 = logoBase64(logos.color);
const logoWhiteB64 = logos.white ? logoBase64(logos.white) : '';
const sloganPath = tokens.slogan && tokens.slogan.path;
const sloganB64 = sloganPath ? logoBase64(sloganPath) : '';
const redTemplateBgB64 = (tokens.redTemplateCover && tokens.redTemplateCover.path) ? logoBase64(tokens.redTemplateCover.path) : '';
const themedFallbackBgB64 = (tokens.themedFallbackCover && tokens.themedFallbackCover.path) ? logoBase64(tokens.themedFallbackCover.path) : '';

// Build page title: 标题 - 姓名 - MMDD
var pageTitle = '263 PPT';
var cs = pages.slides[0];
if (cs && cs.type === 'cover' && cs.title) {
  var parts = [cs.title];
  if (cs.presenter) parts.push(cs.presenter);
  if (cs.date) {
    var d = cs.date.replace(/[-/.]/g, '');
    if (d.length >= 4) parts.push(d.slice(-4));
  }
  pageTitle = parts.join(' - ');
}

// Build output — fileId: 唯一文件身份，用于 sessionStorage 键命名空间（避免 file:// 页面共享存储导致跨文件位置泄漏）
const fileId = path.basename(pagesPath, '.json');
// 字体栈按场景分流（方案 A）：工作汇报 scene=template → 微软雅黑栈；对外展示（无 scene）→ 开源栈
const fontFamily = (pages.scene === 'template') ? tokens.typography.fontFamily : (tokens.typography.fontFamilyOpenSource || tokens.typography.fontFamily);
const html = buildHtml({
  slides: slideHtmlArray.join('\n'),
  tokens: tokens,
  colorScheme: pages.colorScheme,
  pageTitle: pageTitle,
  fileId: fileId,
  logoColorB64: logoColorB64,
  logoWhiteB64: logoWhiteB64,
  sloganB64: sloganB64,
  redTemplateBgB64: redTemplateBgB64,
  themedFallbackBgB64: themedFallbackBgB64,
  fontFamily: fontFamily
});

const outPath = pagesPath.replace(/\.json$/, '.html');
fs.writeFileSync(outPath, html, 'utf-8');
console.log('Generated: ' + outPath + ' (' + pages.slides.length + ' slides)');

function buildHtml(opts) {
  const c = opts.tokens.colorSchemes[opts.colorScheme];
  const t = opts.tokens.typography;
  const l = opts.tokens.layout;
  var W = 1920;
  var H = 1080;

  return '<!DOCTYPE html>\n' +
'<html lang="zh-CN">\n' +
'<head>\n' +
'<meta charset="UTF-8">\n' +
'<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
'<title>' + opts.pageTitle + '</title>\n' +
'<style>\n' +
'* { margin:0; padding:0; box-sizing:border-box; }\n' +
'html, body { width:100%; height:100%; margin:0; overflow:hidden; background:#FFFFFF; font-family:' + opts.fontFamily + '; }\n' +
':root { --s: 1; }\n' +
'#player { width:' + W + 'px; height:' + H + 'px; position:fixed; top:50%; left:50%; transform:translate(-50%,-50%) scale(var(--s)); overflow:hidden; }\n' +
'.slide-page { position:absolute !important; top:0; left:0; width:100%; height:100%; opacity:0; pointer-events:none; transition:opacity 0.35s ease; z-index:0; }\n' +
'.slide-page.active { opacity:1; pointer-events:auto; z-index:2; }\n' +
':root {\n' +
'  --primary: ' + c.primary + ';\n' +
'  --primary-light: ' + c.primaryLight + ';\n' +
'  --primary-dark: ' + c.primaryDark + ';\n' +
'  --accent: ' + c.accent + ';\n' +
'  --dark: ' + c.dark + ';\n' +
'  --gray: ' + c.gray + ';\n' +
'  --light-gray: ' + c.lightGray + ';\n' +
'  --white: ' + c.white + ';\n' +
'  --black: ' + c.black + ';\n' +
'}\n' +
'.logo-color-img { background: url(' + opts.logoColorB64 + ') no-repeat center/contain; }\n' +
'.logo-white-img { background: url(' + opts.logoWhiteB64 + ') no-repeat center/contain; }\n' +
'.slogan-img { background: url(' + opts.sloganB64 + ') no-repeat center/contain; }\n' +
'.red-template-bg { background: url(' + opts.redTemplateBgB64 + ') no-repeat center/contain; }\n' +
'.themed-fallback-bg { background: url(' + opts.themedFallbackBgB64 + ') no-repeat center/contain; }\n' +
'</style>\n' +
'</head>\n' +
'<body>\n' +
'<div id="player">\n' +
opts.slides + '\n' +
'</div>\n' +
'<script>\n' +
'(function() {\n' +
'  var slides = document.querySelectorAll(".slide-page");\n' +
'  var total = ' + pages.slides.length + ';\n' +
'  var stagger = ' + ((tokens.coverAscii && tokens.coverAscii.stagger) || 30) + ';\n' +
'  var current = 0;\n' +
'  // Restore saved slide on refresh — 键按文件身份命名空间（file:// 页面共享 sessionStorage，裸键会跨文件泄漏）\n' +
'  var storageKey = "263-slide-" + "' + opts.fileId + '";\n' +
'  try { var s = sessionStorage.getItem(storageKey); if (s !== null) current = parseInt(s, 10) % total; } catch(e) {}\n' +
'  function save() { try { sessionStorage.setItem(storageKey, current); } catch(e) {} }\n' +
'  // ASCII replay — resets lines to initial offset and staggers them back in\n' +
'  function replayAscii() {\n' +
'    var lines = document.querySelectorAll(".slide-page.active .ascii-line");\n' +
'    if (!lines.length) return;\n' +
'    for (var i = 0; i < lines.length; i++) {\n' +
'      lines[i].style.opacity = "0";\n' +
'      lines[i].style.transform = "translateX(" + (lines[i].dataset.dir || "-60px") + ")";\n' +
'    }\n' +
'    var cc = document.querySelector(".slide-page.active .cover-content");\n' +
'    if (cc) cc.style.opacity = "0";\n' +
'    for (var j = 0; j < lines.length; j++) {\n' +
'      setTimeout(function(idx) {\n' +
'        return function() { lines[idx].style.opacity = "1"; lines[idx].style.transform = "translateX(0)"; };\n' +
'      }(j), j * stagger);\n' +
'    }\n' +
'    if (cc) { setTimeout(function() { cc.style.opacity = "1"; }, lines.length * stagger + 200); }\n' +
'  }\n' +
'  function show(idx) {\n' +
'    if (current === ((idx % total) + total) % total) return;\n' +
'    slides[current].classList.remove("active");\n' +
'    current = ((idx % total) + total) % total;\n' +
'    slides[current].classList.add("active");\n' +
'    save();\n' +
'    if (current === 0) setTimeout(replayAscii, 50);\n' +
'  }\n' +
'  document.getElementById("player").addEventListener("click", function(e) {\n' +
'    show(current + 1);\n' +
'  });\n' +
'  document.addEventListener("keydown", function(e) {\n' +
'    var key = e.key || e.code;\n' +
'    if (key === "ArrowRight" || key === "ArrowDown" || key === "PageDown" || key === " " || key === "Space") {\n' +
'      e.preventDefault(); show(current + 1);\n' +
'    } else if (key === "ArrowLeft" || key === "ArrowUp" || key === "PageUp") {\n' +
'      e.preventDefault(); show(current - 1);\n' +
'    } else if (key === "Home") { e.preventDefault(); show(0); }\n' +
'    else if (key === "End") { e.preventDefault(); show(total - 1); }\n' +
'  });\n' +
'  slides[current].classList.add("active");\n' +
'  if (current === 0) setTimeout(replayAscii, 100);\n' +
'  function resize() {\n' +
'    var s = Math.min(window.innerWidth / ' + W + ', window.innerHeight / ' + H + ');\n' +
'    document.documentElement.style.setProperty("--s", s);\n' +
'  }\n' +
'  window.addEventListener("resize", resize);\n' +
'  resize();\n' +
'  // Binary rain (Matrix-style) for cover slides\n' +
'  var rainCanvases = document.querySelectorAll("canvas[id^=binaryRain]");\n' +
'  for (var rc = 0; rc < rainCanvases.length; rc++) {\n' +
'    (function(canvas) {\n' +
'      var ctx = canvas.getContext("2d");\n' +
'      canvas.width = 1920;\n' +
'      canvas.height = 1080;\n' +
'      var chars = "01";\n' +
'      var fontSize = 28;\n' +
'      var columns = Math.floor(canvas.width / fontSize);\n' +
'      var drops = [];\n' +
'      for (var d = 0; d < columns; d++) {\n' +
'        drops[d] = Math.floor(Math.random() * -canvas.height / fontSize);\n' +
'      }\n' +
'      var primaryColor = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim() || "#D0121B";\n' +
'      function draw() {\n' +
'        ctx.fillStyle = "rgba(255,255,255,0.05)";\n' +
'        ctx.fillRect(0, 0, canvas.width, canvas.height);\n' +
'        ctx.fillStyle = primaryColor;\n' +
'        ctx.font = fontSize + "px Courier New, monospace";\n' +
'        for (var c = 0; c < drops.length; c++) {\n' +
'          var text = chars[Math.floor(Math.random() * chars.length)];\n' +
'          var x = c * fontSize;\n' +
'          var y = drops[c] * fontSize;\n' +
'          ctx.fillText(text, x, y);\n' +
'          if (y > canvas.height && Math.random() > 0.975) {\n' +
'            drops[c] = 0;\n' +
'          }\n' +
'          drops[c]++;\n' +
'        }\n' +
'      }\n' +
'      setInterval(draw, 80);\n' +
'    })(rainCanvases[rc]);\n' +
'  }\n' +
'})();\n' +
'</script>\n' +
'</body>\n' +
'</html>';
}
