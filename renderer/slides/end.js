// renderer/slides/end.js
function renderSlide(slide, tokens, pages, index, resolvedBg) {
  const c = tokens.colorSchemes[pages.colorScheme];
  var bgKey = slide.background || 'white';
  var bgColor = resolvedBg.inner[bgKey] || resolvedBg.inner.white;
  var isDark = bgKey !== 'white' && bgKey !== 'light-gray';
  var logoClass = isDark ? 'logo-white-img' : 'logo-color-img';
  // Logo: height-driven, per spec 30%-36% of canvas height. Square container, contain handles actual aspect ratio.
  var logoSize = Math.round(1080 * 0.33);
  // Slogan: width-driven, per spec 45%-55% of canvas width.
  var sloganW = Math.round(1920 * 0.50);
  // Aspect ratio from brand-tokens.json; fallback derived from the same token's native size (never a magic constant).
  var slogan = tokens.slogan || {};
  var sloganRatio = slogan.aspectRatio || (slogan.nativeWidth && slogan.nativeHeight ? slogan.nativeWidth / slogan.nativeHeight : 0);
  var gap = Math.round(1080 * 0.07);

  var html = '<div class="slide-page" id="s' + index + '" style="background:' + bgColor + '; overflow:hidden;">\n';
  html += '<div style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;">\n';

  // Centered logo — single square dimension, background-size:contain prevents crop/distort
  html += '<div class="' + logoClass + '" style="width:' + logoSize + 'px;height:' + logoSize + 'px;margin-bottom:' + gap + 'px;"></div>\n';

  // Slogan — width-driven, height natural from image aspect ratio (contain prevents crop)
  html += '<div class="slogan-img" style="width:' + sloganW + 'px;height:auto;aspect-ratio:' + sloganRatio + ';"></div>\n';

  html += '</div>\n</div>\n';
  return html;
}

function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
module.exports = renderSlide;
