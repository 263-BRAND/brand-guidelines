#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
brand-check-html.py — 263 品牌合规检查（HTML 生成后闸门，Phase 2 新增）

Usage:
    python brand-check-html.py <file.html> [--scheme group-red] [--external]

检查产出 HTML 是否遵守品牌规范（SKILL.md「改写功能 → 验收 / 校验」）：
  1. 颜色白名单：提取 HTML 全部颜色（style 属性 + <style> 块 + SVG fill/stroke/stop-color），
     归一化为小写 hex，对照白名单（colorSchemes[scheme] 9 色 + semantic + chartPalette series/muted）。
     非白名单 → 违规。
  2. 对外禁微软雅黑（--external）：font-family 声明含 微软雅黑 / Microsoft YaHei → 违规。
  3. 图片内嵌：品牌图片（logo-color-img / logo-white-img / slogan-img / red-template-bg /
     themed-fallback-bg）必须是 base64 data URI，外部路径 → 违规。
  4. 结尾页最后：若可识别 .slide-page，最后一个必须含 .slogan-img（VI 标准结尾页）。

honest boundary：红底文字=白的几何相交判定 HTML 侧不做（HTML 布局流式、几何判定不可靠，
同 brand-check-pptx.py 的 §9.2 说明），靠颜色白名单 + SKILL.md 自查清单兜底。

exit 0 = 通过；exit 1 = 违规（fail-loud）。无 python 依赖（纯标准库正则）。
"""

import argparse
import sys
import os
import re

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

META_KEYS = {'note'}

# CSS 命名色映射（常见值；其余未知命名色返回原串 → 判违规）
NAMED_COLORS = {
    'white': '#ffffff', 'black': '#000000', 'gray': '#808080', 'grey': '#808080',
    'silver': '#c0c0c0', 'red': '#ff0000',
}

# 颜色出现的属性（background 简写可含图片 url，无颜色 token 时自然跳过）
COLOR_PROPS = {
    'color', 'background', 'background-color', 'background-image',
    'border-color', 'outline-color', 'fill', 'stroke', 'stop-color',
}

def load_tokens():
    """从脚本所在目录读取 brand-tokens.json（zip 自包含：脚本与 token 同目录）。"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    for base in (script_dir, os.getcwd()):
        p = os.path.join(base, 'brand-tokens.json')
        if os.path.exists(p):
            import json
            with open(p, 'r', encoding='utf-8') as f:
                return json.load(f)
    sys.exit('brand-check-html.py: 未找到 brand-tokens.json（需与脚本同目录或当前目录）。')

def build_whitelist(tokens, scheme):
    """与 generate.js buildColorWhitelist / brand-check-pptx.py 同构的白名单构建。"""
    ws = {}
    def add(v):
        if isinstance(v, str) and len(v) == 7 and v[0] == '#' and all(c in '0123456789abcdefABCDEF' for c in v[1:]):
            ws[v.lower()] = 1
    cs = tokens.get('colorSchemes', {}).get(scheme)
    if not cs:
        sys.exit('brand-check-html.py: 无效 scheme "%s"（brand-tokens.json 无该配色）。' % scheme)
    for k, v in cs.items():
        if k in META_KEYS:
            continue
        if isinstance(v, dict):  # semantic 子容器
            for sk, sv in v.items():
                if sk in META_KEYS:
                    continue
                add(sv)
        else:
            add(v)
    cp = tokens.get('chartPalette', {}).get(scheme)
    if cp:
        for seg in ('series', 'muted'):
            for item in cp.get(seg, []):
                if isinstance(item, dict):
                    add(item.get('hex'))
    return ws

def normalize_color(s):
    """颜色串 → 小写 hex。透明（rgba/hsla alpha=0、transparent）→ None 跳过；
    无法归一化（未知命名色/畸形）→ 返回原串（会判违规）。"""
    s = s.strip().lower()
    m = re.fullmatch(r'#([0-9a-f]{3,8})', s)
    if m:
        h = m.group(1)
        if len(h) in (3, 4):
            h = ''.join(c * 2 for c in h[:3])
        else:
            h = h[:6]
        return '#' + h
    m = re.fullmatch(r'rgba?\(\s*([\d.]+%?)\s*,\s*([\d.]+%?)\s*,\s*([\d.]+%?)\s*(?:,\s*([\d.]+)\s*)?\)', s)
    if m:
        a = m.group(4)
        if a is not None and float(a) == 0:
            return None
        def conv(x):
            return round(float(x[:-1]) * 2.55) if x.endswith('%') else int(float(x))
        return '#%02x%02x%02x' % (conv(m.group(1)), conv(m.group(2)), conv(m.group(3)))
    m = re.fullmatch(r'hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*(?:,\s*([\d.]+)\s*)?\)', s)
    if m:
        a = m.group(4)
        if a is not None and float(a) == 0:
            return None
        h = float(m.group(1)); s_ = float(m.group(2)) / 100; l_ = float(m.group(3)) / 100
        c = (1 - abs(2 * l_ - 1)) * s_
        x = c * (1 - abs((h / 60) % 2 - 1))
        m2 = l_ - c / 2
        if h < 60: r, g, b = c, x, 0
        elif h < 120: r, g, b = x, c, 0
        elif h < 180: r, g, b = 0, c, x
        elif h < 240: r, g, b = 0, x, c
        elif h < 300: r, g, b = x, 0, c
        else: r, g, b = c, 0, x
        return '#%02x%02x%02x' % (round((r + m2) * 255), round((g + m2) * 255), round((b + m2) * 255))
    if s in NAMED_COLORS:
        return NAMED_COLORS[s]
    return s  # 无法归一化 → 判违规

# 颜色 token：hex / rgb() / rgba() / hsl() / hsla() / 常见命名色
COLOR_TOKEN = re.compile(r'(?:#[0-9a-f]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\)|\b(?:white|black|gray|grey|silver|red)\b)', re.I)
DECL = re.compile(r'([a-zA-Z-]+)\s*:\s*([^;]+)')
STYLE_ATTR = re.compile(r'style\s*=\s*"([^"]*)"', re.I)
STYLE_BLOCK = re.compile(r'<style[^>]*>(.*?)</style>', re.I | re.S)
SVG_ATTR = re.compile(r'(?:fill|stroke|stop-color)\s*=\s*"([^"]*)"', re.I)
FONT_FAMILY = re.compile(r'font-family\s*:\s*([^;}]+)', re.I)
IMG_CLASS = re.compile(r'class="([^"]*)"')
BG_URL = re.compile(r'background(?:\s*-\s*image)?\s*:\s*[^;]*url\(\s*(["\']?)([^"\')\s]+)\1\s*\)', re.I)
SLIDE_PAGE = re.compile(r'<div[^>]*class="[^"]*\bslide-page\b[^"]*"', re.I)

def extract_colors(html):
    """返回 [(hex_or_original, lineno, snippet)]——所有出现在颜色属性值里的颜色。
    覆盖：style 属性 + <style> 块（含 CSS 自定义属性 --* 定义）+ SVG fill/stroke/stop-color。"""
    out = []
    lines = html.split('\n')
    def scan_decls(content, lineno):
        for dm in DECL.finditer(content):
            prop = dm.group(1).strip().lower()
            # 颜色属性 + CSS 自定义属性（--primary 等：改动其值即改变输出颜色，须查）
            if prop in COLOR_PROPS or prop.startswith('--'):
                for tok in COLOR_TOKEN.findall(dm.group(2)):
                    norm = normalize_color(tok)
                    if norm is not None:
                        out.append((norm, lineno, tok))
    for lineno, line in enumerate(lines, 1):
        for m in STYLE_ATTR.finditer(line):
            scan_decls(m.group(1), lineno)
        for m in SVG_ATTR.finditer(line):
            norm = normalize_color(m.group(1))
            if norm is not None:
                out.append((norm, lineno, m.group(1)))
    for bm in STYLE_BLOCK.finditer(html):
        base_lineno = html[:bm.start()].count('\n') + 1
        scan_decls(bm.group(1), base_lineno)
    return out

def check_whitelist(html, whitelist):
    errs = []
    for color, lineno, orig in extract_colors(html):
        if color not in whitelist:
            errs.append('第 %d 行：颜色 %s 不在品牌色板白名单内（SKILL.md「品牌规则 → 色彩」）。' % (lineno, orig))
    return errs

def check_font_external(html):
    errs = []
    for m in STYLE_ATTR.finditer(html):
        val = m.group(1)
        if FONT_FAMILY.search(val) and re.search(r'微软雅黑|Microsoft\s*YaHei|microsoftyahei', val, re.I):
            errs.append('style 属性含微软雅黑（闭源），对外展示必须用开源栈 Noto Sans SC/Source Han Sans SC。')
    for bm in STYLE_BLOCK.finditer(html):
        block = bm.group(1)
        if re.search(r'font-family\s*:\s*[^;}]*?(微软雅黑|Microsoft\s*YaHei|microsoftyahei)', block, re.I):
            errs.append('<style> 块含微软雅黑（闭源），对外展示必须用开源栈 Noto Sans SC/Source Han Sans SC。')
    return errs

BRAND_IMG_CLASSES = ('logo-color-img', 'logo-white-img', 'slogan-img', 'red-template-bg', 'themed-fallback-bg')
CSS_RULE = re.compile(r'\.([a-zA-Z0-9_-]+)\s*\{([^}]*)\}')

def check_images_embedded(html):
    """品牌图片 class（<style> 块规则或内联 style）必须 data:image/ 内嵌；外部路径 → 违规。"""
    errs = []
    # <style> 块内 .brand-img-class { background: url(...) } 规则
    class_bg = {}
    for bm in STYLE_BLOCK.finditer(html):
        for cm in CSS_RULE.finditer(bm.group(1)):
            um = BG_URL.search(cm.group(2))
            if um:
                class_bg[cm.group(1)] = um.group(2)
    for cls in BRAND_IMG_CLASSES:
        if cls in class_bg and not class_bg[cls].startswith('data:image/'):
            errs.append('品牌图片 class "%s" 背景为外部路径（%s...），必须内嵌 base64 data URI。' % (cls, class_bg[cls][:40]))
    # 内联 style 中的品牌图片元素（外部背景）
    lines = html.split('\n')
    for lineno, line in enumerate(lines, 1):
        for m in IMG_CLASS.finditer(line):
            classes = m.group(1).split()
            if not any(c in BRAND_IMG_CLASSES for c in classes):
                continue
            um = BG_URL.search(line)
            if um and not um.group(2).startswith('data:image/'):
                errs.append('第 %d 行：品牌图片元素（class=%s）背景为外部路径（%s...），必须内嵌 base64 data URI。' % (lineno, ','.join(c for c in classes if c in BRAND_IMG_CLASSES), um.group(2)[:40]))
    return errs

def check_end_last(html):
    positions = [m.start() for m in SLIDE_PAGE.finditer(html)]
    if not positions:
        return []  # 非 generate.js 产物，跳过结尾页检查
    last = html[positions[-1]:]
    if 'slogan-img' not in last:
        return ['结尾页（最后一个 .slide-page）缺少 .slogan-img——VI 标准结尾页必须居中 Logo + slogan PNG。']
    return []

def main():
    ap = argparse.ArgumentParser(description='263 品牌合规检查（HTML 生成后闸门）')
    ap.add_argument('file', help='要检查的 .html 文件')
    ap.add_argument('--scheme', default='group-red', help='配色方案（brand-tokens.json colorSchemes 键），默认 group-red')
    ap.add_argument('--external', action='store_true', help='对外展示：额外检查全文件不含微软雅黑')
    args = ap.parse_args()

    if not os.path.exists(args.file):
        sys.exit('brand-check-html.py: 文件不存在：%s' % args.file)
    if not args.file.lower().endswith(('.html', '.htm')):
        sys.exit('brand-check-html.py: 仅支持 .html（文件：%s）' % args.file)

    tokens = load_tokens()
    whitelist = build_whitelist(tokens, args.scheme)
    if not whitelist:
        sys.exit('brand-check-html.py: 白名单为空——brand-tokens.json %s 无色值可查。' % args.scheme)

    with open(args.file, 'r', encoding='utf-8', errors='replace') as f:
        html = f.read()

    errors = []
    errors += check_whitelist(html, whitelist)
    if args.external:
        errors += check_font_external(html)
    errors += check_images_embedded(html)
    errors += check_end_last(html)

    if errors:
        print('品牌合规检查未通过（%s）：' % os.path.basename(args.file))
        for e in errors:
            print('  %s' % e)
        print('按 SKILL.md「改写功能 → 验收 / 校验」修复后重跑；不要带病交付。')
        sys.exit(1)
    print('品牌合规检查通过：%s' % os.path.basename(args.file))
    sys.exit(0)

if __name__ == '__main__':
    main()
