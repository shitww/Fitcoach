# Architecture Enforcement Layer

> Version: 1.0
> Phase: Architecture Enforcement Phase 3
> Status: Active Governance
> Violations: Must be flagged in PR review; no auto-merge permitted

---

## 1. Canonical Component Enforcement

### 1.1 Single Canonical Rule

Each functional domain MUST define exactly **ONE** canonical implementation.

- **Definition of canonical**: The primary, authoritative module that serves as the source of truth for a given purpose.
- **Location**: Canonical components live in `src/components/` or `src/lib/` at a stable, non-experimental path.
- **Ownership**: Each canonical component is owned by exactly one feature domain listed in `FEATURE_REGISTRY.md`.

### 1.2 Secondary Component Contract

Any component that is **not** canonical is classified as **secondary**.

Every secondary component MUST declare its dependency on the canonical system in a file-level comment:

```typescript
// SECONDARY COMPONENT
// Domain:      workout
// Canonical:   src/components/ExercisePicker.tsx
// Reason:      Quick-launcher shortcut; delegates to canonical picker via onOpenSearch
// Guardrail:   Must not implement search, categories, or custom-exercise CRUD
```

If a secondary component cannot declare a canonical dependency, it is either:
- a candidate to become the new canonical, or
- an unregistered duplicate that must be rejected.

### 1.3 Canonical Promotion / Demotion

- **Promotion**: A secondary component may be promoted to canonical only after:
  1. All existing canonical callers are migrated.
  2. The registry is updated.
  3. The old canonical is moved to `/src/deprecated/`.
- **Demotion**: A canonical component may be demoted only after:
  1. A replacement canonical is registered and stable.
  2. All callers are migrated.
  3. The old canonical is documented in registry with `replaced_by`.

---

## 2. Forbidden Duplication Rules

### 2.1 Hard Prohibitions

It is **FORBIDDEN** to create any of the following without explicit architecture review:

| Prohibition | Examples of Violation |
|-------------|----------------------|
| New duplicate-purpose component | Creating a second `WarmupCard` when one exists |
| New UI implementation of existing system logic | Re-implementing exercise search inside a workout page instead of using `ExercisePicker` |
| Parallel system for same domain | Creating a second food-logging route/page when `diet/` exists |
| Filename collision with canonical | Naming a new file `MetricCard.tsx` outside the canonical path |
| Shadow export with same name | Exporting a component named `Card` from a local `_components/` folder when `src/components/design-system/Card.tsx` exists |

### 2.2 Soft Prohibitions (Require Justification)

The following require written justification in the PR description:

- Adding a new `*Card.tsx` component
- Adding a new `*Picker.tsx` or `*Selector.tsx` component
- Adding a new `*Island.tsx` or `*Client.tsx` wrapper
- Adding a new `*Skeleton.tsx` component
- Adding a new input/modal/form component when shadcn/ui primitives exist

---

## 3. Required Pre-Check Rule

Before creating **ANY** new component, hook, utility, or API route, the developer or AI MUST:

### Step 1: Search Feature Registry

Query `FEATURE_REGISTRY.md` for the target domain.

### Step 2: Identify Existing Canonical System

Determine if a canonical module already covers the purpose.

### Step 3: Decision Gate

```
IF canonical exists AND purpose overlaps > 70%:
    → EXTEND existing canonical
ELSE IF canonical exists AND purpose is genuinely distinct:
    → Register as SECONDARY with explicit dependency
ELSE:
    → Register as NEW CANONICAL in FEATURE_REGISTRY.md
```

### Step 4: Documentation

Every new module MUST include a header comment:

```typescript
// MODULE:      [filename]
// Domain:      [feature domain from registry]
// Type:        [canonical | secondary]
// Purpose:     [one-line description]
// Created:     [date]
// Registry:    [link to FEATURE_REGISTRY.md entry]
```

---

## 4. Mandatory Registration Rule

Any new component, hook, utility, or API route MUST be added to `/docs/FEATURE_REGISTRY.md` **before** or **in the same PR** as its creation.

### Required Fields

| Field | Description |
|-------|-------------|
| `purpose` | One-sentence description of what it does |
| `canonical` | `true` or `false` |
| `dependency` | If secondary, path to canonical module it depends on |
| `reason` | Why this module exists (extension, shortcut, specialization) |
| `risk_level` | `low`, `medium`, or `high` (see Duplication Risk Zones below) |

### Consequence of Non-Registration

Unregistered modules are treated as **orphans**.
- They may be flagged for deprecation in the next architecture review.
- They will not be protected from accidental duplication.

---

## 5. Duplication Risk Gates

### 5.1 High-Risk Domains

The following domains are classified as **HIGH RISK** for duplication. Any new component in these domains requires explicit justification and registry update.

#### 5.1.1 Card Components

| Canonical | `src/components/design-system/Card.tsx` |
| Canonical | `src/components/ui/card.tsx` (shadcn/ui) |
| Risk | Every feature eventually needs a card-like surface. |
| Gate | New `*Card.tsx` MUST justify why existing `Card` primitives are insufficient. |
| Allowed | Domain-specific cards (e.g., `NutritionCard`, `WorkoutCompletionCard`) that compose the primitive. |
| Forbidden | A new generic `Card` wrapper. |

#### 5.1.2 Input / Form Components

| Canonical | `src/components/ui/input.tsx`, `src/components/ui/textarea.tsx`, `src/components/ui/select.tsx`, `src/components/ui/label.tsx` |
| Risk | Every feature needs inputs. |
| Gate | New input component MUST justify why shadcn/ui primitives + composition are insufficient. |
| Allowed | Domain-specific composed inputs (e.g., `MetricEditorSheet`, `NumberPad`). |
| Forbidden | A new generic `Input` or `TextField` primitive. |

#### 5.1.3 Picker / Selector Systems

| Canonical | `src/components/ExercisePicker.tsx` |
| Canonical | `src/components/FoodSearch.tsx` |
| Risk | Selection is a cross-cutting concern. |
| Gate | New picker/selector MUST declare which canonical it extends or replaces. |
| Allowed | Quick-launcher shortcuts (`ExerciseQuickLauncher`) that delegate to canonical. |
| Forbidden | A second full modal exercise picker. |

#### 5.1.4 Island / Client Boundaries

| Convention | `*Island.tsx` = async/streaming wrapper (Server Component → Client Component bridge) |
| Convention | `*Client.tsx` = explicit client-component entry |
| Risk | These wrappers multiply quickly and become noise. |
| Gate | New island/client wrapper MUST document what it wraps and why it cannot use an existing wrapper. |
| Allowed | One island per major deferred UI surface per page. |
| Forbidden | Multiple islands for the same surface (e.g., `DietClientIsland` and `DietClientIslandV2`). |

#### 5.1.5 Skeleton Components

| Canonical | `src/components/Skeleton.tsx` (generic primitives) |
| Risk | Every page creates its own skeleton. |
| Gate | New `*Skeleton.tsx` MUST justify why generic skeleton primitives cannot be composed. |
| Allowed | Domain-specific skeletons for complex surfaces (e.g., `DietClientSkeleton` inline in page). |
| Forbidden | A new generic `Skeleton` primitive. |

#### 5.1.6 Metric Display Components

| Canonical | `src/components/layout/MetricCard.tsx` (Hero/Compact/Inline/Trend variants) |
| Risk | Every analytics/health feature needs metric display. |
| Gate | New metric display component MUST use `layout/MetricCard` variants or justify why not. |
| Allowed | Domain-specific wrappers that compose `HeroMetricCard`. |
| Forbidden | A new `*MetricCard.tsx` outside `layout/`. |

### 5.2 Medium-Risk Domains

| Domain | Canonical | Gate |
|--------|-----------|------|
| Toast / Notification | `src/components/Toast.tsx` | New toast system requires justification. |
| Status / Badge | `src/components/design-system/StateBadge.tsx`, `src/components/ui/badge.tsx` | New badge variant must extend existing. |
| Modal / Sheet | `src/components/ui/dialog.tsx` | New modal primitive forbidden; composed sheets allowed. |

### 5.3 Low-Risk Domains

| Domain | Notes |
|--------|-------|
| Page-specific `_components/` | Local components scoped to one page are low risk, but must still be registered. |
| API routes | New API routes are low risk for duplication but must declare their domain in registry. |

---

## 6. Anti-Regeneration Rule

### 6.1 The 70% Similarity Threshold

If a proposed component has **>70% similarity** in purpose, props, or rendered output to an existing module, it **MUST NOT** be created as a new file.

### 6.2 Similarity Checklist

Before creating a new module, check ALL of the following:

- [ ] Does an existing component accept similar props?
- [ ] Does an existing component render a similar DOM structure?
- [ ] Does an existing component serve the same user journey?
- [ ] Does an existing component live in the same feature domain?
- [ ] Could the existing component be extended with an optional prop instead?

If 4 or more answers are "yes", the new component violates the Anti-Regeneration Rule.

### 6.3 Resolution Paths

When similarity is >70%:

| Path | Action |
|------|--------|
| **Extend** | Add a new prop, variant, or sub-component to the existing canonical module. |
| **Compose** | Use the existing module as a child or wrapper in a new parent component. |
| **Refactor First** | Refactor the existing module to accommodate the new use case, then consume it. |
| **Register Exception** | If none of the above work, document a formal exception in `FEATURE_REGISTRY.md` with justification. |

---

## 7. Enforcement Checklist (PR Template)

Every PR that introduces a new module MUST include:

```markdown
## Architecture Checklist

- [ ] I searched `FEATURE_REGISTRY.md` for existing canonical systems.
- [ ] I confirmed no >70% similar module exists.
- [ ] If this is a secondary component, I declared its canonical dependency.
- [ ] I updated `FEATURE_REGISTRY.md` with purpose, canonical status, dependency, and reason.
- [ ] If this touches a high-risk domain, I provided explicit justification below.
```

---

## 8. Amendment

This document may be amended only by:
1. Proposing a change in a PR.
2. Updating `FEATURE_REGISTRY.md` if any enforcement rules affect feature boundaries.
3. Approval by code review.

---

*Enforced from: Architecture Enforcement Phase 3*
