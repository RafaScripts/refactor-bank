---
name: gortex-ui-3-dirs
description: "Work in the ui +3 dirs area — 71 symbols across 24 files (93% cohesion)"
---

# ui +3 dirs

71 symbols | 24 files | 93% cohesion

## When to Use

Use this skill when working on files in:
- `components/command-menu.tsx`
- `components/ui/accordion.tsx`
- `components/ui/calendar.tsx`
- `components/ui/carousel.tsx`
- `components/ui/chart.tsx`
- `components/ui/command.tsx`
- `components/ui/context-menu.tsx`
- `components/ui/dropdown-menu.tsx`
- `components/ui/form.tsx`
- `components/ui/input-otp.tsx`
- `components/ui/item.tsx`
- `components/ui/menubar.tsx`
- `components/ui/navigation-menu.tsx`
- `components/ui/radio-group.tsx`
- `components/ui/select.tsx`
- `components/ui/sidebar.tsx`
- `components/ui/slider.tsx`
- `components/ui/toaster.tsx`
- `components/ui/toggle-group.tsx`
- `components/ui/use-mobile.tsx`
- `components/ui/use-toast.ts`
- `external-call::stdlib:react`
- `hooks/use-mobile.ts`
- `hooks/use-toast.ts`

## Key Files

| File | Symbols |
|------|---------|
| `components/command-menu.tsx` | open, router, runCommand, setOpen, CommandMenu |
| `components/ui/accordion.tsx` | AccordionItem |
| `components/ui/calendar.tsx` | CalendarDayButton, defaultClassNames, ref |
| `components/ui/carousel.tsx` | Carousel, onSelect, carouselRef, handleKeyDown, setCanScrollNext, ... |
| `components/ui/chart.tsx` | chartId, ChartContainer, uniqueId |
| `components/ui/command.tsx` | CommandItem |
| `components/ui/context-menu.tsx` | ContextMenuItem |
| `components/ui/dropdown-menu.tsx` | DropdownMenuItem |
| `components/ui/form.tsx` | FormItem, id |
| `components/ui/input-otp.tsx` | hasFakeCaret, InputOTPSlot, isActive, inputOTPContext, char |
| `components/ui/item.tsx` | Item, Comp |
| `components/ui/menubar.tsx` | MenubarItem |
| `components/ui/navigation-menu.tsx` | NavigationMenuItem |
| `components/ui/radio-group.tsx` | RadioGroupItem |
| `components/ui/select.tsx` | SelectItem |
| `components/ui/sidebar.tsx` | SidebarMenuSkeleton, contextValue, openMobile, _open, SidebarProvider, ... |
| `components/ui/slider.tsx` | _values, Slider |
| `components/ui/toaster.tsx` | Toaster, toasts |
| `components/ui/toggle-group.tsx` | ToggleGroupItem, context |
| `components/ui/use-mobile.tsx` | useIsMobile, setIsMobile, isMobile |
| `components/ui/use-toast.ts` | useToast, state, setState |
| `external-call::stdlib:react` | react |
| `hooks/use-mobile.ts` | useIsMobile, setIsMobile, isMobile |
| `hooks/use-toast.ts` | setState, state, useToast |

## Connected Communities

- **ui · toast** (1 cross-edges)
- **hooks · toast** (1 cross-edges)

## How to Explore

```
get_communities with id: "community-263"
smart_context with task: "understand ui +3 dirs", format: "gcx"
```

_`format: "gcx"` returns the [GCX1 compact wire format](../../docs/wire-format.md) — round-trippable, ~27% fewer tokens than JSON. Drop it for JSON output; agents using `@gortex/wire` or the Go `github.com/gortexhq/gcx-go` package decode either._
