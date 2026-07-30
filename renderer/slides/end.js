// renderer/slides/end.js
function renderSlide(slide, tokens, pages, index) {
  const c = tokens.colorSchemes[pages.colorScheme];
  var isLight = slide.background === 'light';
  var bgStyle = isLight ? c.white : 'linear-gradient(135deg, ' + c.primary + ' 0%, ' + c.primaryDark + ' 100%)';
  var textColor = isLight ? c.dark : c.white;
  var subColor = isLight ? c.gray : 'rgba(255,255,255,0.7)';

  var html = '<div class="slide-page" id="s' + index + '" style="background:' + bgStyle + '; position:relative;">\n';
  html += '<div style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;">\n';
  html += '<h1 style="font-size:' + tokens.typography.sizes.coverTitle + ';font-weight:bold;color:' + textColor + ';margin-bottom:16px;">' + esc(slide.text || '感谢聆听') + '</h1>\n';
  html += '<div style="width:60px;height:3px;background:' + c.primary + ';margin-bottom:24px;"></div>\n';
  html += '<p style="font-size:' + tokens.typography.sizes.body + ';color:' + subColor + ';margin-bottom:8px;">' + esc(pages.companyName || '二六三网络通信股份有限公司') + '</p>\n';
  html += '<p style="font-size:' + tokens.typography.sizes.caption + ';color:' + subColor + ';">股票代码：002467</p>\n';
  html += '</div>\n</div>\n';
  return html;
}

function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
module.exports = renderSlide;
