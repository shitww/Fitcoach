# Architecture Self-Healing Engine

> Version: 1.0
> Phase: Architecture Self-Healing Layer Phase 5
> Status: Active Convergence Specification
> Authority: `/docs/ARCHITECTURE_EXECUTION_PROTOCOL.md`, `/docs/ARCHITECTURE_ENFORCEMENT.md`
> Principle: Architecture must not only prevent chaos — it must automatically eliminate structural redundancy.

---

## 1. Duplication Convergence Engine

When L3 duplication is detected by the Execution Protocol (`ARCH-DUPE`), the system MUST NOT only block. It must produce a **convergence recommendation** that proposes a path to eliminate the duplication.

### 1.1 Convergence Output Format

Every L3 detection automatically generates:

```
╔══════════════════════════════════════════════════════════════╗
║           DUPLICATION CONVERGENCE RECOMMENDATION             ║
╠══════════════════════════════════════════════════════════════╣
║ Detected Modules:                                            ║
║   • [module A path]                                          ║
║   • [module B path]                                          ║
║   • [module C path] (if cluster > 2)                       ║
╠══════════════════════════════════════════════════════════════╣
║ Suggested Canonical: [path to target canonical module]       ║
║ Merge Strategy: extend | absorb | replace                    ║
╠══════════════════════════════════════════════════════════════╣
║ API Unification Plan:                                        ║
║   • Unified Props Interface: [interface name]                ║
║   • Shared Logic Extracted To: [lib path]                    ║
║   • Preserved Differences: [list of domain-specific props]   ║
╠══════════════════════════════════════════════════════════════╣
║ File Consolidation Target:                                   ║
║   • Merge Into: [canonical file path]                       ║
║   • Delete After Migration: [duplicate file paths]          ║
║   • Move To Deprecated: [date]                               ║
╠══════════════════════════════════════════════════════════════╣
║ Migration Steps:                                               ║
║   1. [step]                                                  ║
║   2. [step]                                                  ║
║   3. [step]                                                  ║
╠══════════════════════════════════════════════════════════════╣
║ Estimated Impact:                                            ║
║   • Files Removed: N                                         ║
║   • Callers Updated: N                                       ║
║   • Lines of Code Reduced: ~N                                ║
║   • Risk Level: low | medium | high                          ║
╚══════════════════════════════════════════════════════════════╝
```

### 1.2 Merge Strategies

| Strategy | When to Use | Example |
|----------|-------------|---------|
| **EXTEND** | Canonical is close; duplicate adds 1-2 props or a sub-variant | Add `timeText` prop to existing `MetricCard` family |
| **ABSORB** | Canonical is larger; duplicate logic fits inside it as a variant | Merge standalone `WarmupCard` logic into intelligence `WarmupCard` as fallback mode |
| **REPLACE** | Duplicate is strictly better; canonical is obsolete | Promote `intelligence/WarmupCard` to canonical; demote `workout/WarmupCard` |

### 1.3 API Unification Plan Template

```typescript
// UNIFIED PROPS INTERFACE (proposed)
interface Unified[ComponentName]Props {
  // --- Core props (from canonical) ---
  label: string;
  value: string | number;
  // --- Merged props (from duplicates) ---
  timeText?: string;       // from profile/MetricCard
  unit?: string;           // from layout/MetricCard
  onClick?: () => void;    // from profile/MetricCard
  // --- Variant discriminator ---
  variant: 'hero' | 'compact' | 'inline' | 'tile';
}
```

---

## 2. Canonical Evolution Rule

### 2.1 Trigger Condition

When **3 or more secondary components** depend on similar logic within the same feature domain, the system triggers a **Canonical Promotion Suggestion**.

**Detection heuristic**:
- 3+ files in `src/components/` or `src/app/**/_components/` share >50% prop names.
- 3+ files import from the same 2+ `lib/` modules.
- 3+ files render structurally similar DOM (same root tags, same CSS utility patterns).

### 2.2 Evolution Process

```
DETECTED: 3+ secondary components with shared logic
├── Step 1: Extract Common Abstraction
│   └── Identify shared props, hooks, and render patterns
├── Step 2: Propose New Canonical Candidate
│   └── Candidate path: src/components/[Domain][Pattern].tsx
│   └── Candidate API: unified interface covering all 3+ variants
├── Step 3: Evaluate Migration Cost
│   └── Count callers of each secondary component
│   └── Estimate refactoring effort
├── Step 4: Suggest Deprecating Fragmented Modules
│   └── Mark secondaries as `deprecated: pending_migration`
│   └── Add `replaced_by` to registry
└── Step 5: Generate Canonical Consolidation Report
    └── Output to /docs/CANONICAL_CONSOLIDATION_REPORT.md
```

### 2.3 Canonical Lifecycle

```
┌──────────────────────────────────────────────────────────────┐
│                    CANONICAL LIFECYCLE                        │
├──────────────────────────────────────────────────────────────┤
│  [Discovery]  →  [Proposal]  →  [Migration]  →  [Stable]     │
│      │              │              │              │          │
│      ▼              ▼              ▼              ▼          │
│  3+ secondaries   Report      Move files    Canonical only   │
│  detected         generated   updated       registry clean    │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Drift Repair System

### 3.1 Trigger

When **Registry Drift Index** (`M6` from Execution Protocol) exceeds **5%**, the Drift Repair System activates.

### 3.2 Auto-Fix Suggestion

```
╔══════════════════════════════════════════════════════════════╗
║           ARCHITECTURE DRIFT AUTO-FIX SUGGESTION             ║
╠══════════════════════════════════════════════════════════════╣
║ Drift Index: X.X% (threshold: 5%)                           ║
║ Orphan Modules Detected: N                                  ║
╠══════════════════════════════════════════════════════════════╣
║ Clustering Analysis:                                         ║
║   Cluster A: [list of similar orphan modules]               ║
║     → Suggested Canonical: [path]                           ║
║     → Regrouping Target: [new or existing domain]           ║
║   Cluster B: [list]                                          ║
║     → Suggested Canonical: [path]                           ║
╠══════════════════════════════════════════════════════════════╣
║ Registry Restructuring Patch:                                ║
║   • Add [N] new canonical entries                            ║
║   • Merge [N] duplicate domains                              ║
║   • Deprecate [N] orphaned modules                           ║
║   • Update [N] secondary declarations                        ║
╠══════════════════════════════════════════════════════════════╣
║ Recommended Priority: P0 | P1 | P2                           ║
╚══════════════════════════════════════════════════════════════╝
```

### 3.3 Clustering Rules

Orphan modules are grouped by:

1. **Export name similarity** (>60% string match)
2. **Import overlap** (share >3 imports from same `lib/` or `components/` paths)
3. **Directory proximity** (same parent folder or sibling feature domain)
4. **Props overlap** (>40% shared prop names)

Each cluster is presented with a **suggested canonical** and a **regrouping target**.

---

## 4. Self-Healing Triggers

The Self-Healing Engine activates under the following conditions. Each trigger produces a **recommendation ticket** (not a block) that is queued for human review.

### 4.1 Trigger Matrix

| Trigger | Condition | Engine Action | Priority |
|---------|-----------|---------------|----------|
| **T1: Repeated L3** | Same L3 duplication pattern occurs ≥2 times within 4 sprints | Generate consolidation report; propose canonical merge | P0 |
| **T2: Pattern Sprawl** | Same UI pattern appears in 3+ files without canonical | Trigger canonical evolution; propose new canonical candidate | P1 |
| **T3: Drift Threshold** | Registry drift index > 5% | Activate drift repair; suggest registry restructuring | P1 |
| **T4: Orphan Growth** | Orphan modules increase by ≥2 in a single sprint | Cluster orphans; suggest canonical homes or deprecation | P2 |
| **T5: Secondary Bloat** | Secondary system count exceeds canonical count in any domain | Flag domain for canonical promotion review | P1 |
| **T6: High-Risk Invasion** | New component in high-risk domain survives 3+ sprints without canonical justification | Auto-suggest absorption into existing canonical or formal override log | P2 |

### 4.2 Recommendation Ticket Format

```markdown
## Self-Healing Recommendation — [T1/T2/T3/T4/T5/T6]

- **Trigger ID**: [auto-generated UUID]
- **Detected**: [ISO timestamp]
- **Affected Domain**: [feature domain from registry]
- **Trigger**: [T1-T6 description]
- **Current State**: [what the system observed]
- **Recommended Action**: [specific convergence or evolution step]
- **Expected Outcome**: [canonical count ↑, duplication risk ↓, entropy ↓]
- **Sprint Target**: [sprint N or N+1]
- **Owner**: [architecture maintainer or domain owner]
```

---

## 5. Non-Blocking Recommendation Mode

### 5.1 Dual Output Mode

Phase 4 produces **BLOCK** decisions. Phase 5 produces **BLOCK + RECOMMENDATION**.

Every L2/L3/L4 event now generates **two** artifacts:

1. **Enforcement Decision** (from Phase 4) — unchanged
2. **Healing Recommendation** (from Phase 5) — new

### 5.2 Recommendation Template

```
┌─────────────────────────────────────────────────────────────┐
│  ENFORCEMENT DECISION (Phase 4)                            │
├─────────────────────────────────────────────────────────────┤
│  STATUS: BLOCKED (L3 — ARCH-DUPE)                         │
│  REASON: NewRestTimer shares 71% similarity with           │
│          RestTimerPill                                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  HEALING RECOMMENDATION (Phase 5)                          │
├─────────────────────────────────────────────────────────────┤
│  → Recommended Canonical Merge Path Exists                  │
│  → Strategy: EXTEND RestTimerPill with `variant: 'full'`    │
│  → Suggest consolidation within 2 sprints                   │
│  → Estimated code reduction: ~40 lines                      │
│  → Canonical Consolidation Report: [link]                 │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 Sprint Integration

Self-healing recommendations are **non-blocking** but **tracked**:

- Each recommendation receives a ticket ID.
- Tickets are reviewed in the sprint retrospective.
- Unresolved P0 recommendations block the next release until acknowledged.
- Unresolved P1/P2 recommendations are escalated if they recur.

---

## 6. Architecture Convergence Metrics

These metrics complement the Phase 4 Health Metrics (`M1-M6`). They measure **convergence velocity** and **structural entropy reduction**.

### C1: Canonical Convergence Ratio (CCR)

**Definition**: The ratio of canonical module usage to total similar-component usage.

**Formula**:
```
CCR = canonical_import_count / (canonical_import_count + duplicate_import_count)
```

**Interpretation**:
- `CCR = 1.0` — Perfect convergence. All usage flows through canonical.
- `CCR < 0.7` — Warning. Significant usage bypasses canonical.
- `CCR < 0.5` — Critical. Canonical is not authoritative; fragmentation.

**Target**: `CCR >= 0.9` for all high-risk domains.

---

### C2: Duplication Half-Life (DHL)

**Definition**: The average number of sprints required to resolve a detected duplication from first L3 flag to canonical merge completion.

**Formula**:
```
DHL = sum(sprints_to_resolve_each_L3) / total_L3_resolved
```

**Interpretation**:
- `DHL <= 1` — Excellent. Duplicates resolved within same sprint.
- `DHL = 2` — Acceptable.
- `DHL > 3` — Poor. Duplicates linger; technical debt accumulates.

**Target**: `DHL <= 2 sprints`.

---

### C3: Structural Entropy Index (SEI)

**Definition**: A measure of how fragmented the UI system is across feature domains. Higher entropy = more chaos.

**Formula**:
```
SEI = sum_over_domains(
  (unique_component_names_in_domain / total_components_in_domain)
  * log(unique_component_names_in_domain)
)
```

Simplified operational definition:
```
SEI = (total_unique_components / total_feature_domains)
      / (total_canonical_components)
```

**Interpretation**:
- `SEI` decreasing over time = architecture is converging.
- `SEI` increasing = new components are not consolidating into canonicals.
- `SEI` flat with growing codebase = healthy scaling.

**Target**: SEI should decrease by at least 5% per quarter.

---

### C4: Refactor Pressure Score (RPS)

**Definition**: The cumulative unresolved L2/L3 violation debt over time.

**Formula**:
```
RPS = (unresolved_L2_count * 1) + (unresolved_L3_count * 3) + (unresolved_L4_count * 10)
```

**Interpretation**:
- `RPS = 0` — No pressure. Architecture is clean.
- `RPS 1-10` — Low pressure. Manageable backlog.
- `RPS 11-30` — Medium pressure. Dedicated refactor sprint recommended.
- `RPS > 30` — High pressure. Stop feature work; converge architecture first.

**Target**: `RPS < 10` at all times.

---

## 7. Convergence Scorecard Template

Extend the Phase 4 Health Scorecard with Phase 5 Convergence Metrics:

```markdown
## Architecture Convergence Scorecard — Sprint [N]

### Phase 4 Health (Prevent)
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Canonical systems | 24 | stable | 🟢 |
| Secondary systems | 3 | <5 | 🟢 |
| Duplication risk score | 12 | decreasing | 🟡 |
| Orphan modules | 2 | 0 | 🔴 |
| Similarity violations (L3/L4) | 0 | 0 | 🟢 |
| Registry drift index | 4.2% | <5% | 🟢 |

### Phase 5 Convergence (Heal)
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Canonical Convergence Ratio (CCR) | 0.94 | >= 0.90 | 🟢 |
| Duplication Half-Life (DHL) | 1.5 | <= 2 | 🟢 |
| Structural Entropy Index (SEI) | 2.1 | decreasing | 🟡 |
| Refactor Pressure Score (RPS) | 4 | < 10 | 🟢 |
| Open self-healing tickets | 2 | 0 P0 | 🟡 |
| Sprints since last canonical promotion | 3 | < 6 | 🟢 |
```

---

## 8. Relationship to Phase 1–4

| Phase | Role | Self-Healing Layer Interaction |
|-------|------|--------------------------------|
| **Phase 1** | Constitution | Defines rules that Self-Healing enforces convergence toward |
| **Phase 2** | Convergence | Decisions that Self-Healing automatically proposes and tracks |
| **Phase 3** | Enforcement | Gates that Self-Healing observes; L3 flags trigger convergence engine |
| **Phase 4** | Execution | Block decisions remain unchanged; Self-Healing adds recommendations on top |
| **Phase 5** | Self-Healing | Convergence recommendations, canonical evolution, drift repair |

**Critical Invariant**: Phase 5 NEVER overrides Phase 4 block decisions. It only adds a **recommendation layer** that helps humans resolve the root cause of the block faster.

---

## 9. Amendment

This engine specification may be amended only by:
1. Proposal in a dedicated PR modifying this file.
2. Update to `CANONICAL_CONSOLIDATION_REPORT.md` if report format changes.
3. Approval by an architecture maintainer.

---

*Activated from: Architecture Self-Healing Layer Phase 5*
