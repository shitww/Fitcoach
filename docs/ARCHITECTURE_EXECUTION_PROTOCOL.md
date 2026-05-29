# Architecture Execution Protocol

> Version: 1.0
> Phase: Architecture Execution Layer Phase 4
> Status: Active Enforcement Specification
> Authority: `/docs/ARCHITECTURE_CONSTITUTION.md`, `/docs/ARCHITECTURE_ENFORCEMENT.md`

---

## 1. Pre-Commit Enforcement Flow

Every commit that introduces or modifies a module (component, hook, utility, API route) MUST pass the following gates before integration is permitted.

### Gate 1: Registry Check

**Question**: Is the affected module already registered in `/docs/FEATURE_REGISTRY.md`?

| Outcome | Path |
|---------|------|
| YES — module exists in registry | Proceed to Gate 2 |
| NO — module is new or unregistered | Block. Require registration update in same PR. |

**Execution mechanism**: CI step scans changed files against registry entries. Any new `.tsx`, `.ts`, `.mdx` in `src/` not mentioned in registry triggers a failing check.

### Gate 2: Canonical Lookup

**Question**: Does the module's purpose overlap with an existing canonical system?

| Outcome | Path |
|---------|------|
| No canonical overlap | Proceed to Gate 3 |
| Canonical exists; module is marked secondary with dependency | Proceed to Gate 3 |
| Canonical exists; module is NOT marked secondary | Block. Violation: unregistered secondary component. |

**Execution mechanism**: Parse `FEATURE_REGISTRY.md` canonical table. Cross-reference changed file path and export names.

### Gate 3: Similarity Check (>70%)

**Question**: Does the new module share >70% similarity in purpose, props, or rendered output with an existing module?

**Heuristics** (automated where possible, manual review where not):

- Export name similarity (e.g., `WarmupCard` vs `WarmupCard`)
- Props interface overlap (shared prop names and types)
- DOM structure overlap (rendered tag patterns)
- Import dependency overlap (imports same canonical primitives)
- File path domain overlap (same parent folder purpose)

| Score | Action |
|-------|--------|
| 0-40% | Pass. Proceed to Gate 4. |
| 41-69% | Soft flag. Requires explicit justification in PR description. |
| 70-100% | Block. Violation: Anti-Regeneration Rule breach. Must extend, compose, or refactor existing module. |

**Execution mechanism**: Static analysis tool compares AST of new file against all files in same domain directory. Manual review required for 41-69% range.

### Gate 4: Duplication Risk Gate Check

**Question**: Does the new module belong to a high-risk duplication domain?

High-risk domains (from `/docs/ARCHITECTURE_ENFORCEMENT.md` §5):
- Card components
- Input / Form components
- Picker / Selector systems
- Island / Client boundaries
- Skeleton components
- Metric display components

| Outcome | Action |
|---------|--------|
| Not in high-risk domain | Pass. Proceed to Gate 5. |
| In high-risk domain + has explicit justification | Pass. Proceed to Gate 5. |
| In high-risk domain + no justification | Block. Require justification in PR. |

### Gate 5: PR Checklist Validation

Every PR introducing a new module MUST include the following checklist (copied from `/docs/ARCHITECTURE_ENFORCEMENT.md` §7):

```markdown
## Architecture Checklist

- [ ] I searched `FEATURE_REGISTRY.md` for existing canonical systems.
- [ ] I confirmed no >70% similar module exists.
- [ ] If this is a secondary component, I declared its canonical dependency.
- [ ] I updated `FEATURE_REGISTRY.md` with purpose, canonical status, dependency, and reason.
- [ ] If this touches a high-risk domain, I provided explicit justification below.
```

| Outcome | Action |
|---------|--------|
| All 5 items checked + justification provided | Pass. Integration permitted. |
| Any item unchecked | Block. PR review must request completion. |
| Checklist missing from PR | Block. CI bot posts checklist as required comment. |

### Final Decision Gate

Only after all 5 gates pass may the commit be integrated.

```
Gate 1 (Registry)      → Gate 2 (Canonical)     → Gate 3 (Similarity)
    PASS                    PASS                    PASS
     │                       │                       │
     └───────────────────────┴───────────────────────┘
                         │
                         ▼
              Gate 4 (Risk Domain)      → Gate 5 (Checklist)
                  PASS                    PASS
                   │                       │
                   └───────────────────────┘
                               │
                               ▼
                         INTEGRATION PERMITTED
```

---

## 2. AI Generation Gate

Before ANY AI-generated code (e.g., from Cascade, Copilot, ChatGPT, Claude) is accepted into the codebase, the following MUST be true:

### Rule A: Registry Reference

The AI MUST reference `/docs/FEATURE_REGISTRY.md` before generating any new module.

**Implementation**: AI prompt preamble must include:

```
Before generating a new component, hook, utility, or API route:
1. Read /docs/FEATURE_REGISTRY.md
2. Identify the target feature domain
3. Check if a canonical module already covers the purpose
4. If yes: propose extension or composition, not duplication
5. If no: propose registration entry before generating code
```

### Rule B: Canonical Dependency Declaration

Every AI-generated secondary component MUST include a file-level canonical dependency comment (as defined in `/docs/ARCHITECTURE_ENFORCEMENT.md` §1.2).

**Example**:

```typescript
// SECONDARY COMPONENT — AI Generated
// Domain:      workout
// Canonical:   src/components/ExercisePicker.tsx
// Reason:      Quick-launcher shortcut; delegates to canonical picker via onOpenSearch
// Generated:   2026-05-29
```

### Rule C: Duplication Risk Classification

The AI MUST classify the generated module's duplication risk:

```
Risk: low | medium | high
Justification: [one sentence]
```

If risk is `high`, the AI MUST:
1. Stop generation.
2. Explain why existing canonical modules cannot be extended.
3. Propose an override log entry if strict duplication is unavoidable.

### Rule D: AI Override Requirement

If the AI cannot satisfy Rules A-C, it MUST:
1. Refuse to generate the module.
2. Propose an entry in `/docs/ARCHITECTURE_OVERRIDE_LOG.md`.
3. Wait for human approval before proceeding.

---

## 3. Architecture Violation Interception

### Interception Triggers

A violation is detected when ANY of the following occur:

1. **Unregistered module**: New file in `src/` not in registry within same PR.
2. **Canonical bypass**: Module overlaps with canonical but is not marked secondary.
3. **Similarity breach**: >70% similarity score with existing module.
4. **High-risk gate failure**: New `*Card`, `*Picker`, `*Island`, `*Skeleton`, input component without justification.
5. **Forbidden naming pattern**: Filename contains `V2`, `v2`, `Copy`, `New`, `Final`, `Enhanced`.
6. **Page imports experimental**: `page.tsx` or `layout.tsx` imports from `src/experimental/` or `src/deprecated/`.

### System Behavior on Violation

```
ON VIOLATION DETECTED:
├── STOP integration immediately
├── Post blocking comment to PR
├── Tag PR with label: architecture-violation
├── Require ONE of the following resolutions:
│   ├── EXTEND: Modify existing canonical module to absorb new use case
│   ├── COMPOSE: Use existing canonical as child/wrapper
│   ├── REFACTOR: Refactor canonical first, then consume
│   └── OVERRIDE: Log explicit override in ARCHITECTURE_OVERRIDE_LOG.md
│       └── Requires human approver with write access to /docs/
└── If override chosen:
    ├── Add entry to ARCHITECTURE_OVERRIDE_LOG.md
    ├── Link entry in PR description
    └── Require at least 1 approval from architecture-maintainer role
```

### Resolution Paths (Detailed)

| Path | When to Use | Example |
|------|-------------|---------|
| **EXTEND** | New module needs 1-2 new props or a small variant that fits existing API | Add `timeText` prop to existing canonical card |
| **COMPOSE** | New module needs existing canonical as a child with additional layout | Use `HeroMetricCard` inside a new dashboard section |
| **REFACTOR** | Existing canonical is too rigid; needs structural change first | Split monolithic `FoodSearch` into search + results before reusing |
| **OVERRIDE** | Genuine new domain, emergency fix, or exception approved by maintainer | New `*Card` justified by fundamentally different interaction model |

---

## 4. Violation Enforcement Levels

| Level | Code | Meaning | Action | Examples |
|-------|------|---------|--------|----------|
| **L1** | `ARCH-WARN` | Minor naming or style issue | Warning only; does not block merge. Bot posts comment. | Missing blank line around JSDoc; inconsistent casing |
| **L2** | `ARCH-SOFT` | Soft duplication risk or unregistered secondary | Requires registry update in same PR. Blocks merge until resolved. | 41-69% similarity; new secondary without explicit dependency comment |
| **L3** | `ARCH-DUPE` | Active duplicate creation or >70% similarity | **Blocked in PR.** Must refactor into extension or composition. | New `WarmupCard` when one exists; new `MetricCard` outside layout/ |
| **L4** | `ARCH-CANON` | Canonical violation or structural breach | **Critical failure.** Must refactor or obtain override log approval. | Page imports from experimental/; forbidden naming pattern; parallel system creation |

### Escalation Path

```
L1 (Warning)    → posted as comment, non-blocking
    │
    ▼ (if ignored)
L2 (Soft Block) → blocks merge, requires registry update
    │
    ▼ (if unresolved)
L3 (Hard Block) → blocks merge, requires architectural correction
    │
    ▼ (if override sought)
L4 (Critical)   → blocks merge, requires override log + maintainer approval
```

---

## 5. Architecture Health Metrics

### Dashboard Metrics (Conceptual)

These metrics should be tracked per sprint or per release.

#### M1: Canonical System Count

- **Definition**: Number of modules marked `canonical: true` in registry.
- **Target**: Stable or slowly growing.
- **Alert**: Sharp increase = possible fragmentation; sharp decrease = possible undetected duplication.

#### M2: Secondary System Count

- **Definition**: Number of modules marked `canonical: false` with a declared dependency.
- **Target**: Low and stable.
- **Alert**: Increasing trend = creeping duplication.

#### M3: Duplication Risk Score

- **Definition**: Weighted sum of high-risk domain modules.
- **Formula**: `sum(high_risk_module_count * 3) + sum(medium_risk_module_count * 1)`
- **Target**: Decreasing over time.
- **Alert**: Increase >10% in a single sprint.

#### M4: Orphan Module Count

- **Definition**: Files in `src/` with zero inbound imports AND not in registry.
- **Target**: Zero.
- **Alert**: Any orphan flagged for deprecation review.

#### M5: Similarity Violation Frequency

- **Definition**: Count of L2/L3/L4 violations detected per sprint.
- **Target**: Zero L3/L4; decreasing L2.
- **Alert**: 2+ L3/L4 in a sprint = architecture review required.

#### M6: Registry Drift Index

- **Definition**: Percentage of source files in `src/` NOT represented in `FEATURE_REGISTRY.md`.
- **Formula**: `unregistered_files / total_src_files * 100`
- **Target**: <5%.
- **Alert**: >10% = mandatory registry audit.

### Health Scorecard Template

```markdown
## Architecture Health Scorecard — Sprint [N]

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Canonical systems | 24 | stable | 🟢 |
| Secondary systems | 3 | <5 | 🟢 |
| Duplication risk score | 12 | decreasing | 🟡 |
| Orphan modules | 2 | 0 | 🔴 |
| Similarity violations (L2) | 1 | 0 | 🟡 |
| Similarity violations (L3/L4) | 0 | 0 | 🟢 |
| Registry drift index | 4.2% | <5% | 🟢 |
```

---

## 6. Role: Architecture Maintainer

### Responsibilities

- Own `/docs/ARCHITECTURE_*.md` files.
- Approve or reject `ARCHITECTURE_OVERRIDE_LOG.md` entries.
- Review L4 violations.
- Update enforcement rules when feature boundaries change.
- Run quarterly architecture health review using metrics in §5.

### Approval Authority

| Action | Required Approvers |
|--------|-------------------|
| L1-L2 resolution | Any code reviewer |
| L3 resolution | Senior engineer + architecture maintainer |
| L4 override log entry | Architecture maintainer only |
| Amendment to constitution | Architecture maintainer + tech lead |

---

## 7. Amendment

This protocol may be amended only by:
1. Proposal in a dedicated PR modifying this file.
2. Update to dependent documents (`ARCHITECTURE_ENFORCEMENT.md`, `FEATURE_REGISTRY.md`) if feature boundaries change.
3. Approval by an architecture maintainer.

---

*Enforced from: Architecture Execution Layer Phase 4*
