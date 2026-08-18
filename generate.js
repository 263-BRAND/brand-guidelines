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

// Resolve all background presets
var resolvedBg = { cover: {}, inner: {} };
var bgPresets = tokens.backgrounds;
var coverKeys = Object.keys(bgPresets.cover);
for (var i = 0; i < coverKeys.length; i++) {
  resolvedBg.cover[coverKeys[i]] = resolveBg(bgPresets.cover[coverKeys[i]]);
}
var innerKeys = Object.keys(bgPresets.inner);
for (var j = 0; j < innerKeys.length; j++) {
  resolvedBg.inner[innerKeys[j]] = resolveBg(bgPresets.inner[innerKeys[j]]);
}

// Validate slide backgrounds
var innerBgKeys = Object.keys(resolvedBg.inner);
for (var k = 0; k < pages.slides.length; k++) {
  var slide = pages.slides[k];
  var t = slide.type;
  if (t === 'cover') {
    if (slide.background && slide.background !== 'red-template' && !resolvedBg.cover[slide.background]) {
      console.error('Slide ' + k + ' (' + t + '): invalid background "' + slide.background + '". Must be one of: ' + Object.keys(resolvedBg.cover).join(', ') + ', red-template');
      process.exit(1);
    }
  } else if (slide.background && !resolvedBg.inner[slide.background]) {
    console.error('Slide ' + k + ' (' + t + '): invalid background "' + slide.background + '". Inner slides must use: ' + innerBgKeys.join(', '));
    process.exit(1);
  }
}

// Load slide renderers
const slideTypes = ['cover', 'section', 'toc', 'content', 'cards', 'timeline', 'end', 'custom'];
const renderers = {};
for (const t of slideTypes) {
  renderers[t] = require('./renderer/slides/' + t + '.js');
}

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
const html = buildHtml({
  slides: slideHtmlArray.join('\n'),
  tokens: tokens,
  colorScheme: pages.colorScheme,
  pageTitle: pageTitle,
  fileId: fileId,
  logoColorB64: logoColorB64,
  logoWhiteB64: logoWhiteB64,
  sloganB64: sloganB64,
  redTemplateBgB64: redTemplateBgB64
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
'html, body { width:100%; height:100%; margin:0; overflow:hidden; background:#FFFFFF; font-family:' + t.fontFamily + '; }\n' +
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
