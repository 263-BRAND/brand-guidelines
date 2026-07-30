// renderer/slides/section.js
function renderSlide(slide, tokens, pages, index) {
  const c = tokens.colorSchemes[pages.colorScheme];
  const l = tokens.layout.contentLogo;
  var isLight = slide.background === 'light';
  var bgColor = isLight ? c.white : c.primary;
  var textColor = isLight ? c.dark : c.white;
  var subColor = isLight ? c.gray : 'rgba(255,255,255,0.7)';
  var logoClass = isLight ? 'logo-color-img' : 'logo-white-img';

  var html = '<div class="slide-page" id="s' + index + '" style="background:' + bgColor + '; position:relative;">\n';

  // Fixed logo top-right
  html += '<div style="position:absolute;top:' + l.top + ';right:' + l.right + ';width:' + l.width + ';height:' + l.height + ';">\n';
  html += '<div class="' + logoClass + '" style="width:100%;height:100%;"></div>\n';
  html += '</div>\n';

  html += '<div style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;">\n';
  html += '<div style="font-size:' + tokens.typography.sizes.coverTitle + ';font-weight:bold;color:' + c.primaryLight + ';opacity:0.15;letter-spacing:8px;">' + esc(slide.sectionNumber) + '</div>\n';
  html += '<h2 style="font-size:' + tokens.typography.sizes.sectionTitle + ';font-weight:bold;color:' + textColor + ';margin-top:-24px;">' + esc(slide.title) + '</h2>\n';

  if (slide.subtitle) {
    html += '<p style="font-size:' + tokens.typography.sizes.subtitle + ';color:' + subColor + ';margin-top:12px;">' + esc(slide.subtitle) + '</p>\n';
  }

  html += '<div style="width:60px;height:3px;background:' + (isLight ? c.primary : c.white) + ';margin-top:24px;"></div>\n';
  html += '</div>\n</div>\n';
  return html;
}

function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
module.exports = renderSlide;
