---
name: gortex-lib-get
description: "Work in the lib · get area — 56 symbols across 2 files (98% cohesion)"
---

# lib · get

56 symbols | 2 files | 98% cohesion

## When to Use

Use this skill when working on files in:
- `lib/admin.api.ts`
- `lib/api.ts`

## Key Files

| File | Symbols |
|------|---------|
| `lib/admin.api.ts` | token, token, limit, page, id, ... |
| `lib/api.ts` | creditsApi.getProducts, get, pixKeysApi.listKeys, token, token, ... |

## Connected Communities

- **lib · put** (1 cross-edges)

## How to Explore

```
get_communities with id: "community-271"
smart_context with task: "understand lib · get", format: "gcx"
```

_`format: "gcx"` returns the [GCX1 compact wire format](../../docs/wire-format.md) — round-trippable, ~27% fewer tokens than JSON. Drop it for JSON output; agents using `@gortex/wire` or the Go `github.com/gortexhq/gcx-go` package decode either._
