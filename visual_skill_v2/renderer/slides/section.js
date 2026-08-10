// renderer/slides/section.js
function renderSlide(slide, tokens, pages, index, resolvedBg) {
  const c = tokens.colorSchemes[pages.colorScheme];
  const l = tokens.layout.innerPageLogo;
  var bgKey = slide.background || 'white';
  var bgColor = resolvedBg.inner[bgKey] || resolvedBg.inner.white;

  var html = '<div class="slide-page" id="s' + index + '" style="background:' + bgColor + '; overflow:hidden;">\n';

  html += '<div style="position:absolute;top:' + l.top + ';right:' + l.right + ';width:' + l.width + ';height:' + l.height + ';">\n';
  html += '<div class="logo-color-img" style="width:100%;height:100%;"></div>\n';
  html += '</div>\n';

  html += '<div style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;">\n';
  html += '<div style="font-size:' + tokens.typography.sizes.coverTitle.template + ';font-weight:bold;color:' + c.primaryLight + ';opacity:0.15;letter-spacing:8px;">' + esc(slide.sectionNumber) + '</div>\n';
  html += '<h2 style="font-size:' + tokens.typography.sizes.sectionTitle.template + ';font-weight:bold;color:' + c.dark + ';margin-top:-24px;">' + esc(slide.title) + '</h2>\n';

  if (slide.subtitle) {
    html += '<p style="font-size:' + tokens.typography.sizes.subtitle.template + ';color:' + c.gray + ';margin-top:12px;">' + esc(slide.subtitle) + '</p>\n';
  }

  html += '<div style="width:60px;height:3px;background:' + c.primary + ';margin-top:24px;"></div>\n';
  html += '</div>\n</div>\n';
  return html;
}

function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
module.exports = renderSlide;
