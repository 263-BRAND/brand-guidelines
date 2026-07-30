// renderer/slides/content.js
function renderSlide(slide, tokens, pages, index) {
  const c = tokens.colorSchemes[pages.colorScheme];
  const l = tokens.layout.contentLogo;
  var isLight = slide.background !== 'dark';
  var bgColor = isLight ? c.white : c.dark;
  var textColor = isLight ? c.dark : c.white;
  var logoClass = isLight ? 'logo-color-img' : 'logo-white-img';

  var blocksHtml = '';
  var blocks = slide.blocks || [];
  for (var i = 0; i < blocks.length; i++) {
    var b = blocks[i];
    blocksHtml += '<div style="margin-bottom:24px;">\n';
    blocksHtml += '<h3 style="font-size:' + tokens.typography.sizes.subtitle + ';color:' + c.primaryLight + ';margin-bottom:8px;font-weight:bold;">' + esc(b.heading) + '</h3>\n';
    blocksHtml += '<p style="font-size:' + tokens.typography.sizes.body + ';color:' + textColor + ';line-height:1.8;">' + esc(b.body) + '</p>\n';
    blocksHtml += '</div>\n';
  }

  var html = '<div class="slide-page" id="s' + index + '" style="background:' + bgColor + '; position:relative;">\n';

  // Fixed logo top-right
  html += '<div style="position:absolute;top:' + l.top + ';right:' + l.right + ';width:' + l.width + ';height:' + l.height + ';">\n';
  html += '<div class="' + logoClass + '" style="width:100%;height:100%;"></div>\n';
  html += '</div>\n';

  // Header
  html += '<div style="position:absolute;top:18%;left:6%;right:6%;">\n';
  if (slide.sectionLabel) {
    html += '<div style="font-size:' + tokens.typography.sizes.caption + ';color:' + c.primary + ';letter-spacing:2px;margin-bottom:4px;">' + esc(slide.sectionLabel) + '</div>\n';
  }
  html += '<h2 style="font-size:' + tokens.typography.sizes.pageTitle + ';font-weight:bold;color:' + textColor + ';">' + esc(slide.title) + '</h2>\n';
  html += '</div>\n';

  // Body
  html += '<div style="position:absolute;top:32%;left:6%;right:6%;bottom:15%;overflow-y:auto;">\n';
  html += blocksHtml;
  html += '</div>\n';

  // Footer
  html += '<div style="position:absolute;bottom:9%;left:6%;right:6%;height:1px;background:' + c.primary + ';opacity:0.4;"></div>\n';
  html += '<div style="position:absolute;bottom:3%;left:6%;right:6%;display:flex;justify-content:space-between;font-size:' + tokens.typography.sizes.caption + ';color:' + c.gray + ';">\n';
  html += '<span>' + esc(pages.companyName || '二六三网络通信股份有限公司') + '</span>\n';
  html += '<span>' + (index + 1) + ' / ' + pages.slides.length + '</span>\n';
  html += '</div>\n';

  html += '</div>\n';
  return html;
}

function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
module.exports = renderSlide;
