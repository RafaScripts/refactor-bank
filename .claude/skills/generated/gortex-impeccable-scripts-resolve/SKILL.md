---
name: gortex-impeccable-scripts-resolve
description: "Work in the impeccable/scripts · resolve area — 95 symbols across 15 files (84% cohesion)"
---

# impeccable/scripts · resolve

95 symbols | 15 files | 84% cohesion

## When to Use

Use this skill when working on files in:
- `.github/skills/impeccable/scripts/context.mjs`
- `.github/skills/impeccable/scripts/doctor.mjs`
- `.github/skills/impeccable/scripts/hook-before-edit.mjs`
- `.github/skills/impeccable/scripts/hook-lib.mjs`
- `.github/skills/impeccable/scripts/live-browser-session.js`
- `.github/skills/impeccable/scripts/live-browser.js`
- `.github/skills/impeccable/scripts/live-copy-edit-agent.mjs`
- `.github/skills/impeccable/scripts/live-manual-edit-evidence.mjs`
- `.github/skills/impeccable/scripts/live-server.mjs`
- `.github/skills/impeccable/scripts/live-target.mjs`
- `.github/skills/impeccable/scripts/live-wrap.mjs`
- `.github/skills/impeccable/scripts/live.mjs`
- `.github/skills/impeccable/scripts/pin.mjs`
- `.github/skills/impeccable/scripts/serve-question.mjs`
- `.github/skills/impeccable/scripts/surface-brief.mjs`

## Key Files

| File | Symbols |
|------|---------|
| `.github/skills/impeccable/scripts/context.mjs` | appendAutonomyCounterDirective, buildUpdateDirective, hookEnabledAt, findTargetExample, truthyEnv, ... |
| `.github/skills/impeccable/scripts/doctor.mjs` | collect, readProjectRootPatterns |
| `.github/skills/impeccable/scripts/hook-before-edit.mjs` | isInsideProject, shellCopiedFileContent |
| `.github/skills/impeccable/scripts/hook-lib.mjs` | resolveHookGitExcludeTarget, parseStaticStyleImports, resolveCacheCwd, resolveGitDir, ensureHookGitExcludes, ... |
| `.github/skills/impeccable/scripts/live-browser-session.js` | createLiveBrowserSessionState, safeRemove, safeWrite |
| `.github/skills/impeccable/scripts/live-browser.js` | loadModernScreenshot |
| `.github/skills/impeccable/scripts/live-copy-edit-agent.mjs` | isPathInsideOrEqual, applyMockWrites |
| `.github/skills/impeccable/scripts/live-manual-edit-evidence.mjs` | isPathInsideOrEqual, normalizeSourceHint, analyzeSourceHint |
| `.github/skills/impeccable/scripts/live-server.mjs` | findOpenPort, resolve |
| `.github/skills/impeccable/scripts/live-target.mjs` | resolveLiveTarget |
| `.github/skills/impeccable/scripts/live-wrap.mjs` | manualEditMayAffectWrap, pendingEntriesThatMayAffectWrap, manualEditHintFallsInsideSelection |
| `.github/skills/impeccable/scripts/live.mjs` | runScript, safeParse, ensureServerRunning, missingLiveContext, liveCli |
| `.github/skills/impeccable/scripts/pin.mjs` | findProjectRoot |
| `.github/skills/impeccable/scripts/serve-question.mjs` | loadRound, imageSrc |
| `.github/skills/impeccable/scripts/surface-brief.mjs` | summary, main |

## Entry Points

- `.github/skills/impeccable/scripts/context.mjs::cli`
- `.github/skills/impeccable/scripts/live.mjs::liveCli`
- `.github/skills/impeccable/scripts/surface-brief.mjs::main`

## Connected Communities

- **impeccable/scripts · escapeRegExp** (3 cross-edges)
- **impeccable/scripts · isExcludedByWorkspacePattern** (3 cross-edges)
- **impeccable/scripts · add** (2 cross-edges)
- **impeccable/scripts · expandSimplePattern** (2 cross-edges)
- **impeccable/scripts · resumeSession** (2 cross-edges)
- **impeccable/scripts · parseYamlFlowList** (1 cross-edges)
- **impeccable/scripts · walk** (1 cross-edges)
- **impeccable/scripts · shellWriteDestination** (1 cross-edges)
- **impeccable/scripts · parseCopyEditAgentResult** (1 cross-edges)
- **impeccable/scripts · el** (1 cross-edges)

## How to Explore

```
get_communities with id: "community-146"
smart_context with task: "understand impeccable/scripts · resolve", format: "gcx"
find_usages with id: ".github/skills/impeccable/scripts/context.mjs::cli", format: "gcx"
```

_`format: "gcx"` returns the [GCX1 compact wire format](../../docs/wire-format.md) — round-trippable, ~27% fewer tokens than JSON. Drop it for JSON output; agents using `@gortex/wire` or the Go `github.com/gortexhq/gcx-go` package decode either._
