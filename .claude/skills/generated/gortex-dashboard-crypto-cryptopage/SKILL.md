---
name: gortex-dashboard-crypto-cryptopage
description: "Work in the dashboard/crypto · CryptoPage area — 56 symbols across 1 files (100% cohesion)"
---

# dashboard/crypto · CryptoPage

56 symbols | 1 files | 100% cohesion

## When to Use

Use this skill when working on files in:
- `app/dashboard/crypto/page.tsx`

## Key Files

| File | Symbols |
|------|---------|
| `app/dashboard/crypto/page.tsx` | priceData, sellCurrency, setSellCurrency, symbol, setFiatBalance, ... |

## Entry Points

- `app/dashboard/crypto/page.tsx::CryptoPage`

## How to Explore

```
get_communities with id: "community-200"
smart_context with task: "understand dashboard/crypto · CryptoPage", format: "gcx"
find_usages with id: "app/dashboard/crypto/page.tsx::CryptoPage", format: "gcx"
```

_`format: "gcx"` returns the [GCX1 compact wire format](../../docs/wire-format.md) — round-trippable, ~27% fewer tokens than JSON. Drop it for JSON output; agents using `@gortex/wire` or the Go `github.com/gortexhq/gcx-go` package decode either._
