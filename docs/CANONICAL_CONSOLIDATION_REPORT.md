# Canonical Consolidation Report

> Version: 1.0
> Phase: Architecture Self-Healing Layer Phase 5
> Purpose: Document duplication clusters and proposed canonical merges
> Authority: `/docs/ARCHITECTURE_SELF_HEALING_ENGINE.md` §1, §2

---

## Report Template

Copy this template for each consolidation event.

---

### Report ID: [AUTO-GENERATED UUID]

| Field | Value |
|-------|-------|
| **Generated** | `YYYY-MM-DDTHH:MM:SS+08:00` |
| **Trigger** | [T1/T2/T3/T4/T5/T6 — see Self-Healing Engine §4] |
| **Detected By** | Duplication Convergence Engine / Canonical Evolution Rule / Drift Repair System |
| **Priority** | P0 / P1 / P2 |
| **Sprint Target** | Sprint [N] |
| **Status** | `proposed` / `approved` / `in_progress` / `completed` / `rejected` |

---

## 1. Duplicate Cluster

### 1.1 Cluster Members

| Module | Path | Export Name | Current Role | Lines of Code | Import Count |
|--------|------|-------------|--------------|---------------|--------------|
| [A] | `src/.../ComponentA.tsx` | `ComponentA` | canonical / secondary | N | N |
| [B] | `src/.../ComponentB.tsx` | `ComponentB` | canonical / secondary | N | N |
| [C] | `src/.../ComponentC.tsx` | `ComponentC` | canonical / secondary | N | N |

### 1.2 Similarity Analysis

| Comparison Pair | Export Name Match | Props Overlap | DOM Overlap | Import Overlap | Weighted Score |
|-----------------|-------------------|---------------|-------------|----------------|----------------|
| A vs B | % | % | % | % | % |
| A vs C | % | % | % | % | % |
| B vs C | % | % | % | % | % |

### 1.3 Common Abstraction

**Shared Props**:
```typescript
// Extracted common interface
interface Shared[Name]Props {
  // list shared props
}
```

**Shared Logic**:
- Hook: [path]
- Utility: [path]
- Render pattern: [description]

**Differences Preserved**:
- [Domain-specific prop or behavior that must survive merge]

---

## 2. Recommended Canonical Target

### 2.1 Target Selection

| Field | Value |
|-------|-------|
| **Canonical Path** | `src/components/[Domain]/[Name].tsx` |
| **Rationale** | [Why this location/name was chosen] |
| **Canonical Lifecycle Stage** | discovery / proposal / migration / stable |

### 2.2 If NEW Canonical is Proposed

```typescript
// PROPOSED UNIFIED API
interface [NewCanonicalName]Props {
  // --- Core shared props ---
  // --- Variant discriminator ---
  variant: 'variant_a' | 'variant_b' | 'variant_c';
  // --- Optional domain-specific extensions ---
}
```

### 2.3 If EXISTING Canonical Absorbs Duplicates

| Canonical Path | Required Extensions |
|----------------|---------------------|
| `src/.../Existing.tsx` | [List of new props, variants, or sub-components to add] |

---

## 3. Migration Steps

### 3.1 Step-by-Step Plan

| Step | Action | Owner | Files Affected | Effort |
|------|--------|-------|----------------|--------|
| 1 | [Describe action] | [role] | [list] | small / medium / large |
| 2 | [Describe action] | [role] | [list] | small / medium / large |
| 3 | [Describe action] | [role] | [list] | small / medium / large |

### 3.2 Migration Order

```
[Cluster Member A] ─┐
[Cluster Member B] ─┼→ [Canonical Target] ─→ Update Callers ─→ Delete Duplicates
[Cluster Member C] ─┘
```

### 3.3 Rollback Plan

If consolidation causes regressions:
1. Revert to commit [SHA] before merge.
2. Restore deleted files from git history.
3. Notify architecture maintainer to reassess strategy.

---

## 4. Risk Assessment

### 4.1 Risk Matrix

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Caller breakages from prop rename | low / medium / high | low / medium / high | [action] |
| Visual regression from DOM merge | low / medium / high | low / medium / high | [action] |
| Loss of domain-specific behavior | low / medium / high | low / medium / high | [action] |
| Increased bundle size from merged variants | low / medium / high | low / medium / high | [action] |
| Timeline slip | low / medium / high | low / medium / high | [action] |

### 4.2 Testing Requirements

- [ ] Unit tests for unified component
- [ ] Visual regression tests for each variant
- [ ] Integration tests for each caller
- [ ] Mobile viewport verification (if affected)

---

## 5. Expected Code Reduction

### 5.1 Before / After

| Metric | Before | After | Delta |
|--------|--------|-------|-------|
| Files in cluster | N | 1 | -N |
| Total lines of code (cluster) | N | ~N | -N |
| Unique prop interfaces | N | 1 | -N |
| Import sites | N | N | ±0 |
| Bundle size (estimated) | N KB | ~N KB | -N KB |

### 5.2 Convergence Impact

| Metric | Current | Projected After Merge |
|--------|---------|----------------------|
| Canonical Convergence Ratio (CCR) | X.XX | X.XX |
| Structural Entropy Index (SEI) | X.XX | X.XX |
| Refactor Pressure Score (RPS) | X | X |

---

## 6. Approval

| Role | Name | Decision | Date |
|------|------|----------|------|
| Proposed By | [name / engine] | — | [date] |
| Domain Owner | [name] | approve / reject / request_changes | [date] |
| Architecture Maintainer | [name] | approve / reject / request_changes | [date] |

---

## 7. Post-Merge Verification

After consolidation is complete, verify:

- [ ] All cluster members deleted or moved to `src/deprecated/`
- [ ] All callers updated to import canonical target
- [ ] Registry updated: cluster members marked `deprecated`, canonical promoted
- [ ] No orphan imports remain (verified by `grep`)
- [ ] Tests pass
- [ ] Scorecard metrics improved (CCR ↑, SEI ↓, RPS ↓)

---

## Appendix: Historical Consolidation Log

| Report ID | Cluster | Strategy | Status | Sprint | CCR Impact |
|-----------|---------|----------|--------|--------|------------|
| [uuid] | MetricCard (profile + layout) | extend | pending | N | +0.05 |
| [uuid] | WarmupCard (workout + intelligence) | absorb | pending | N | +0.03 |

---

*Template defined in: Architecture Self-Healing Layer Phase 5*
