// vi-apply.js — Apply VI tokens to existing HTML PPT
// Usage: node vi-apply.js <input.html> [colorScheme]
// Output: <input>-vi.html

const fs = require('fs');

const inputPath = process.argv[2];
if (!inputPath) { console.error('Usage: node vi-apply.js <input.html> [group-red|business-blue]'); process.exit(1); }

const colorScheme = process.argv[3] || 'group-red';
const tokens = JSON.parse(fs.readFileSync('vi-tokens.json', 'utf-8'));
if (!tokens.colorSchemes[colorScheme]) { console.error('Invalid colorScheme: ' + colorScheme); process.exit(1); }

const c = tokens.colorSchemes[colorScheme];
const t = tokens.typography;

// Color mapping: detected colors → VI tokens
const colorMap = {
  // Red family → VI red
  '#D0111B': c.primary,
  '#d0111b': c.primary,
  '#b91c1c': c.primaryDark,
  '#dc2626': c.primaryLight,
  '#e6000e': c.primaryLight,
  // Blue family → VI blue
  '#2563eb': c.primary,
  '#3b82f6': c.primaryLight,
  '#1d4ed8': c.primaryDark,
  // Neutral family → VI neutral
  '#1c1917': c.dark,
  '#78716c': c.gray,
  '#a8a29e': c.gray,
  '#d6d3d1': c.lightGray,
  '#f5f5f4': c.lightGray,
  '#e5e5e5': c.lightGray,
  '#ffffff': c.white,
  '#fff': c.white,
  '#000000': c.black,
  '#000': c.black
};

// Read and process
var html = fs.readFileSync(inputPath, 'utf-8');

// Step 1: Replace colors
Object.keys(colorMap).forEach(function(from) {
  var to = colorMap[from];
  var regex = new RegExp(from.replace('#', '#'), 'gi');
  html = html.replace(regex, to);
});

// Step 2: Replace font-family
html = html.replace(/font-family:[^;"]*Microsoft YaHei[^;"]*[;"]/gi, function(m) {
  return m.replace(/Microsoft YaHei/g, '微软雅黑');
});
html = html.replace(/font-family:([^;"]+)/gi, function(m, fonts) {
  if (fonts.includes('微软雅黑')) return m;
  return 'font-family:微软雅黑, ' + fonts.trim();
});
html = html.replace(/<\/style>/, function(m) {
  return 'body{font-family:微软雅黑, "Microsoft YaHei", sans-serif !important}' + m;
});

// Step 3: Embed logo as base64 in CSS
const logoSet = 'group';
const logos = tokens.logos[logoSet];
const logoColorB64 = base64(logos.color);
const logoWhiteB64 = base64(logos.white);

html = html.replace(/<\/style>/, function(m) {
  return '\n.vi-logo{position:fixed;top:' + tokens.layout.contentLogo.top +
    ';right:' + tokens.layout.contentLogo.right +
    ';width:' + tokens.layout.contentLogo.width +
    ';height:' + tokens.layout.contentLogo.height +
    ';background:url(' + logoColorB64 + ') no-repeat center/contain;z-index:999;}' +
    '\n.vi-logo-dark{background:url(' + logoWhiteB64 + ') no-repeat center/contain;}' +
    m;
});

// Step 4: Inject logo into internal slides (skip cover/first slide, skip end/last slide)
var slideRegex = /(<(section|div)[^>]*class="slide[^"]*"[^>]*>)/gi;
var slideMatches = html.match(slideRegex);
var slideCount = slideMatches ? slideMatches.length : 0;
var slideIdx = 0;
html = html.replace(slideRegex, function(m) {
  var current = slideIdx++;
  // Skip first and last slide for logo injection
  if (current === 0 || (slideCount > 1 && current === slideCount - 1)) {
    return m;
  }
  // Check if slide is dark background
  var isDark = /background[^:]*:#[0-9a-fA-F]{3,6}[^;"]*[;"]/i.test(m) &&
    !/background[^:]*:#[fF]/.test(m) && !/background[^:]*:#fff/i.test(m);
  return m + '<div class="vi-logo' + (isDark ? ' vi-logo-dark' : '') + '"></div>';
});

// Write output
var outPath = inputPath.replace(/\.html$/i, '-vi.html');
fs.writeFileSync(outPath, html, 'utf-8');
console.log('Applied VI (' + colorScheme + '): ' + outPath + ' (' + slideCount + ' slides)');

function base64(filePath) {
  if (!fs.existsSync(filePath)) return '';
  var ext = filePath.split('.').pop().toLowerCase();
  var mime = ext === 'svg' ? 'image/svg+xml' : 'image/png';
  return 'data:' + mime + ';base64,' + fs.readFileSync(filePath).toString('base64');
}
