---
name: gortex-scripts-live-createmanualeditroutes
description: "Work in the scripts/live · createManualEditRoutes area — 55 symbols across 3 files (99% cohesion)"
---

# scripts/live · createManualEditRoutes

55 symbols | 3 files | 99% cohesion

## When to Use

Use this skill when working on files in:
- `.github/skills/impeccable/scripts/live/manual-apply.mjs`
- `.github/skills/impeccable/scripts/live/manual-edit-routes.mjs`
- `.github/skills/impeccable/scripts/live/source-search.mjs`

## Key Files

| File | Symbols |
|------|---------|
| `.github/skills/impeccable/scripts/live/manual-apply.mjs` | createManualApplyController, validateManualApplyResultMessage, compactManualLogText, manualApplyEvidenceDir, markChunkEntriesFailed, ... |
| `.github/skills/impeccable/scripts/live/manual-edit-routes.mjs` | summarizePendingManualEditBatch, createManualEditRoutes, sendJson, currentEnv |
| `.github/skills/impeccable/scripts/live/source-search.mjs` | walk, findSourceFile |

## Entry Points

- `.github/skills/impeccable/scripts/live/manual-apply.mjs::createManualApplyController`
- `.github/skills/impeccable/scripts/live/manual-edit-routes.mjs::createManualEditRoutes`

## Connected Communities

- **scripts/live · validateEvent** (1 cross-edges)

## How to Explore

```
get_communities with id: "community-158"
smart_context with task: "understand scripts/live · createManualEditRoutes", format: "gcx"
find_usages with id: ".github/skills/impeccable/scripts/live/manual-apply.mjs::createManualApplyController", format: "gcx"
```

_`format: "gcx"` returns the [GCX1 compact wire format](../../docs/wire-format.md) — round-trippable, ~27% fewer tokens than JSON. Drop it for JSON output; agents using `@gortex/wire` or the Go `github.com/gortexhq/gcx-go` package decode either._
