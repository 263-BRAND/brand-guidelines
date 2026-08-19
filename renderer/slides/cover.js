// renderer/slides/cover.js
function renderSlide(slide, tokens, pages, index, resolvedBg) {
  var c = tokens.colorSchemes[pages.colorScheme];
  var isTemplate = pages.scene === 'template' || slide.type === 'cover-template';

  if (isTemplate) {
    if (slide.background === 'red-template') {
      return renderRedTemplate(slide, tokens, pages, index, c);
    }
    return renderTemplate(slide, tokens, pages, index, c);
  }
  if (slide.background === 'themed-fallback') {
    return renderThemedFallback(slide, tokens, pages, index, c);
  }
  return renderThemed(slide, tokens, pages, index, c, resolvedBg);
}

// === Template cover: internal reporting — white bg, ASCII logo, binary rain, centered ===
function renderTemplate(slide, tokens, pages, index, c) {
  var bgStyle = '#FFFFFF';
  var html = '<div class="slide-page" id="s' + index + '" style="background:' + bgStyle + '; position:relative; overflow:hidden;">\n';

  // Binary rain canvas
  html += '<canvas id="binaryRain' + index + '" style="position:absolute;inset:0;z-index:0;opacity:0.18;"></canvas>\n';

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
      html += '<span class="ascii-line" data-dir="' + dir + '" style="display:block;opacity:0;transform:translateX(' + dir + ');transition:opacity 0.6s ease,transform 0.6s ease;">' + lines[i].substring(15) + '</span>\n';
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
  html += '<div style="position:absolute;top:82%;left:0;width:100%;text-align:center;font-size:' + tokens.typography.sizes.caption.template + ';color:' + c.gray + ';opacity:0.45;">\n';
  html += esc(pages.companyName || '二六三网络通信股份有限公司') + '\n';
  html += '</div>\n';

  html += '</div>\n';
  return html;
}

// === Red-template cover: internal reporting — bitmap bg, top-left heart logo, left-aligned centered text ===
function renderRedTemplate(slide, tokens, pages, index, c) {
  var html = '<div class="slide-page" id="s' + index + '" style="position:relative; overflow:hidden;">\n';

  // full-bleed bitmap background (base64 via .red-template-bg in generate.js)
  html += '<div class="red-template-bg" style="position:absolute;top:0;left:0;width:100%;height:100%;"></div>\n';

  // 集团红心 Logo — 左上角固定（= 集团彩稿 logo-color-img，与内页一致；位置/尺寸从 token 读取）
  html += coverLogoBlock(tokens, 'logo-color-img', 3);

  // 文字块 — 垂直居中（height:100% + flex 居中 → 内容中心 = 540px = 图片垂直中心）
  // max-width:50% 让标题宽度自适应可扩展到 50%（白区安全上限），不折行
  html += '<div style="position:absolute;top:0;left:7%;max-width:50%;height:100%;display:flex;flex-direction:column;justify-content:center;z-index:2;">\n';

  // 标题 — 不折行（white-space:nowrap），agent 以 \n 手动分行（≤20 字符/行），宽度随内容自适应
  // 间距：有副标题时标题→副标题 16px；无副标题时标题→汇报信息 32px（成组拉开）
  var titleLines = esc(slide.title).replace(/\n/g, '<br>');
  var titleMargin = slide.subtitle ? 16 : 32;
  html += '<h1 style="font-size:' + tokens.typography.sizes.coverTitle.template + ';font-weight:bold;color:' + c.dark + ';letter-spacing:2px;margin:0 0 ' + titleMargin + 'px 0;line-height:1.3;white-space:nowrap;">' + titleLines + '</h1>\n';

  // 副标题 — 独立一行，30pt，不加粗，在主标题下方（不与汇报人/部门同行）
  // 副标题→汇报信息间距(32px) > 标题→副标题间距(16px)，成组拉开
  if (slide.subtitle) {
    html += '<div style="font-size:' + tokens.typography.sizes.subtitle.template + ';color:' + c.gray + ';line-height:1.5;margin-bottom:32px;white-space:nowrap;">' + esc(slide.subtitle) + '</div>\n';
  }

  // meta（汇报人/部门/日期）— 单独一行，红色圆点分隔；字号小于副标题（副标题30pt > meta 26pt）
  if (slide.presenter || slide.department || slide.date) {
    var meta = [];
    if (slide.presenter) { meta.push('汇报人：' + esc(slide.presenter)); }
    if (slide.department) { meta.push(esc(slide.department)); }
    if (slide.date) { meta.push(esc(slide.date)); }
    html += '<div style="font-size:' + tokens.typography.sizes.body.template + ';color:' + c.gray + ';line-height:1.5;white-space:nowrap;">\n';
    for (var m = 0; m < meta.length; m++) {
      if (m > 0) { html += '<span style="color:' + c.primary + ';opacity:0.5;margin:0 12px;">·</span>'; }
      html += '<span>' + meta[m] + '</span>';
    }
    html += '</div>\n';
  }

  html += '</div>\n';

  // company name — bottom-left, on light-pink band (不动)
  html += '<div style="position:absolute;bottom:6%;left:7%;font-size:' + tokens.typography.sizes.caption.template + ';color:' + c.gray + ';z-index:2;">\n';
  html += esc(pages.companyName || '二六三网络通信股份有限公司') + '\n';
  html += '</div>\n';

  html += '</div>\n';
  return html;
}

// === Themed fallback cover: external presentation — 浅底位图 bg，彩稿 Logo（禁反白），左侧深色文字 ===
function renderThemedFallback(slide, tokens, pages, index, c) {
  var html = '<div class="slide-page" id="s' + index + '" style="position:relative; overflow:hidden;">\n';

  // full-bleed bitmap background（base64 via .themed-fallback-bg in generate.js）— 图无关，路径从 token 读
  html += '<div class="themed-fallback-bg" style="position:absolute;top:0;left:0;width:100%;height:100%;"></div>\n';

  // 封面 Logo — 一律彩稿 logo-color-img（禁止反白），浅底不切换反白
  html += coverLogoBlock(tokens, 'logo-color-img', 3);

  // 文字块 — 左侧垂直居中（left:7%，max-width:50%）；浅底 → 深色文字（dark/gray）
  html += '<div style="position:absolute;top:0;left:7%;max-width:50%;height:100%;display:flex;flex-direction:column;justify-content:center;z-index:2;">\n';

  // 标题 — 不折行（white-space:nowrap），agent 以 \n 手动分行（≤20 字符/行）
  var titleLines = esc(slide.title).replace(/\n/g, '<br>');
  var titleMargin = slide.subtitle ? 16 : 32;
  html += '<h1 style="font-size:' + tokens.typography.sizes.coverTitle.template + ';font-weight:bold;color:' + c.dark + ';letter-spacing:2px;margin:0 0 ' + titleMargin + 'px 0;line-height:1.3;white-space:nowrap;">' + titleLines + '</h1>\n';

  // 副标题 — 独立一行，30pt，不加粗
  if (slide.subtitle) {
    html += '<div style="font-size:' + tokens.typography.sizes.subtitle.template + ';color:' + c.gray + ';line-height:1.5;margin-bottom:32px;white-space:nowrap;">' + esc(slide.subtitle) + '</div>\n';
  }

  // meta（汇报人/部门/日期）— 单独一行，红色圆点分隔；字号小于副标题
  if (slide.presenter || slide.department || slide.date) {
    var meta = [];
    if (slide.presenter) { meta.push('汇报人：' + esc(slide.presenter)); }
    if (slide.department) { meta.push(esc(slide.department)); }
    if (slide.date) { meta.push(esc(slide.date)); }
    html += '<div style="font-size:' + tokens.typography.sizes.body.template + ';color:' + c.gray + ';line-height:1.5;white-space:nowrap;">\n';
    for (var m = 0; m < meta.length; m++) {
      if (m > 0) { html += '<span style="color:' + c.primary + ';opacity:0.5;margin:0 12px;">·</span>'; }
      html += '<span>' + meta[m] + '</span>';
    }
    html += '</div>\n';
  }

  html += '</div>\n';

  // company name — bottom:6%，浅底 gray
  html += '<div style="position:absolute;bottom:6%;left:7%;font-size:' + tokens.typography.sizes.caption.template + ';color:' + c.gray + ';z-index:2;">\n';
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
  var coverLogoLeft = cl.left;

  var html = '<div class="slide-page" id="s' + index + '" style="background:' + bgStyle + '; position:relative;">\n';
  html += '<div style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;padding-left:' + coverLogoLeft + ';">\n';

  // PNG Logo — top-left (shared helper, position+dims from token)
  html += coverLogoBlock(tokens, logoClass);

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

  html += '<div style="position:absolute;top:84%;left:6%;font-size:' + tokens.typography.sizes.caption.template + ';color:' + footColor + ';">\n';
  html += esc(pages.companyName || '二六三网络通信股份有限公司') + '\n';
  html += '</div>\n';

  html += '</div>\n</div>\n';
  return html;
}

// 封面左上角 Logo 块 — 位置/尺寸从 tokens.layout.coverLogo 读取（共享给 red-template 与 themed 封面）
function coverLogoBlock(tokens, logoClass, zIndex) {
  var cl = tokens.layout.coverLogo;
  var sizePct = parseFloat(cl.size) || 6.5;
  var px = Math.round(1920 * sizePct / 100);  // 6.5% → 125px 正方形
  var z = zIndex ? ';z-index:' + zIndex : '';
  return '<div style="position:absolute;top:' + cl.top + ';left:' + cl.left + ';width:' + px + 'px;height:' + px + 'px' + z + ';">\n' +
         '<div class="' + logoClass + '" style="width:100%;height:100%;"></div>\n' +
         '</div>\n';
}

function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
module.exports = renderSlide;
