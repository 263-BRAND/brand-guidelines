# PPTX Python 实现要点（pptx-python-guide.md）

> **只读条件**：仅当「用户坚持用代码生成 PPT 文件」（生成前确认 → 用户话术 → 3b：用户坚持代码生成）时才读取本文件，并按其中要点实现。使用 PPT 设计技能或网页文件的路径**不读**本文件。
> **API 说明**：以下写法基于 python-pptx。若与你所用库的版本不一致，以官方文档为准——本附录只把 SKILL.md 的规范翻译成常见实现，**数值与规则一律以 SKILL.md 为准**，本文件不新增规则。

## 1. 画布 960×540pt

960×540pt = 13.333×7.5 英寸（PowerPoint 16:9）：

```python
from pptx import Presentation
from pptx.util import Inches, Pt

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
blank = prs.slide_layouts[6]  # blank 布局
```

## 2. 行距（倍距）

- 标题 **单倍**，其余（正文/卡片/时间轴/章节副标题/目录条目/**章节页大号数字**）**1.2 倍**（数值表见 SKILL.md「行距」）。

```python
p.line_spacing = 1.0   # 标题
p.line_spacing = 1.2   # 正文/卡片/时间轴/章节副标题/目录条目
```

> `line_spacing` 传 float 即倍距（多倍行距）。**必须显式设置**——漏掉会退回默认行距，页面显得拥挤。

## 3. 中文字体：微软雅黑（eastAsia）

`run.font.name` 只设置拉丁字体；中文需同时设置 eastAsia，否则微软雅黑不生效（可能回退系统默认）：

```python
from pptx.oxml.ns import qn

def set_cn_font(run, name='微软雅黑'):
    run.font.name = name                       # a:latin
    rPr = run._r.get_or_add_rPr()
    for tag in ('a:ea', 'a:cs'):               # 中文字体 + 复杂文种
        el = rPr.find(qn(tag))
        if el is None:
            el = rPr.makeelement(qn(tag), {})
            rPr.append(el)
        el.set('typeface', name)
```

> 对每段文本的每个 run 都要调用；只设 `font.name` 时中文段落在无微软雅黑环境或库版本差异下易丢失字体。

## 4. 图片等比缩放（禁止变形）

- **Logo**：只设单维度，另一维自动按原图比例；正方形 Logo 用宽=高：
  - 内页右上角 40pt：`add_picture(logo, left, top, width=Pt(40), height=Pt(40))`
  - 封面左上角 62pt：`add_picture(logo, left, top, width=Pt(62), height=Pt(62))`
  - 结尾居中 178pt：`add_picture(logo, left, top, width=Pt(178), height=Pt(178))`
- **Slogan**：只设宽度（480pt），不设高度：
  - `add_picture(slogan, left, top, width=Pt(480))`
- `add_picture` 只传宽（或只传高）时，另一维自动按原图比例——**禁止同时传两个不成比例的宽高值**。
- **slogan 原生像素尺寸 1360×144（宽高比 9.44:1），从 `brand-tokens.json` → `slogan` 读取。** 若所用库必须显式传宽高两个值，高度 = 宽度 ÷ 9.44（如宽度 480 → 高度 ≈ 51）。**禁止写死比例不符的高度**（如 640×120：渲染引擎按裁切填满处理，slogan 文字被切掉两头）。

```python
from pptx.util import Pt
# 正确：正方形 Logo 宽高同值
s.shapes.add_picture(logo_path, left, top, width=Pt(40), height=Pt(40))
# 正确：Slogan 只设宽
s.shapes.add_picture(slogan_path, left, top, width=Pt(480))
```

## 5. 文字框透明背景（封面叠加）

封面文字框必须透明，禁止白色块遮挡底图。`add_textbox` 默认无填充；若用了有填充的形状，显式清除：

```python
shape.fill.background()   # 无填充
```

## 6. 封面底图（template-cover-bg / cover-red-template / cover-themed-fallback）

python-pptx 无「幻灯片背景图片」API，用全页图片铺底 + 文字框后叠加：

```python
s.shapes.add_picture(bg_path, 0, 0, prs.slide_width, prs.slide_height)
# 之后再 add_textbox / add_picture(logo) 叠加
```

> 顺序必须是：底图 → 文字（后加的在上面）。

- **对外展示兜底封面（cover-themed-fallback，浅底，Themed 封面默认）**：同法铺全幻灯片背景（内嵌二进制）+ 深色文字框叠加（透明 `FillVisible=false`）+ 左上彩稿 Logo（62pt 正方形，`LockAspectRatio=true`）。**封面 Logo 一律彩稿禁止反白**。**封面背景禁红色系（品牌红/色阶 s1-s7/primaryLight/primaryDark/accent 及其渐变）与 `dark-solid`（深底会反白 Logo）——Themed 封面合法背景仅兜底图或 white**。字号用 PPTX 列：封面标题 43pt、副标题 20pt、汇报信息 18pt、公司全称 14pt。仅加载 263group-brand-guidelines（无设计技能）时，Themed 封面默认用此图。

## 6.5 个性化封面文字叠加（template-cover-bg，写死坐标）

工作汇报·个性化封面（Template·ASCII）背景图 `assets/template-cover-bg.png` 铺底后，文字框**全宽（left=0, width=960）+ 水平居中 + 垂直居中**，坐标写死（数值见 SKILL.md「PPTX Template 封面回退」，经用户验收截图校准）：

```python
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.dml.color import RGBColor
from pptx.oxml.ns import qn

def _font(run, size, bold, color, name="微软雅黑"):
    """设置 run 字体：字号/粗体/颜色 + eastAsia 中文字体"""
    run.font.name = name                       # a:latin
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = color
    rPr = run._r.get_or_add_rPr()              # eastAsia 中文字体
    for tag in ("a:ea", "a:cs"):
        el = rPr.find(qn(tag))
        if el is None:
            el = rPr.makeelement(qn(tag), {})
            rPr.append(el)
        el.set("typeface", name)
    return run

def add_cover_center_text(slide, top, height, text, size, bold, color, no_wrap=False, line_spacing=1.2):
    """封面单色居中文字框（主标题/副标题/公司全称）"""
    tb = slide.shapes.add_textbox(Pt(0), Pt(top), Pt(960), Pt(height))  # 全宽框，禁止算宽度
    tb.fill.background()                       # 透明背景，禁止填充
    tf = tb.text_frame
    tf.word_wrap = not no_wrap                 # 主标题传 no_wrap=True → 不可折行
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE     # 垂直居中
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER              # 水平居中 → 文字中心恒为画布 50%
    p.line_spacing = line_spacing              # 主标题 1.0（单倍），其余 1.2 倍
    run = p.add_run(); run.text = text
    _font(run, size, bold, RGBColor(int(color[1:3],16), int(color[3:5],16), int(color[5:7],16)))
    return tb

def add_cover_meta(slide, top, height, parts, size=18):
    """汇报人·部门·日期 — 独立一行，品牌红圆点·分隔；parts 由 slide 字段组装，禁止写死文案"""
    tb = slide.shapes.add_textbox(Pt(0), Pt(top), Pt(960), Pt(height))
    tb.fill.background()
    tf = tb.text_frame
    tf.word_wrap = False
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    p.line_spacing = 1.2
    for i, part in enumerate(parts):
        if i > 0:
            dot = p.add_run(); dot.text = " · "
            _font(dot, size, False, RGBColor(0xD0, 0x12, 0x1B))     # 品牌红圆点
        run = p.add_run(); run.text = part
        _font(run, size, False, RGBColor(0x59, 0x59, 0x59))         # 品牌 gray
    return tb

# 底图铺完后叠加（顺序：底图 → 文字）：
add_cover_center_text(slide, 277, 44, title, 43, True, "#2D3847", no_wrap=True, line_spacing=1.0)  # 主标题（不可折行，55.4%）
if subtitle:                                   # 副标题有 → 独立一行 64.5%，汇报人下移一行
    add_cover_center_text(slide, 337, 22, subtitle, 20, False, "#595959")            # 副标题 20pt（比文字信息略大）
    reporter_top = 359
else:                                          # 副标题空 → 汇报人落 64.5%
    reporter_top = 337
meta_parts = []                                # 从 pages.json cover 字段读取，禁止写死文案
if presenter: meta_parts.append("汇报人：" + presenter)
if department: meta_parts.append(department)
if date: meta_parts.append(date)
if meta_parts:
    add_cover_meta(slide, reporter_top, 22, meta_parts)             # 汇报人·部门·日期（红点·分隔）
add_cover_center_text(slide, 449, 14, company, 14, False, "#595959")  # 公司全称（84.5%）
```

> 坐标**禁止自行调整**：主标题 277 / 副标题 337 / 汇报人 359 / 公司全称 449（视觉中心分别 55.4%/64.5%/68.5%/84.5%）。副标题为空时汇报人行落 `top=Pt(337)`。行距：副标题→汇报人 22pt 行单位；行内行距主标题单倍、其余 1.2 倍。汇报人行底 ≈381pt，公司名顶 449pt，间距 68pt，禁止重叠。主标题禁止 `\n` 手动分行（固定 44pt 单行框）。**汇报人·部门·日期行必须品牌红圆点（·）分隔、内容从 cover 字段读取，禁止灰色占位文案。**

## 7. 字号

从 SKILL.md 字号表取 PPTX 列数值（如封面标题 43、正文 18），写 `Pt(n)`：

```python
p.font.size = Pt(43)
```

## 8. 坐标换算

- 百分比 → pt：横向 `960 × pct%`，纵向 `540 × pct%`（如 `left:7%` = `Pt(67.2)`）。
- 用 `Pt()` 直接传 pt，或 `Inches(pt / 72)`。
- 封面文字块垂直居中：`top = Pt((540 − totalH) / 2)`，totalH 为文字块总高。

## 9. 品牌校验（PPTX 生成后闸门）

PPTX 由 agent 直接产出，没有 generate.js 那样的机器闸门——品牌规范是声明式。校验分两条路径，强度不同：

### 9.1 3b 代码生成路径：交付断言（硬，嵌进生成脚本）

**用户坚持代码生成 PPT（3b）时，`brand-check-pptx.py` 不是可选步骤，而是生成脚本的交付断言**——生成脚本末尾必须调用它，校验不通过 → `sys.exit(1)` → 不产出 .pptx。这样"生成"动作本身就包含"验证"，agent 照着本文件写代码时检查就是产出的一部分，无法事后跳过：

```python
import subprocess, sys, os

def brand_check(out_file, external=False):
    """交付断言：品牌校验不通过 → 返回 False（调用方必须退出）。"""
    here = os.path.dirname(os.path.abspath(__file__))
    cmd = [sys.executable, os.path.join(here, 'brand-check-pptx.py'), out_file,
           '--scheme', 'group-red']          # 通信蓝 → 'business-blue'（暂不可选）
    if external:
        cmd.append('--external')             # 对外展示：额外禁微软雅黑
    return subprocess.run(cmd).returncode == 0

# 生成 .pptx 完成后、交付前（必须写，不通过不产出）：
if not brand_check(out_file, external=True):   # 对外展示 external=True / 工作汇报 False
    sys.exit(1)                                # 校验不通过 → 不交付，修复后重跑
```

- 脚本路径约定：`brand-check-pptx.py` 与生成脚本**同目录**（zip 解压后即同目录）。若生成脚本放在临时位置，用绝对路径指向解压目录中的脚本。
- `--scheme` 与产出所用配色一致（默认 `group-red`；通信蓝 `business-blue` **暂不可选**）。
- **python 可用性分支**：本机无 python-pptx 时**禁止降级约束**——生成脚本改为按 SKILL.md「PPTX 生成后自查」清单人工逐条核对（agent 自查），一条不少，通过后才交付。脚本是可选的机器兜底，不是约束的来源（约束唯一真相源 = SKILL.md）。

### 9.2 设计技能产出路径：可选检具 + 清单（无机器强制）

**设计技能/agent 直接产出 .pptx 时**，产出方式在本文件控制之外——无法把校验嵌进它的生成动作，只能退化为"可选检具 + 人工清单"：

```bash
python brand-check-pptx.py 产出.pptx --scheme group-red          # 工作汇报（内部，不查字体）
python brand-check-pptx.py 产出.pptx --scheme group-red --external  # 对外展示（额外禁微软雅黑）
```

脚本检查：颜色全部来自色板白名单（colorSchemes + semantic + chartPalette，无自造 hex）/ 红底场景文字=白（未用 accent 浅粉或浅档）/ 结尾页必须最后（居中 Logo+slogan 图、无「感谢」残留）/ 图片内嵌二进制（无外部链接）/ `--external` 时全文件禁微软雅黑。违规 → exit 1 fail-loud。

> **强制边界（诚实标注）**：此路径**没有机器强制**——设计技能可以完全不读本文件/不运行脚本。可用性排序：有 python-pptx → 运行脚本（机器校验）；无 python-pptx → 按 SKILL.md「PPTX 生成后自查」清单人工逐条核对。无论哪条，最终交付前必须核对清单一条不少。
