---
name: gortex-impeccable-scripts-handlekeydown
description: "Work in the impeccable/scripts · handleKeyDown area — 138 symbols across 4 files (76% cohesion)"
---

# impeccable/scripts · handleKeyDown

138 symbols | 4 files | 76% cohesion

## When to Use

Use this skill when working on files in:
- `.github/skills/impeccable/scripts/generate-image.mjs`
- `.github/skills/impeccable/scripts/live-browser-dom.js`
- `.github/skills/impeccable/scripts/live-browser-session.js`
- `.github/skills/impeccable/scripts/live-browser.js`

## Key Files

| File | Symbols |
|------|---------|
| `.github/skills/impeccable/scripts/generate-image.mjs` | escape, svgFake |
| `.github/skills/impeccable/scripts/live-browser-dom.js` | desc, id8, own, pickable, hasAttribute |
| `.github/skills/impeccable/scripts/live-browser-session.js` | clearScrollY, markHandled |
| `.github/skills/impeccable/scripts/live-browser.js` | buildLocatorForLeaf, captureAndEmit, isInlineEditActive, maybePrefetchPage, canRestoreManualEditElement, ... |

## Entry Points

- `.github/skills/impeccable/scripts/live-browser.js::handleKeyDown`
- `.github/skills/impeccable/scripts/live-browser.js::handleClick`
- `.github/skills/impeccable/scripts/live-browser.js::applyEditing`

## Connected Communities

- **impeccable/scripts · resumeSession** (41 cross-edges)
- **impeccable/scripts · el** (32 cross-edges)
- **impeccable/scripts · initPageChat** (12 cross-edges)
- **impeccable/scripts · getBoundingClientRect** (10 cross-edges)
- **impeccable/scripts · startScrollLock** (4 cross-edges)
- **impeccable/scripts · handleManualEditActivity** (3 cross-edges)
- **impeccable/scripts · attachSteerFocusGuard** (3 cross-edges)
- **impeccable/scripts · onAnnotDown** (3 cross-edges)
- **impeccable/scripts · add** (3 cross-edges)
- **impeccable/scripts · restoreAcceptedDomFromSnapshot** (2 cross-edges)
- **impeccable/scripts · buildAcceptedWrappedSource** (1 cross-edges)
- **impeccable/scripts · walk** (1 cross-edges)
- **impeccable/scripts · createRequestHandler** (1 cross-edges)
- **impeccable/scripts · documentRefClassSuffix** (1 cross-edges)
- **impeccable/scripts · hitSiblingInsertGap** (1 cross-edges)
- **impeccable/scripts · pngChunk** (1 cross-edges)
- **impeccable/scripts · findActiveSessionSummary** (1 cross-edges)

## How to Explore

```
get_communities with id: "community-125"
smart_context with task: "understand impeccable/scripts · handleKeyDown", format: "gcx"
find_usages with id: ".github/skills/impeccable/scripts/live-browser.js::handleKeyDown", format: "gcx"
```

_`format: "gcx"` returns the [GCX1 compact wire format](../../docs/wire-format.md) — round-trippable, ~27% fewer tokens than JSON. Drop it for JSON output; agents using `@gortex/wire` or the Go `github.com/gortexhq/gcx-go` package decode either._
