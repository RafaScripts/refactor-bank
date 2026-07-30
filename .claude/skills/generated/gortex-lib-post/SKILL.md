---
name: gortex-lib-post
description: "Work in the lib · post area — 84 symbols across 1 files (99% cohesion)"
---

# lib · post

84 symbols | 1 files | 99% cohesion

## When to Use

Use this skill when working on files in:
- `lib/api.ts`

## Key Files

| File | Symbols |
|------|---------|
| `lib/api.ts` | walletApi.createWallet, id, CryptoSellRequest, error, token, ... |

## Connected Communities

- **lib · put** (1 cross-edges)

## How to Explore

```
get_communities with id: "community-273"
smart_context with task: "understand lib · post", format: "gcx"
```

_`format: "gcx"` returns the [GCX1 compact wire format](../../docs/wire-format.md) — round-trippable, ~27% fewer tokens than JSON. Drop it for JSON output; agents using `@gortex/wire` or the Go `github.com/gortexhq/gcx-go` package decode either._
