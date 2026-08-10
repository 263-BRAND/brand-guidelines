# Task 3: 创建 design-skill-recommendations.json

## Requirements

创建 `design-skill-recommendations.json` — 平台→推荐设计 skill 的映射配置文件。

## Exact File Content (use verbatim)

```json
{
  "claude-code": {
    "skills": [],
    "fallbackMessage": "建议安装 ui-ux-pro-max 或 frontend-design skill 以获得专业排版效果。安装后重新运行即可自动调用。"
  },
  "codex": {
    "skills": [],
    "fallbackMessage": "建议安装 PPT 制作相关 skill。"
  },
  "trae": {
    "skills": [],
    "fallbackMessage": "建议安装 PPT 制作相关 skill。"
  },
  "web": {
    "skills": [],
    "fallbackMessage": "当前使用内置基础模板。如需专业设计效果，建议使用 Claude Code / Codex / Trae 等桌面工具并安装设计类 skill。"
  }
}
```

## Steps

1. Write the file to `design-skill-recommendations.json`
2. Verify JSON is valid: `node -e "JSON.parse(require('fs').readFileSync('design-skill-recommendations.json','utf-8'))" && echo "OK"`
3. Commit

## Verification

- File exists at `design-skill-recommendations.json`
- Valid JSON
- 4 platform entries: claude-code, codex, trae, web
- Each has `skills` array and `fallbackMessage` string
