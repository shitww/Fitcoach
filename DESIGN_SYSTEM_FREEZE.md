# Design System Architecture Freeze

**Effective:** 2026-05-29  
**Status:** ACTIVE — violation warnings are enforced

---

## Principle

Adding architecture is now MORE dangerous than lacking architecture.

The system is powerful enough.
The priority is: **SIMPLICITY + LONG-TERM STABILITY**.

---

## Public Mental Model (3 Layers Only)

```
src/design-system/
  theme/   → tokens + semantic rules
  ui/      → primitives only
  viz/     → useDesignViz() only
```

Everything else is internal infrastructure.

---

## Forbidden (Architecture Expansion)

| Action | Consequence |
|--------|-------------|
| Add new architecture layers | Lint error + scanner failure |
| Create parallel visualization systems | Lint error + scanner failure |
| Introduce alternative renderers | Lint error + scanner failure |
| Create secondary token systems | Lint error + scanner failure |
| Add convenience wrappers around wrappers | Lint error + cognitive load warning |
| Export internal modules publicly | Lint error + scanner failure |

---

## Allowed (System Evolution)

| Action | Example |
|--------|---------|
| Replace existing implementation | Rewrite renderer.ts internals |
| Simplify abstractions | Collapse 2 functions into 1 |
| Remove unused systems | Delete dead code paths |
| Fix bugs | Patch renderer output |
| Add new domain mappers | Add `mapSleepToScale` to `domains/sleep.ts` |
| Optimize performance | Add memoization to `useDesignViz` |

---

## Runtime Warning

If any code attempts:
- `new renderer`
- `new scale system`
- `new theme engine`

The runtime guard emits:

```
[DesignSystem] Architecture Expansion Detected
  Source:  "<file>"
  Action:  "<description>"
  Rule:    New architecture layers are forbidden.
  Fix:     Use existing theme/ui/viz APIs.
```

---

## Escalation Path

If you believe a new architecture layer is genuinely required:

1. Open an issue with title `[Architecture Freeze] Proposed exception`
2. Must include:
   - What problem the new layer solves
   - Why existing 3-layer model cannot solve it
   - Concrete migration plan for existing code
   - Estimated cognitive load impact on new developers
3. Requires approval from 2 maintainers
4. Must update DESIGN_SYSTEM_FREEZE.md with exception rationale

**Default decision: REJECT.**

---

*The best architecture is the one you don't have to think about.*
