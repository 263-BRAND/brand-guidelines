// renderer/slides/timeline.js
function renderSlide(slide, tokens, pages, index, resolvedBg) {
  const c = tokens.colorSchemes[pages.colorScheme];
  const l = tokens.layout.innerPageLogo;
  var bgKey = slide.background || 'white';
  var bgColor = resolvedBg.inner[bgKey] || resolvedBg.inner.white;
  var events = slide.events || [];

  var eventsHtml = '';
  for (var i = 0; i < events.length; i++) {
    var evt = events[i];
    eventsHtml += '<div style="display:flex;align-items:flex-start;margin-bottom:28px;overflow:hidden;">\n';
    eventsHtml += '<div style="flex:0 0 100px;text-align:right;padding-right:20px;">\n';
    eventsHtml += '<span style="font-size:' + tokens.typography.sizes.subtitle.template + ';font-weight:bold;color:' + c.primary + ';">' + esc(evt.year) + '</span>\n';
    eventsHtml += '</div>\n';
    eventsHtml += '<div style="width:12px;height:12px;background:' + c.primary + ';border-radius:50%;flex-shrink:0;margin-top:6px;z-index:1;"></div>\n';
    eventsHtml += '<div style="flex:1;padding-left:20px;">\n';
    eventsHtml += '<h3 style="font-size:' + tokens.typography.sizes.subtitle.template + ';color:' + c.dark + ';font-weight:bold;margin-bottom:4px;line-height:' + tokens.typography.lineHeight.html.heading + ';">' + esc(evt.title) + '</h3>\n';
    if (evt.description) { eventsHtml += '<p style="font-size:' + tokens.typography.sizes.body.template + ';color:' + c.gray + ';line-height:' + tokens.typography.lineHeight.html.timeline + ';">' + esc(evt.description) + '</p>\n'; }
    eventsHtml += '</div>\n</div>\n';
  }

  var html = '<div class="slide-page" id="s' + index + '" style="background:' + bgColor + '; overflow:hidden;">\n';

  html += '<div style="position:absolute;top:' + l.top + ';right:' + l.right + ';width:' + l.width + ';height:' + l.height + ';">\n';
  html += '<div class="logo-color-img" style="width:100%;height:100%;"></div>\n';
  html += '</div>\n';

  html += '<div style="position:absolute;top:12%;left:6%;right:6%;">\n';
  if (slide.sectionLabel) {
    html += '<div style="font-size:' + tokens.typography.sizes.caption.template + ';color:' + c.primary + ';letter-spacing:2px;margin-bottom:4px;">' + esc(slide.sectionLabel) + '</div>\n';
  }
  html += '<h2 style="font-size:' + tokens.typography.sizes.pageTitle.template + ';font-weight:bold;color:' + c.dark + ';line-height:' + tokens.typography.lineHeight.html.title + ';">' + esc(slide.title) + '</h2>\n';
  html += '</div>\n';

  html += '<div style="position:absolute;top:26%;left:15%;right:10%;bottom:8%;overflow-y:auto;">\n';
  html += '<div style="border-left:2px solid ' + c.lightGray + ';padding-left:0;">\n';
  html += eventsHtml;
  html += '</div>\n</div>\n';

  html += '<div style="position:absolute;bottom:3%;right:6%;font-size:' + tokens.typography.sizes.caption.template + ';color:' + c.gray + ';">' + (index + 1) + ' / ' + pages.slides.length + '</div>\n';

  html += '</div>\n';
  return html;
}

function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
module.exports = renderSlide;
