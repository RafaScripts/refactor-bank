---
name: gortex-detector-rules-parseanycolor
description: "Work in the detector/rules · parseAnyColor area — 45 symbols across 1 files (85% cohesion)"
---

# detector/rules · parseAnyColor

45 symbols | 1 files | 85% cohesion

## When to Use

Use this skill when working on files in:
- `.github/skills/impeccable/scripts/detector/rules/checks.mjs`

## Key Files

| File | Symbols |
|------|---------|
| `.github/skills/impeccable/scripts/detector/rules/checks.mjs` | isPaintedForOcclusion, elementDirectText, splitTopLevelCommas, isFloated, isOpaqueDecoratedBox, ... |

## Entry Points

- `.github/skills/impeccable/scripts/detector/rules/checks.mjs::checkTextOcclusionDOM`

## Connected Communities

- **detector/rules · resolveBackground** (2 cross-edges)
- **detector/rules · checkQuality** (1 cross-edges)
- **detector/rules · checkElementIconTile** (1 cross-edges)

## How to Explore

```
get_communities with id: "community-71"
smart_context with task: "understand detector/rules · parseAnyColor", format: "gcx"
find_usages with id: ".github/skills/impeccable/scripts/detector/rules/checks.mjs::checkTextOcclusionDOM", format: "gcx"
```

_`format: "gcx"` returns the [GCX1 compact wire format](../../docs/wire-format.md) — round-trippable, ~27% fewer tokens than JSON. Drop it for JSON output; agents using `@gortex/wire` or the Go `github.com/gortexhq/gcx-go` package decode either._
