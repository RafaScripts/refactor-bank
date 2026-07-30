---
name: gortex-scripts-detector-checksourcedesignsystem
description: "Work in the scripts/detector · checkSourceDesignSystem area — 41 symbols across 2 files (92% cohesion)"
---

# scripts/detector · checkSourceDesignSystem

41 symbols | 2 files | 92% cohesion

## When to Use

Use this skill when working on files in:
- `.github/skills/impeccable/scripts/detector/design-system.mjs`
- `.github/skills/impeccable/scripts/detector/findings.mjs`

## Key Files

| File | Symbols |
|------|---------|
| `.github/skills/impeccable/scripts/detector/design-system.mjs` | offRampClampEndpoints, isProbablyColorLiteral, primaryFont, addColorObject, colorsClose, ... |
| `.github/skills/impeccable/scripts/detector/findings.mjs` | finding, getAP |

## Entry Points

- `.github/skills/impeccable/scripts/detector/design-system.mjs::checkSourceDesignSystem`
- `.github/skills/impeccable/scripts/detector/design-system.mjs::collectStaticDesignSystemFindings`

## Connected Communities

- **scripts/detector · checkQuality** (3 cross-edges)
- **scripts/detector · addClampEndpoints** (2 cross-edges)
- **scripts/detector · parseAnyColor** (2 cross-edges)

## How to Explore

```
get_communities with id: "community-18"
smart_context with task: "understand scripts/detector · checkSourceDesignSystem", format: "gcx"
find_usages with id: ".github/skills/impeccable/scripts/detector/design-system.mjs::checkSourceDesignSystem", format: "gcx"
```

_`format: "gcx"` returns the [GCX1 compact wire format](../../docs/wire-format.md) — round-trippable, ~27% fewer tokens than JSON. Drop it for JSON output; agents using `@gortex/wire` or the Go `github.com/gortexhq/gcx-go` package decode either._
