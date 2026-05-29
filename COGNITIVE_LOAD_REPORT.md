# Cognitive Load Report

**Generated:** 2026-05-29T15:17:18.635Z  
**Files scanned:** 702

---

## Summary

- **Errors:** 0
- **Warnings:** 0
- **Total issues:** 0

---

## Errors (must fix)

✅ No errors found.

## Warnings (review)

✅ No warnings found.

---

## Rules

| Rule | Trigger | Action |
|------|---------|--------|
| viz-internal-bypass | Component imports from visualization/core, domains, registry, or old palette files directly | Use `@/design-system/viz` |
| ui-internal-bypass | Component imports from primitives/ or core internals directly | Use `@/design-system/ui` |
| too-many-layers | Component imports from > 2 design-system layers | Refactor to go through public API |
| internal-cross-import | Visualization module imports another internal module | Use registry or central index |

---

*Lower cognitive load = faster development.*
