# PPTX Python 实现要点（pptx-python-guide.md）

> **只读条件**：仅当「用户坚持用代码生成 PPT 文件」（生成前确认 → 用户话术 → 4b：用户坚持代码生成）时才读取本文件，并按其中要点实现。使用 PPT 设计技能或网页文件的路径**不读**本文件。
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

## 6. 封面底图（template-cover-bg / cover-red-template）

python-pptx 无「幻灯片背景图片」API，用全页图片铺底 + 文字框后叠加：

```python
s.shapes.add_picture(bg_path, 0, 0, prs.slide_width, prs.slide_height)
# 之后再 add_textbox / add_picture(logo) 叠加
```

> 顺序必须是：底图 → 文字（后加的在上面）。

## 7. 字号

从 SKILL.md 字号表取 PPTX 列数值（如封面标题 43、正文 18），写 `Pt(n)`：

```python
p.font.size = Pt(43)
```

## 8. 坐标换算

- 百分比 → pt：横向 `960 × pct%`，纵向 `540 × pct%`（如 `left:7%` = `Pt(67.2)`）。
- 用 `Pt()` 直接传 pt，或 `Inches(pt / 72)`。
- 封面文字块垂直居中：`top = Pt((540 − totalH) / 2)`，totalH 为文字块总高。
