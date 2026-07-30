---
name: gortex-impeccable-scripts-createrequesthandler
description: "Work in the impeccable/scripts · createRequestHandler area — 51 symbols across 3 files (91% cohesion)"
---

# impeccable/scripts · createRequestHandler

51 symbols | 3 files | 91% cohesion

## When to Use

Use this skill when working on files in:
- `.github/skills/impeccable/scripts/concept-seed.mjs`
- `.github/skills/impeccable/scripts/context-signals.mjs`
- `.github/skills/impeccable/scripts/live-server.mjs`

## Key Files

| File | Symbols |
|------|---------|
| `.github/skills/impeccable/scripts/concept-seed.mjs` | unit, renderStaging, renderConceptSeed, pickRound, loadLocal, ... |
| `.github/skills/impeccable/scripts/context-signals.mjs` | get, num, latestCritique |
| `.github/skills/impeccable/scripts/live-server.mjs` | releasePendingEvent, sessionFileMetadataFromPollReply, flushPendingPolls, getManualEditStatus, restorePendingEventsFromStore, ... |

## Entry Points

- `.github/skills/impeccable/scripts/live-server.mjs::createRequestHandler`

## Connected Communities

- **impeccable/scripts · add** (4 cross-edges)
- **impeccable/scripts · resolve** (4 cross-edges)
- **impeccable/scripts · apiBudgetMs** (1 cross-edges)

## How to Explore

```
get_communities with id: "community-145"
smart_context with task: "understand impeccable/scripts · createRequestHandler", format: "gcx"
find_usages with id: ".github/skills/impeccable/scripts/live-server.mjs::createRequestHandler", format: "gcx"
```

_`format: "gcx"` returns the [GCX1 compact wire format](../../docs/wire-format.md) — round-trippable, ~27% fewer tokens than JSON. Drop it for JSON output; agents using `@gortex/wire` or the Go `github.com/gortexhq/gcx-go` package decode either._
