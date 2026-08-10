# Task 9: 更新 PROJECT-STATUS.md

## Changes Required

Update `PROJECT-STATUS.md` to reflect the VI skill refactoring.

### Change 1: Replace "核心思路" paragraph

Find:
```
**"只约束 VI，不限制布局。"** — 这是一套 agent 可读的 VI 设计系统，不是固定页面模板。Agent 负责内容策划和页面类型组合，VI 系统保证视觉一致性。
```

Replace with:
```
**"品牌数据层，不是渲染引擎。"** — VI skill 是 263 品牌数据的唯一真相源。内容策划交给 LLM，排版渲染交给设计 skill。VI skill 只输出 brand-tokens.json + company-data.json。
```

### Change 2: Replace "三条路径" diagram

Replace the existing ASCII diagram with:

```
用户需求
├── 有设计 skill → VI skill 输出品牌数据 → 设计 skill 专业排版
└── 无设计 skill → VI skill 输出品牌数据 → 兜底渲染器生成 HTML + 升级建议
```

### Change 3: Add new entries to "已完成" table

Under the "基础设施" table, add:

```markdown
| `brand-tokens.json` | 品牌视觉规范（替代 vi-tokens.json） | ✓ |
| `company-data.json` | 公司信息（合并 company-data/） | ✓ |
| `design-skill-recommendations.json` | 平台设计 skill 推荐 | ✓ |
| `skills/263-vi.md` | Claude Code VI skill 文件 | ✓ |
```

### Change 4: Update "待继续" table

Remove these items from "路径 A 渲染器需要改进":
- "排版不够专业 — 当前生成的内页过于简陋..."
- "缺少布局变体..."
- "cards 卡片视觉效果弱..."
- "timeline 缺少视觉层次..."

Remove these items from "路径 B VI 应用器需要打磨":
- All items

Remove from "功能扩展":
- "路径 B 正式命名和文档..."
- "两路径统一入口..."
- "12 种页面类型扩展到全部"

Remove from Phase 2:
- "扩展到全部 12 种页面类型..."

Add to top of "待继续":
```markdown
- [ ] **补全设计 skill 推荐列表** — 调研 Codex / Trae 平台可用的设计 skill，填入 design-skill-recommendations.json
- [ ] **设计 skill 调研** — 确认各平台最适合的 PPT/设计 skill
```

Do not change any other sections. Commit when done.
