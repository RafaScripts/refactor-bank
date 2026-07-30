---
name: gortex-impeccable-scripts-commitmanualedits
description: "Work in the impeccable/scripts · commitManualEdits area — 45 symbols across 4 files (88% cohesion)"
---

# impeccable/scripts · commitManualEdits

45 symbols | 4 files | 88% cohesion

## When to Use

Use this skill when working on files in:
- `.github/skills/impeccable/scripts/hook-lib.mjs`
- `.github/skills/impeccable/scripts/live-commit-manual-edits.mjs`
- `.github/skills/impeccable/scripts/live-copy-edit-agent.mjs`
- `.github/skills/impeccable/scripts/live-manual-edit-evidence.mjs`

## Key Files

| File | Symbols |
|------|---------|
| `.github/skills/impeccable/scripts/hook-lib.mjs` | applyDetectorConfigSource, uniqueStrings |
| `.github/skills/impeccable/scripts/live-commit-manual-edits.mjs` | mergeUniqueStrings, coupledObjectKeyFailuresForOp, snapshotRollbackFiles, mergeFailedEntries, collectRollbackFiles, ... |
| `.github/skills/impeccable/scripts/live-copy-edit-agent.mjs` | runCopyEditPostApplyChecks, runManualEditValidationScript, checkFrameworkSourceSyntax, isInsideQuotedLiteral, readManualEditValidationScript, ... |
| `.github/skills/impeccable/scripts/live-manual-edit-evidence.mjs` | flattenOps, buildManualEditEvidence |

## Connected Communities

- **impeccable/scripts · resolve** (8 cross-edges)
- **impeccable/scripts · createRequestHandler** (5 cross-edges)
- **impeccable/scripts · add** (4 cross-edges)
- **impeccable/scripts · runCopyEditBatchAgent** (2 cross-edges)
- **impeccable/scripts · statusReport** (1 cross-edges)
- **impeccable/scripts · escapeRegExp** (1 cross-edges)
- **impeccable/scripts · scanDir** (1 cross-edges)
- **impeccable/scripts · buildCandidatesForOp** (1 cross-edges)

## How to Explore

```
get_communities with id: "community-131"
smart_context with task: "understand impeccable/scripts · commitManualEdits", format: "gcx"
```

_`format: "gcx"` returns the [GCX1 compact wire format](../../docs/wire-format.md) — round-trippable, ~27% fewer tokens than JSON. Drop it for JSON output; agents using `@gortex/wire` or the Go `github.com/gortexhq/gcx-go` package decode either._
