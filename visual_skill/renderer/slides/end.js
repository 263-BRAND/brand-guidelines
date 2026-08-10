// renderer/slides/end.js
function renderSlide(slide, tokens, pages, index, resolvedBg) {
  const c = tokens.colorSchemes[pages.colorScheme];
  var bgKey = slide.background || 'white';
  var bgColor = resolvedBg.inner[bgKey] || resolvedBg.inner.white;
  var isDark = bgKey !== 'white' && bgKey !== 'light-gray';
  var logoClass = isDark ? 'logo-white-img' : 'logo-color-img';
  var logoW = Math.round(1920 * 0.15);
  var logoH = Math.round(1080 * 0.15);
  var sloganW = Math.round(1920 * 0.4);

  var html = '<div class="slide-page" id="s' + index + '" style="background:' + bgColor + '; overflow:hidden;">\n';
  html += '<div style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;">\n';

  // Centered logo
  html += '<div class="' + logoClass + '" style="width:' + logoW + 'px;height:' + logoH + 'px;margin-bottom:40px;"></div>\n';

  // Slogan
  html += '<div class="slogan-img" style="width:' + sloganW + 'px;height:80px;"></div>\n';

  html += '</div>\n</div>\n';
  return html;
}

function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
module.exports = renderSlide;
