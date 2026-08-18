// renderer/slides/toc.js — 目录页
// slide 字段：title（目录标题）、items[]（每项 { index, text }），可选 sectionLabel
function renderSlide(slide, tokens, pages, index, resolvedBg) {
  const c = tokens.colorSchemes[pages.colorScheme];
  const l = tokens.layout.innerPageLogo;
  const lh = tokens.typography.lineHeight.html;
  var bgKey = slide.background || 'white';
  var bgColor = resolvedBg.inner[bgKey] || resolvedBg.inner.white;
  var textColor = c.dark;

  var itemsHtml = '';
  var items = slide.items || [];
  for (var i = 0; i < items.length; i++) {
    var it = items[i];
    itemsHtml += '<div style="display:flex;align-items:center;margin-bottom:24px;">\n';
    itemsHtml += '<div style="font-size:' + tokens.typography.sizes.sectionTitle.template + ';font-weight:bold;color:' + c.primary + ';margin-right:24px;width:1.2em;text-align:center;line-height:' + lh.title + ';">' + esc(it.index) + '</div>\n';
    itemsHtml += '<div style="font-size:' + tokens.typography.sizes.body.template + ';color:' + textColor + ';line-height:' + lh.tocItem + ';">' + esc(it.text) + '</div>\n';
    itemsHtml += '</div>\n';
  }

  var html = '<div class="slide-page" id="s' + index + '" style="background:' + bgColor + '; position:relative;">\n';

  html += '<div style="position:absolute;top:' + l.top + ';right:' + l.right + ';width:' + l.width + ';height:' + l.height + ';">\n';
  html += '<div class="logo-color-img" style="width:100%;height:100%;"></div>\n';
  html += '</div>\n';

  html += '<div style="position:absolute;top:12%;left:6%;right:calc(' + l.right + ' + ' + l.width + ');">\n';
  if (slide.sectionLabel) {
    html += '<div style="font-size:' + tokens.typography.sizes.caption.template + ';color:' + c.primary + ';letter-spacing:2px;margin-bottom:4px;">' + esc(slide.sectionLabel) + '</div>\n';
  }
  html += '<h2 style="font-size:' + tokens.typography.sizes.pageTitle.template + ';font-weight:bold;color:' + textColor + ';line-height:' + lh.title + ';">' + esc(slide.title) + '</h2>\n';
  html += '</div>\n';

  html += '<div style="position:absolute;top:28%;left:6%;right:6%;bottom:12%;">\n';
  html += itemsHtml;
  html += '</div>\n';

  html += '<div style="position:absolute;bottom:9%;left:6%;right:6%;height:1px;background:' + c.primary + ';opacity:0.4;"></div>\n';
  html += '<div style="position:absolute;bottom:3%;left:6%;right:6%;display:flex;justify-content:space-between;font-size:' + tokens.typography.sizes.caption.template + ';color:' + c.gray + ';">\n';
  html += '<span>' + esc(pages.companyName || '二六三网络通信股份有限公司') + '</span>\n';
  html += '<span>' + (index + 1) + ' / ' + pages.slides.length + '</span>\n';
  html += '</div>\n';

  html += '</div>\n';
  return html;
}

function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
module.exports = renderSlide;
