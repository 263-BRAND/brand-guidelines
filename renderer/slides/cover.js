// renderer/slides/cover.js
function renderSlide(slide, tokens, pages, index, resolvedBg) {
  var c = tokens.colorSchemes[pages.colorScheme];
  var isTemplate = pages.scene === 'template' || slide.type === 'cover-template';

  if (isTemplate) {
    return renderTemplate(slide, tokens, pages, index, c);
  }
  return renderThemed(slide, tokens, pages, index, c, resolvedBg);
}

// === Template cover: internal reporting — white bg, ASCII logo, binary rain, centered ===
function renderTemplate(slide, tokens, pages, index, c) {
  var bgStyle = '#FFFFFF';
  var html = '<div class="slide-page" id="s' + index + '" style="background:' + bgStyle + '; position:relative; overflow:hidden;">\n';

  // Binary rain canvas
  html += '<canvas id="binaryRain' + index + '" style="position:absolute;inset:0;z-index:0;opacity:0.08;"></canvas>\n';

  // ASCII art — from brand-tokens
  var ascii = tokens.coverAscii;
  if (ascii && ascii.art) {
    var asciiFont = tokens.typography.asciiArt;
    var asciiColor = ascii.color.replace('{primary}', c.primary);
    var dist = ascii.slideDistance || '60px';
    var lines = ascii.art.split('\n');
    html += '<div style="position:absolute;top:16%;left:50%;transform:translateX(-50%);z-index:5;">\n';
    var scaleX = asciiFont.scaleX || '1';
    var overallScaleX = asciiFont.overallScaleX || '1';
    var overallScaleY = asciiFont.overallScaleY || '1';
    html += '<div style="transform:scale(' + overallScaleX + ', ' + overallScaleY + ');transform-origin:top center;">\n';
    html += '<pre style="font-family:' + asciiFont.fontFamily + ';font-size:' + asciiFont.fontSize + ';line-height:' + asciiFont.lineHeight + ';color:' + asciiColor + ';white-space:pre;user-select:none;margin:0;transform:scaleX(' + scaleX + ');">\n';
    for (var i = 0; i < lines.length; i++) {
      var dir = (i % 2 === 0) ? '-' + dist : dist;
      html += '<span class="ascii-line" style="display:block;opacity:0;transform:translateX(' + dir + ');transition:opacity 0.6s ease,transform 0.6s ease;">' + lines[i].substring(15) + '</span>\n';
    }
    html += '</pre>\n';
    html += '</div>\n';
    html += '</div>\n';
  }

  // Title block
  html += '<div class="cover-content" style="position:absolute;top:48%;left:50%;transform:translateX(-50%);text-align:center;z-index:10;width:80%;opacity:0;transition:opacity 0.8s ease;">\n';
  html += '<h1 style="font-size:' + tokens.typography.sizes.coverTitle.template + ';font-weight:bold;color:' + c.dark + ';letter-spacing:3px;margin-bottom:14px;">' + esc(slide.title) + '</h1>\n';

  if (slide.subtitle || slide.presenter || slide.department) {
    html += '<div style="font-size:' + tokens.typography.sizes.subtitle.template + ';color:' + c.gray + ';display:flex;gap:24px;justify-content:center;">\n';
    if (slide.subtitle) { html += '<span>' + esc(slide.subtitle) + '</span>'; }
    if (slide.subtitle && (slide.presenter || slide.department)) { html += '<span style="color:' + c.primary + ';opacity:0.5;"> · </span>'; }
    if (slide.presenter) { html += '<span>汇报人：' + esc(slide.presenter) + '</span>'; }
    if (slide.presenter && slide.department) { html += '<span style="color:' + c.primary + ';opacity:0.5;"> · </span>'; }
    if (slide.department) { html += '<span>' + esc(slide.department) + '</span>'; }
    html += '</div>\n';
  }

  html += '</div>\n';

  // Footer
  html += '<div style="position:absolute;bottom:5%;left:0;width:100%;text-align:center;font-size:' + tokens.typography.sizes.caption.template + ';color:' + c.gray + ';opacity:0.45;">\n';
  html += esc(pages.companyName || '二六三网络通信股份有限公司') + '\n';
  html += '</div>\n';

  html += '</div>\n';
  return html;
}

// === Themed cover: external presentation — gradient bg, corner PNG logo, left-aligned ===
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

  // PNG Logo — top-left
  html += '<div style="position:absolute;top:' + coverLogoTop + ';left:' + coverLogoLeft + ';">\n';
  html += '<div class="' + logoClass + '" style="width:' + coverLogoSize + ';aspect-ratio:1;height:auto;"></div>\n';
  html += '</div>\n';

  html += '<h1 style="font-size:' + tokens.typography.sizes.coverTitle.template + ';font-weight:bold;color:' + textColor + ';margin-bottom:16px;max-width:80%;">' + esc(slide.title) + '</h1>\n';

  if (slide.subtitle) {
    html += '<p style="font-size:' + tokens.typography.sizes.subtitle.template + ';color:' + subTextColor + ';margin-bottom:32px;">' + esc(slide.subtitle) + '</p>\n';
  }

  html += '<div style="width:60px;height:4px;background:' + lineColor + ';margin-bottom:32px;"></div>\n';
  html += '<div style="font-size:' + tokens.typography.sizes.body.template + ';color:' + metaColor + ';line-height:1.8;">\n';

  if (slide.presenter) { html += '<span>' + esc(slide.presenter) + '</span>'; }
  if (slide.department) { html += '<span style="margin-left:16px;">' + esc(slide.department) + '</span>'; }
  if (slide.date) { html += '<span style="margin-left:16px;">' + esc(slide.date) + '</span>'; }
  html += '</div>\n';

  html += '<div style="position:absolute;bottom:6%;left:6%;font-size:' + tokens.typography.sizes.caption.template + ';color:' + footColor + ';">\n';
  html += esc(pages.companyName || '二六三网络通信股份有限公司') + '\n';
  html += '</div>\n';

  html += '</div>\n</div>\n';
  return html;
}

function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
module.exports = renderSlide;
