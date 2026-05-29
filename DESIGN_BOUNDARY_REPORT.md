# FitCoach Design Boundary Report

**Generated:** 2026-05-29T15:17:17.564Z

## Architecture Rules

```
theme ← (no imports)
primitives ← theme
visualization ← theme, primitives
ui-components ← theme, primitives, visualization (via props only)
```

## Summary

- **Total violations:** 0
- **Critical:** 0
- **High:** 0
- **Files affected:** 0

## Violation Types

- **cross-domain-import:** Theme or primitives importing visualization
- **viz-color-leak:** Visualization colors (#B8FF2B, #FF9940, etc.) found in theme/primitives
- **domain-state-leak:** Business state words (fatigue, intensity, heartRate) in theme/primitives

## Quick Fix Guide

| Violation | Fix |
|-----------|-----|
| Theme imports visualization | Remove import; use semantic token instead |
| Primitives import visualization | Remove import; use semantic token instead |
| Viz color in theme file | Replace with semantic token (e.g., #FF9940 → --warning) |
| Domain state in primitives | Rename to structural concept (e.g., fatigueLevel → statusLevel) |

## Violations by File

---

## Remediation

1. Fix all **critical** violations first (cross-domain imports)
2. Fix **high** violations next (domain state leakage)
3. Run this scanner after each PR to prevent regression
