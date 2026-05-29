# FitCoach Architecture Constitution

> Version: 1.0
> Phase: Architecture Stabilization Phase 1
> Status: Enforced

---

## 1. Single Entry Principle

Each feature domain MUST have exactly one official entry point.

- **Definition**: An entry point is the file that first renders a feature's UI in a route, or the main public API module that other features consume.
- **Rule**: No feature may expose multiple parallel entry points at the same directory level.
- **Rule**: If a feature has both a page and a shared API, the page is the UI entry point and the API module is the service entry point — both must be documented in the Feature Registry.

---

## 2. Forbidden Naming Patterns

The following patterns are **FORBIDDEN** in all new files, folders, exports, and variable names:

| Pattern | Examples | Rationale |
|---------|----------|-----------|
| Version suffixes | `V2`, `v2`, `V3`, `v3` | Versions belong in git history, not filenames |
| Incremental adjectives | `New`, `new`, `Final`, `final`, `Enhanced`, `enhanced` | Code is always evolving; these names become lies |
| Copy markers | `Copy`, `copy`, `-副本`, `(1)`, `(2)` | Indicates unresolved duplication |

**Existing violations** must be flagged in `ARCHITECTURE_DRIFT_REPORT.md` and queued for replacement.

---

## 3. Duplicate Component Rule

- **Rule**: No duplicate components may exist outside of `/src/experimental/`.
- **Definition of duplicate**: Two or more components that serve the same purpose, render similar UI, or accept overlapping prop interfaces.
- **Enforcement**: Any new component that overlaps an existing one must either:
  1. Replace the existing component (documented in registry), or
  2. Be placed in `/src/experimental/` until it is promoted.

---

## 4. Page Import Boundary Rule

- **Rule**: Page components (`page.tsx`, `layout.tsx` in `src/app/**`) MUST NOT import from:
  - `/src/experimental/`
  - `/src/deprecated/`
  - Any file explicitly marked with a `@deprecated` JSDoc tag
- **Rationale**: Pages are the public surface of the application. They must only depend on stable, supported modules.

---

## 5. Replacement Documentation Rule

- **Rule**: Any component, hook, utility, or API route that replaces another MUST be explicitly documented in `FEATURE_REGISTRY.md` under the affected feature.
- **Required fields**:
  - `replaced_by`: path to the new canonical module
  - `reason`: one-sentence justification
  - `migration_status`: `pending`, `in_progress`, or `complete`

---

## 6. Folder Purpose

| Folder | Purpose |
|--------|---------|
| `/src/app/` | Next.js App Router pages and layouts only |
| `/src/components/` | Shared, stable React components |
| `/src/experimental/` | Work-in-progress components, hooks, or features not yet ready for production pages |
| `/src/deprecated/` | Modules slated for removal; no new imports allowed |
| `/src/lib/` | Business logic, utilities, and services |
| `/src/hooks/` | Shared React hooks |
| `/src/types/` | Shared TypeScript type definitions |
| `/src/stores/` | State management modules |
| `/src/contexts/` | React context providers |
| `/docs/` | Architecture, planning, and specification documents |

---

## 7. Amendment Process

This constitution may only be amended by:
1. Opening a PR that modifies this file.
2. Updating `FEATURE_REGISTRY.md` if any rules affect feature ownership.
3. Obtaining explicit approval in code review.

---

*Last updated: Architecture Stabilization Phase 1*
