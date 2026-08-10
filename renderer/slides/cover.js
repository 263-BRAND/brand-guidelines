// renderer/slides/cover.js
function renderSlide(slide, tokens, pages, index, resolvedBg) {
  const c = tokens.colorSchemes[pages.colorScheme];
  const W = 1920;
  var bgKey = slide.background || 'primary-gradient';
  var bgStyle = resolvedBg.cover[bgKey] || resolvedBg.cover['primary-gradient'];
  var isDark = bgKey !== 'white';
  var textColor = isDark ? c.white : c.dark;
  var subTextColor = isDark ? 'rgba(255,255,255,0.85)' : c.gray;
  var metaColor = isDark ? 'rgba(255,255,255,0.7)' : c.gray;
  var footColor = isDark ? 'rgba(255,255,255,0.5)' : c.gray;
  var logoClass = isDark ? 'logo-white-img' : 'logo-color-img';
  var lineColor = isDark ? c.white : c.primary;

  var cl = tokens.layout.coverLogo;
  var coverLogoLeft = cl.left, coverLogoTop = cl.top, coverLogoSize = cl.size;

  var html = '<div class="slide-page" id="s' + index + '" style="background:' + bgStyle + '; position:relative;">\n';
  html += '<div style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;padding-left:' + coverLogoLeft + ';">\n';

  html += '<div style="position:absolute;top:' + coverLogoTop + ';left:' + coverLogoLeft + ';">\n';
  html += '<div class="' + logoClass + '" style="width:' + coverLogoSize + ';aspect-ratio:1;height:auto;"></div>\n';
  html += '</div>\n';

  html += '<h1 style="font-size:' + tokens.typography.scale.coverTitle.template + ';font-weight:bold;color:' + textColor + ';margin-bottom:16px;max-width:80%;">' + esc(slide.title) + '</h1>\n';

  if (slide.subtitle) {
    html += '<p style="font-size:' + tokens.typography.scale.subtitle.template + ';color:' + subTextColor + ';margin-bottom:32px;">' + esc(slide.subtitle) + '</p>\n';
  }

  html += '<div style="width:60px;height:4px;background:' + lineColor + ';margin-bottom:32px;"></div>\n';
  html += '<div style="font-size:' + tokens.typography.scale.body.template + ';color:' + metaColor + ';line-height:1.8;">\n';

  if (slide.presenter) { html += '<span>' + esc(slide.presenter) + '</span>'; }
  if (slide.department) { html += '<span style="margin-left:16px;">' + esc(slide.department) + '</span>'; }
  if (slide.date) { html += '<span style="margin-left:16px;">' + esc(slide.date) + '</span>'; }
  html += '</div>\n';

  html += '<div style="position:absolute;bottom:6%;left:6%;font-size:' + tokens.typography.scale.caption.template + ';color:' + footColor + ';">\n';
  html += esc(pages.companyName || '二六三网络通信股份有限公司') + '\n';
  html += '</div>\n';

  html += '</div>\n</div>\n';
  return html;
}

function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
module.exports = renderSlide;
