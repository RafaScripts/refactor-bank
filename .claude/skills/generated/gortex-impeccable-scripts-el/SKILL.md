---
name: gortex-impeccable-scripts-el
description: "Work in the impeccable/scripts · el area — 93 symbols across 2 files (82% cohesion)"
---

# impeccable/scripts · el

93 symbols | 2 files | 82% cohesion

## When to Use

Use this skill when working on files in:
- `.github/skills/impeccable/scripts/live-browser-dom.js`
- `.github/skills/impeccable/scripts/live-browser.js`

## Key Files

| File | Symbols |
|------|---------|
| `.github/skills/impeccable/scripts/live-browser-dom.js` | defangOutsideHandlers, uiAppendStyle, uiGetById, uiAppend |
| `.github/skills/impeccable/scripts/live-browser.js` | insertCreateDisabledReason, configureVoiceContext, configureSelectionPillStyle, bindConfigureModifierPillHover, ensureSpinKeyframes, ... |

## Entry Points

- `.github/skills/impeccable/scripts/live-browser.js::initGlobalBar`
- `.github/skills/impeccable/scripts/live-browser.js::init`

## Connected Communities

- **impeccable/scripts · handleKeyDown** (36 cross-edges)
- **impeccable/scripts · resumeSession** (11 cross-edges)
- **impeccable/scripts · initPageChat** (6 cross-edges)
- **impeccable/scripts · getBoundingClientRect** (5 cross-edges)
- **impeccable/scripts · handleManualEditActivity** (3 cross-edges)
- **impeccable/scripts · renderMarkdown** (3 cross-edges)
- **impeccable/scripts · attachSteerFocusGuard** (1 cross-edges)
- **impeccable/scripts · buildAcceptedWrappedSource** (1 cross-edges)

## How to Explore

```
get_communities with id: "community-112"
smart_context with task: "understand impeccable/scripts · el", format: "gcx"
find_usages with id: ".github/skills/impeccable/scripts/live-browser.js::initGlobalBar", format: "gcx"
```

_`format: "gcx"` returns the [GCX1 compact wire format](../../docs/wire-format.md) — round-trippable, ~27% fewer tokens than JSON. Drop it for JSON output; agents using `@gortex/wire` or the Go `github.com/gortexhq/gcx-go` package decode either._
