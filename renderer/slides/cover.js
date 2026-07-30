// renderer/slides/cover.js
function renderSlide(slide, tokens, pages, index) {
  const c = tokens.colorSchemes[pages.colorScheme];
  const W = tokens.slide.width;
  const bgStyle = slide.backgroundStyle === 'solid' ? c.primary : 'linear-gradient(135deg, ' + c.primary + ' 0%, ' + c.primaryDark + ' 100%)';

  var html = '<div class="slide-page" id="s' + index + '" style="background:' + bgStyle + '; position:relative;">\n';
  html += '<div style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;padding-left:6%;">\n';

  // Logo — cover has free logo placement, large top-left
  html += '<div style="position:absolute;top:8%;left:6%;">\n';
  html += '<div class="logo-white-img" style="width:' + Math.round(W * 0.28) + 'px;height:' + Math.round(tokens.slide.height * 0.28) + 'px;"></div>\n';
  html += '</div>\n';

  html += '<h1 style="font-size:' + tokens.typography.sizes.coverTitle + ';font-weight:bold;color:' + c.white + ';margin-bottom:16px;max-width:80%;">' + esc(slide.title) + '</h1>\n';

  if (slide.subtitle) {
    html += '<p style="font-size:' + tokens.typography.sizes.subtitle + ';color:rgba(255,255,255,0.85);margin-bottom:32px;">' + esc(slide.subtitle) + '</p>\n';
  }

  html += '<div style="width:60px;height:4px;background:' + c.white + ';margin-bottom:32px;"></div>\n';
  html += '<div style="font-size:' + tokens.typography.sizes.body + ';color:rgba(255,255,255,0.7);line-height:1.8;">\n';

  if (slide.presenter) {
    html += '<span>' + esc(slide.presenter) + '</span>';
  }
  if (slide.department) {
    html += '<span style="margin-left:16px;">' + esc(slide.department) + '</span>';
  }
  if (slide.date) {
    html += '<span style="margin-left:16px;">' + esc(slide.date) + '</span>';
  }
  html += '</div>\n';

  html += '<div style="position:absolute;bottom:6%;left:6%;font-size:' + tokens.typography.sizes.caption + ';color:rgba(255,255,255,0.5);">\n';
  html += esc(pages.companyName || '二六三网络通信股份有限公司') + '\n';
  html += '</div>\n';

  html += '</div>\n</div>\n';
  return html;
}

function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
module.exports = renderSlide;
