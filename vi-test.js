var fs = require('fs');
var h = fs.readFileSync('G:/AI vibe coding/Claude Code/Claude Code/263viForAgent/视觉参考/vi测试/8-AI工具心得-杜鸣-V8.html','utf8');
var tokens = JSON.parse(fs.readFileSync('brand-tokens.json','utf8'));
var c = tokens.colorSchemes['group-red'];

// Extract slides
var slides = [];
var searchFrom = h.indexOf('<section');
for (var i = 0; i < 15; i++) {
  var startTag = h.indexOf('<section class="slide', searchFrom);
  if (startTag === -1) break;
  var contentStart = h.indexOf('>', startTag) + 1;
  var endTag = h.indexOf('</section>', contentStart);
  if (endTag === -1) break;
  slides.push({ html: h.substring(startTag, endTag + '</section>'.length), start: startTag, end: endTag + '</section>'.length });
  searchFrom = endTag + 10;
}
console.log('Extracted', slides.length, 'slides');

// Pick: cover(0), toc(1), content(3), atom skills(5), end(14)
var pick = [0, 1, 3, 5, 14];

// Color map: all non-brand colors → brand palette (Template mode)
var colorMap = {
  '#D0111B': c.primary,
  '#b91c1c': c.primaryDark,
  '#16a34a': c.primary,       // green → primary
  '#15803d': c.primaryDark,   // dark green → primaryDark
  '#3b82f6': c.dark,          // blue → dark
  '#2563eb': c.primaryDark,   // dark blue → primaryDark
  '#1c1917': c.dark,          // near-black text → brand dark
  '#78716c': c.gray,          // warm gray → brand gray
  '#a8a29e': c.gray,          // light warm gray → brand gray
  '#d6d3d1': c.lightGray,     // very light gray → brand lightGray
  '#f5f5f4': c.lightGray      // card bg → brand lightGray
};

function replaceColors(str) {
  var result = str;
  Object.keys(colorMap).forEach(function(from) {
    var to = colorMap[from];
    // Escape for regex, but simple replaceAll works since these are hex codes
    while (result.indexOf(from) !== -1) {
      result = result.replace(from, to);
    }
  });
  return result;
}

// VI-ize each selected slide
var viSlides = pick.map(function(pi) {
  var s = slides[pi].html;

  // Issue 2: Replace ending page (slide 14) with VI standard end page
  if (pi === 14) {
    return '<section class="slide" data-title="结尾" style="background:#fff;">\n' +
      '  <div style="display:flex;flex-direction:column;justify-content:center;align-items:center;height:100%;gap:32px;">\n' +
      '    <div class="logo-vi-end"></div>\n' +
      '    <div style="width:200px;height:2px;background:' + c.primary + ';opacity:0.3;"></div>\n' +
      '    <div class="slogan-vi"></div>\n' +
      '  </div>\n</section>';
  }

  s = replaceColors(s);

  // For non-cover slides, add logo
  if (pi !== 0) {
    s = s.replace('</section>', '  <div class="logo-vi logo-vi-color"></div>\n</section>');
  }
  return s;
});

// Get style block and VI-ize
var styleEnd = h.indexOf('<section');
var style = h.substring(0, styleEnd);
style = replaceColors(style);

// Issue 3: Move help from top-right to bottom-left to avoid logo safe zone
style = style.replace(/\.help\{[^}]+}/g, '.help{position:fixed;bottom:16px;left:20px;font-size:.95rem;color:#a8a29e;z-index:30;background:rgba(255,255,255,.9);padding:6px 12px;border-radius:6px}');

// Issue 1: Replace color-specific utility classes to use brand colors
style = style.replace(/\.card-green-top\{[^}]+}/g, '.card-green-top{border-top:5px solid ' + c.primary + '}');
style = style.replace(/\.card-blue-top\{[^}]+}/g, '.card-blue-top{border-top:5px solid ' + c.dark + '}');
style = style.replace(/\.icon-blue\{[^}]+}/g, '.icon-blue{background:linear-gradient(135deg,' + c.dark + ',' + c.primaryDark + ')}');
style = style.replace(/\.icon-green\{[^}]+}/g, '.icon-green{background:linear-gradient(135deg,' + c.primary + ',' + c.primaryDark + ')}');
style = style.replace(/\.icon-red\{[^}]+}/g, '.icon-red{background:linear-gradient(135deg,' + c.primary + ',' + c.primaryDark + ')}');

// Embed logos
var logoColorB64 = '';
var logoWhiteB64 = '';
var sloganB64 = '';
try {
  logoColorB64 = fs.readFileSync('assets/logos/logo-group-color.png').toString('base64');
  logoWhiteB64 = fs.readFileSync('assets/logos/logo-group-white.png').toString('base64');
  sloganB64 = fs.readFileSync('assets/slogan.png').toString('base64');
  console.log('Assets embedded: logo-color, logo-white, slogan');
} catch(e) {
  console.log('Some assets missing: ' + e.message);
}

// Logo CSS
var logoCSS = '\n' +
  '.logo-vi{position:absolute;top:46px;right:80px;width:80px;height:80px;z-index:100;background-size:contain;background-repeat:no-repeat;background-position:center}\n' +
  '.logo-vi-color{background-image:url(data:image/png;base64,' + logoColorB64 + ')}\n' +
  '.logo-vi-end{width:160px;height:160px;background-size:contain;background-repeat:no-repeat;background-position:center;background-image:url(data:image/png;base64,' + logoColorB64 + ')}\n' +
  '.slogan-vi{width:320px;height:48px;background-size:contain;background-repeat:no-repeat;background-position:center;background-image:url(data:image/png;base64,' + sloganB64 + ')}\n';
style = style.replace('</style>', logoCSS + '</style>');

// Build output
var output = style;
output += '<div class="deck" id="deck">\n';
viSlides.forEach(function(s, i) {
  if (i === 0 && s.indexOf('is-active') === -1) {
    s = s.replace('class="slide"', 'class="slide is-active"');
  }
  output += s + '\n';
});
output += '<div class="progress-bar"><span></span></div>\n';
output += '</div>\n';

// Player JS
output += '<script>\n(function(){\nvar slides=document.querySelectorAll(".slide");\nvar total=slides.length;\nvar current=0;\nfunction show(n){slides.forEach(function(s,i){s.classList.toggle("is-active",i===n)});var bar=document.querySelector(".progress-bar span");if(bar)bar.style.width=((n+1)/total*100)+"%";}\ndocument.addEventListener("keydown",function(e){if(e.key==="ArrowRight"||e.key==="ArrowDown"||e.key==="PageDown"||e.key===" "){e.preventDefault();if(current<total-1){current++;show(current);}}if(e.key==="ArrowLeft"||e.key==="ArrowUp"||e.key==="PageUp"){e.preventDefault();if(current>0){current--;show(current);}}});\ndocument.addEventListener("click",function(e){if(e.target.closest(".logo-vi"))return;if(current<total-1){current++;show(current);}});\nshow(0);\n})();\n</script>\n';

var outPath = 'G:/AI vibe coding/Claude Code/Claude Code/263viForAgent/视觉参考/vi测试/vi-test-5pages.html';
fs.writeFileSync(outPath, output);
console.log('Written to vi-test-5pages.html');
console.log('Colors unified: all non-brand → brand palette');
console.log('End page: standard VI ending (logo + slogan)');
console.log('Help: moved to bottom-left (safe from logo zone)');
