---
name: gortex-impeccable-scripts-runhook
description: "Work in the impeccable/scripts · runHook area — 59 symbols across 3 files (92% cohesion)"
---

# impeccable/scripts · runHook

59 symbols | 3 files | 92% cohesion

## When to Use

Use this skill when working on files in:
- `.github/skills/impeccable/scripts/hook-before-edit.mjs`
- `.github/skills/impeccable/scripts/hook-lib.mjs`
- `.github/skills/impeccable/scripts/hook.mjs`

## Key Files

| File | Symbols |
|------|---------|
| `.github/skills/impeccable/scripts/hook-before-edit.mjs` | findingSignature, cursorBlockMessage, deny, detectProposedHtml, main, ... |
| `.github/skills/impeccable/scripts/hook-lib.mjs` | renderPendingAck, clampToBudget, extractMotionIgnoreValue, formatFindingLine, cleanIgnoreValueDisplay, ... |
| `.github/skills/impeccable/scripts/hook.mjs` | isStopEvent, readStdin, main |

## Entry Points

- `.github/skills/impeccable/scripts/hook-lib.mjs::runHook`
- `.github/skills/impeccable/scripts/hook-before-edit.mjs::main`
- `.github/skills/impeccable/scripts/hook-lib.mjs::runStopHook`

## Connected Communities

- **impeccable/scripts · statusReport** (10 cross-edges)
- **impeccable/scripts · resolve** (8 cross-edges)
- **impeccable/scripts · add** (6 cross-edges)
- **impeccable/scripts · normalizeGitHubEvent** (2 cross-edges)
- **impeccable/scripts · proposedContent** (2 cross-edges)
- **impeccable/scripts · gitSignals** (1 cross-edges)
- **impeccable/scripts · parseIgnoreColor** (1 cross-edges)
- **impeccable/scripts · walk** (1 cross-edges)

## How to Explore

```
get_communities with id: "community-93"
smart_context with task: "understand impeccable/scripts · runHook", format: "gcx"
find_usages with id: ".github/skills/impeccable/scripts/hook-lib.mjs::runHook", format: "gcx"
```

_`format: "gcx"` returns the [GCX1 compact wire format](../../docs/wire-format.md) — round-trippable, ~27% fewer tokens than JSON. Drop it for JSON output; agents using `@gortex/wire` or the Go `github.com/gortexhq/gcx-go` package decode either._
