// renderer/slides/cover.js
// ASCII logo data — extracted from brand heart logo, fixed proportions
var ASCII_LOGO = [
  "                                         ▓▓▓▓▓▒",
  "                                  ▓▓██████████████▓",
  "                              ██████████████████████▓",
  "                          ▓███████████████████████████",
  "                       ▒██████████████████████████████▒",
  "                     ▓█████████████████████████████████",
  "                   ████████████████████████████████████",
  "                 ██████████████████████████████████████",
  "                ███████████████████████████████████████",
  "               ▒███████████████████████████████████████",
  "               ████████████████████████████████████████",
  "               ████████████████████████████████████████",
  "               ███████████████████████████████████████▓",
  "               ▓███▓▓▓▓▓▓▓▓▓▓█▓▓▓██▓▓▓▓▓▓█▓▓▓▓▓▓▓▓▓▓██",
  "               ▒███          █   █      ██          ██",
  "               ▒██████████   █   █▓▓▓▓▓▓█████████   █",
  "                ██          ▓▓          █▓         ▒█",
  "                ██          █           █▒         ▓▒",
  "                ▒█  ▒████████   █████   ████████   ▓",
  "                 ▒         ▓█          ▒▓         ▒",
  "                 ▓         ██         ▓█▓▒▒      ▓▒",
  "                 ▓███████████████████████████████▓",
  "                  ███████████████████████████████",
  "                  ██████████████████████████████",
  "                   ████████████████████████████▒",
  "                   ███████████████████████████▓",
  "                    █████████████████████████▓",
  "                    ████████████████████████▓",
  "                     ██████████████████████▓",
  "                     ▓████████████████████▓",
  "                      ███████████████████",
  "                       █████████████████",
  "                        ██████████████▓",
  "                         ████████████",
  "                          █████████▒",
  "                           ▒████▒"
];

function renderSlide(slide, tokens, pages, index, resolvedBg) {
  var c = tokens.colorSchemes[pages.colorScheme];
  var isTemplate = pages.scene === 'template' || slide.type === 'cover-template';

  if (isTemplate) {
    return renderTemplate(slide, tokens, pages, index, c);
  }
  return renderThemed(slide, tokens, pages, index, c, resolvedBg);
}

// === Template cover: light bg, ASCII logo, centered text ===
function renderTemplate(slide, tokens, pages, index, c) {
  var titleFontSize = tokens.typography.html.scale.coverTitle.template;
  var bodyFontSize = tokens.typography.html.scale.body.template;
  var captionFontSize = tokens.typography.html.scale.caption.template;
  var asciiFontSize = 11; // pt — calibrated at 1920px reference

  var html = '<div class="slide-page" id="s' + index + '" style="background:' + c.lightGray + '; position:relative; overflow:hidden;">\n';

  // ASCII logo
  html += '<div style="position:absolute;top:9%;left:50%;transform:translateX(-50%);z-index:5;">\n';
  html += '<pre style="font-family:\'Courier New\',\'Source Code Pro\',Consolas,monospace;font-size:' + asciiFontSize + 'pt;line-height:0.6;color:' + c.primary + ';white-space:pre;user-select:none;margin:0;">\n';
  for (var li = 0; li < ASCII_LOGO.length; li++) {
    html += esc(ASCII_LOGO[li]) + '\n';
  }
  html += '</pre>\n</div>\n';

  // Title + meta
  html += '<div style="position:absolute;top:45%;left:50%;transform:translateX(-50%);text-align:center;z-index:10;width:80%;">\n';
  html += '<h1 style="font-size:' + titleFontSize + 'pt;font-weight:bold;color:' + c.dark + ';letter-spacing:3px;margin-bottom:14px;">' + esc(slide.title) + '</h1>\n';

  var parts = [];
  if (slide.presenter) parts.push('<span>汇报人：' + esc(slide.presenter) + '</span>');
  if (slide.department) parts.push('<span style="margin-left:24px;">' + esc(slide.department) + '</span>');
  html += '<div style="font-size:' + bodyFontSize + 'pt;color:' + c.gray + ';display:flex;gap:24px;justify-content:center;">\n';
  html += parts.join('<span style="color:' + c.primary + ';opacity:0.5;"> · </span>') + '\n';
  html += '</div>\n';
  html += '</div>\n';

  // Company name
  html += '<div style="position:absolute;bottom:5%;left:0;width:100%;text-align:center;font-size:' + captionFontSize + 'pt;color:' + c.gray + ';opacity:0.45;">\n';
  html += esc(pages.companyName || '二六三网络通信股份有限公司') + '\n';
  html += '</div>\n';

  html += '</div>\n';
  return html;
}

// === Themed cover: gradient bg, corner logo, left-aligned text ===
function renderThemed(slide, tokens, pages, index, c, resolvedBg) {
  var W = 1920;
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

  html += '<h1 style="font-size:' + tokens.typography.html.scale.coverTitle.template + 'pt;font-weight:bold;color:' + textColor + ';margin-bottom:16px;max-width:80%;">' + esc(slide.title) + '</h1>\n';

  if (slide.subtitle) {
    html += '<p style="font-size:' + tokens.typography.html.scale.subtitle.template + 'pt;color:' + subTextColor + ';margin-bottom:32px;">' + esc(slide.subtitle) + '</p>\n';
  }

  html += '<div style="width:60px;height:4px;background:' + lineColor + ';margin-bottom:32px;"></div>\n';
  html += '<div style="font-size:' + tokens.typography.html.scale.body.template + 'pt;color:' + metaColor + ';line-height:1.8;">\n';

  if (slide.presenter) { html += '<span>' + esc(slide.presenter) + '</span>'; }
  if (slide.department) { html += '<span style="margin-left:16px;">' + esc(slide.department) + '</span>'; }
  if (slide.date) { html += '<span style="margin-left:16px;">' + esc(slide.date) + '</span>'; }
  html += '</div>\n';

  html += '<div style="position:absolute;bottom:6%;left:6%;font-size:' + tokens.typography.html.scale.caption.template + 'pt;color:' + footColor + ';">\n';
  html += esc(pages.companyName || '二六三网络通信股份有限公司') + '\n';
  html += '</div>\n';

  html += '</div>\n</div>\n';
  return html;
}

function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
module.exports = renderSlide;
