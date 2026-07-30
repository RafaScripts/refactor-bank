---
name: gortex-dashboard-cashout-cashoutpage
description: "Work in the dashboard/cashout · CashOutPage area — 51 symbols across 1 files (100% cohesion)"
---

# dashboard/cashout · CashOutPage

51 symbols | 1 files | 100% cohesion

## When to Use

Use this skill when working on files in:
- `app/dashboard/cashout/page.tsx`

## Key Files

| File | Symbols |
|------|---------|
| `app/dashboard/cashout/page.tsx` | setBoletoCode, boletoResult, transferDigit, transferAmount, pixDescription, ... |

## Entry Points

- `app/dashboard/cashout/page.tsx::CashOutPage`

## How to Explore

```
get_communities with id: "community-191"
smart_context with task: "understand dashboard/cashout · CashOutPage", format: "gcx"
find_usages with id: "app/dashboard/cashout/page.tsx::CashOutPage", format: "gcx"
```

_`format: "gcx"` returns the [GCX1 compact wire format](../../docs/wire-format.md) — round-trippable, ~27% fewer tokens than JSON. Drop it for JSON output; agents using `@gortex/wire` or the Go `github.com/gortexhq/gcx-go` package decode either._
