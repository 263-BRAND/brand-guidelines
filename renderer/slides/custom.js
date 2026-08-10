// renderer/slides/custom.js — agent-controlled layout
function renderSlide(slide, tokens, pages, index, resolvedBg) {
  const c = tokens.colorSchemes[pages.colorScheme];
  const l = tokens.layout.innerPageLogo;
  var bgKey = slide.background || 'white';
  var bgColor = resolvedBg.inner[bgKey] || resolvedBg.inner.white;

  var html = '<div class="slide-page" id="s' + index + '" style="background:' + bgColor + '; position:relative; overflow:hidden;">\n';

  // Logo — fixed position
  html += '<div style="position:absolute;top:' + l.top + ';right:' + l.right + ';width:' + l.width + ';height:' + l.height + ';">\n';
  html += '<div class="logo-color-img" style="width:100%;height:100%;"></div>\n';
  html += '</div>\n';

  // Agent-provided HTML body — free layout
  if (slide.html) {
    html += slide.html + '\n';
  }

  // Footer — company name + page number
  html += '<div style="position:absolute;top:84%;left:6%;right:6%;display:flex;justify-content:space-between;font-size:' + tokens.typography.sizes.caption.template + ';color:' + c.gray + ';">\n';
  html += '<span>' + esc(pages.companyName || '二六三网络通信股份有限公司') + '</span>\n';
  html += '<span>' + (index + 1) + ' / ' + pages.slides.length + '</span>\n';
  html += '</div>\n';

  html += '</div>\n';
  return html;
}

function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
module.exports = renderSlide;
