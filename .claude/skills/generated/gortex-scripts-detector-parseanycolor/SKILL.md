---
name: gortex-scripts-detector-parseanycolor
description: "Work in the scripts/detector · parseAnyColor area — 43 symbols across 2 files (78% cohesion)"
---

# scripts/detector · parseAnyColor

43 symbols | 2 files | 78% cohesion

## When to Use

Use this skill when working on files in:
- `.github/skills/impeccable/scripts/detector/design-system.mjs`
- `.github/skills/impeccable/scripts/detector/detect-antipatterns-browser.js`

## Key Files

| File | Symbols |
|------|---------|
| `.github/skills/impeccable/scripts/detector/design-system.mjs` | hue2rgb, hslToRgb |
| `.github/skills/impeccable/scripts/detector/detect-antipatterns-browser.js` | isFloated, mix, keyframesToggleVisibilityDOM, isScreenReaderOnlyTextStyle, enc, ... |

## Entry Points

- `.github/skills/impeccable/scripts/detector/detect-antipatterns-browser.js::checkTextOcclusionDOM`

## Connected Communities

- **scripts/detector · parseRgb** (5 cross-edges)
- **scripts/detector · checkQuality** (1 cross-edges)
- **scripts/detector · checkColors** (1 cross-edges)

## How to Explore

```
get_communities with id: "community-29"
smart_context with task: "understand scripts/detector · parseAnyColor", format: "gcx"
find_usages with id: ".github/skills/impeccable/scripts/detector/detect-antipatterns-browser.js::checkTextOcclusionDOM", format: "gcx"
```

_`format: "gcx"` returns the [GCX1 compact wire format](../../docs/wire-format.md) — round-trippable, ~27% fewer tokens than JSON. Drop it for JSON output; agents using `@gortex/wire` or the Go `github.com/gortexhq/gcx-go` package decode either._
