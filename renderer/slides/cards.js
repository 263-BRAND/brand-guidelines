// renderer/slides/cards.js
function renderSlide(slide, tokens, pages, index, resolvedBg) {
  const c = tokens.colorSchemes[pages.colorScheme];
  const l = tokens.layout.innerPageLogo;
  var bgKey = slide.background || 'white';
  var bgColor = resolvedBg.inner[bgKey] || resolvedBg.inner.white;
  var cols = slide.columns || 3;
  var gap = 20;
  var cardWidth = 'calc((100% - ' + ((cols - 1) * gap) + 'px) / ' + cols + ')';

  var cardsHtml = '';
  var items = slide.items || [];
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    cardsHtml += '<div style="flex:0 0 ' + cardWidth + ';background:' + c.white + ';border-radius:8px;padding:28px 24px;box-shadow:0 2px 12px rgba(0,0,0,0.06);border-top:3px solid ' + c.primary + ';">\n';
    if (item.icon) { cardsHtml += '<div style="font-size:32px;margin-bottom:12px;">' + esc(item.icon) + '</div>\n'; }
    cardsHtml += '<h3 style="font-size:' + tokens.typography.sizes.subtitle + ';color:' + c.dark + ';font-weight:bold;margin-bottom:8px;">' + esc(item.title) + '</h3>\n';
    cardsHtml += '<p style="font-size:' + tokens.typography.sizes.body + ';color:' + c.gray + ';line-height:1.7;">' + esc(item.description) + '</p>\n';
    cardsHtml += '</div>\n';
  }

  var html = '<div class="slide-page" id="s' + index + '" style="background:' + bgColor + '; overflow:hidden;">\n';

  html += '<div style="position:absolute;top:' + l.top + ';right:' + l.right + ';width:' + l.width + ';height:' + l.height + ';">\n';
  html += '<div class="logo-color-img" style="width:100%;height:100%;"></div>\n';
  html += '</div>\n';

  html += '<div style="position:absolute;top:12%;left:6%;right:6%;">\n';
  if (slide.sectionLabel) {
    html += '<div style="font-size:' + tokens.typography.sizes.caption + ';color:' + c.primary + ';letter-spacing:2px;margin-bottom:4px;">' + esc(slide.sectionLabel) + '</div>\n';
  }
  html += '<h2 style="font-size:' + tokens.typography.sizes.pageTitle + ';font-weight:bold;color:' + c.dark + ';">' + esc(slide.title) + '</h2>\n';
  html += '</div>\n';

  html += '<div style="position:absolute;top:28%;left:6%;right:6%;bottom:6%;display:flex;flex-wrap:wrap;gap:' + gap + 'px;align-content:flex-start;">\n';
  html += cardsHtml;
  html += '</div>\n';

  html += '<div style="position:absolute;bottom:3%;right:6%;font-size:' + tokens.typography.sizes.caption + ';color:' + c.gray + ';">' + (index + 1) + ' / ' + pages.slides.length + '</div>\n';

  html += '</div>\n';
  return html;
}

function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
module.exports = renderSlide;
