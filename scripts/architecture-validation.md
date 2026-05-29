# Architecture Validation Pipeline

> Version: 1.0
> Phase: Architecture Execution Layer Phase 4
> Status: Conceptual specification — implementation in CI or pre-commit hook
> Source of truth: `/docs/ARCHITECTURE_EXECUTION_PROTOCOL.md`

---

## Pipeline Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ARCHITECTURE VALIDATION PIPELINE                     │
├─────────────────────────────────────────────────────────────────────────┤
│  Stage 1  →  Stage 2  →  Stage 3  →  Stage 4  →  Stage 5  →  Gate 6  │
│  File       Registry     Canonical    Similarity   Risk      Final     │
│  Creation   Cross-       Match       Heuristic     Domain    Decision  │
│  Scan       Check          Detection   Scan          Class.    Gate      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Stage 1: File Creation Scan

**Trigger**: Any commit or PR that adds, renames, or moves a file in `src/`.

**Inputs**:
- Diff of changed files (`git diff --name-status`)
- File extensions: `.tsx`, `.ts`, `.mdx`

**Process**:
1. Filter for additions (`A`), renames (`R`), or moves (`R` + `D`).
2. Exclude test files (`*.test.ts`, `*.test.tsx`, `*.spec.ts`).
3. Exclude `src/experimental/` and `src/deprecated/` — these are gated by separate rules.
4. Collect candidate file paths.

**Output**:
- List of candidate modules requiring validation.
- If empty -> pipeline exits with `PASS`.

**Example**:

```yaml
stage_1_output:
  candidates:
    - src/components/workout/NewRestTimer.tsx
    - src/app/profile/_components/BodyMetricTile.tsx
```

---

## Stage 2: Registry Cross-Check

**Trigger**: Receives candidate list from Stage 1.

**Inputs**:
- `docs/FEATURE_REGISTRY.md` (parsed canonical + secondary tables)
- Candidate file paths

**Process**:
1. For each candidate, search `FEATURE_REGISTRY.md` for exact or partial path match.
2. If found -> mark `registered: true`.
3. If not found -> mark `registered: false`.

**Output**:

```yaml
stage_2_output:
  checks:
    - file: src/components/workout/NewRestTimer.tsx
      registered: false
      action: BLOCK — requires registry update
    - file: src/app/profile/_components/BodyMetricTile.tsx
      registered: true
      action: PASS — proceed to Stage 3
```

**Failure behavior**:
- Any `registered: false` candidate -> pipeline emits `L2: ARCH-SOFT` violation.
- PR is blocked until registry updated.

---

## Stage 3: Canonical Match Detection

**Trigger**: Receives registered candidates from Stage 2.

**Inputs**:
- `docs/FEATURE_REGISTRY.md` canonical table
- Candidate file path and export name(s)

**Process**:
1. Parse candidate source file for default export name and/or named exports.
2. Search registry for canonical module with same or similar export name.
3. Check if candidate is in same feature domain as canonical.
4. Check if candidate file contains `// SECONDARY COMPONENT` header comment with canonical dependency.

**Output**:

```yaml
stage_3_output:
  checks:
    - file: src/components/workout/NewRestTimer.tsx
      export_name: NewRestTimer
      canonical_match:
        found: true
        canonical: src/components/workout/RestTimerPill.tsx
        domain_match: true
        secondary_declared: false
      action: BLOCK — L3 ARCH-DUPE
    - file: src/app/profile/_components/BodyMetricTile.tsx
      export_name: BodyMetricTile
      canonical_match:
        found: true
        canonical: src/components/layout/MetricCard.tsx
        domain_match: false
        secondary_declared: true
        dependency: src/components/layout/MetricCard.tsx
      action: PASS — secondary properly declared
```

**Failure behavior**:
- Canonical match found + no secondary declaration -> `L3: ARCH-DUPE` or `L4: ARCH-CANON`.

---

## Stage 4: Similarity Heuristic Scan

**Trigger**: Receives candidates that passed Stage 3 (or are marked secondary).

**Inputs**:
- Candidate source file (AST)
- All files in same feature domain directory

**Process**:
1. Parse candidate AST:
   - Extract exported component/function signatures.
   - Extract props interface/type names and fields.
   - Extract top-level rendered JSX tag patterns.
   - Extract import statements (what primitives it uses).
2. Compare against each file in same domain:
   - **Export name similarity**: string distance or exact match.
   - **Props overlap**: percentage of shared prop names.
   - **DOM structure overlap**: percentage of shared root tag patterns.
   - **Import overlap**: percentage of shared imports from `src/components/` or `src/lib/`.
3. Calculate weighted similarity score.

**Weights**:

| Factor | Weight | Rationale |
|--------|--------|-----------|
| Export name exact match | 40% | Strongest signal of duplication |
| Props overlap >60% | 30% | Same API = same purpose |
| DOM structure overlap >60% | 20% | Same rendered output |
| Import overlap >60% | 10% | Uses same building blocks |

**Output**:

```yaml
stage_4_output:
  checks:
    - file: src/components/workout/NewRestTimer.tsx
      comparisons:
        - vs: src/components/workout/RestTimerPill.tsx
          export_name_match: false
          props_overlap: 85%
          dom_overlap: 70%
          import_overlap: 90%
          weighted_score: 71%
      action: BLOCK — L3 ARCH-DUPE (>70%)
    - file: src/app/profile/_components/BodyMetricTile.tsx
      comparisons:
        - vs: src/components/layout/MetricCard.tsx
          export_name_match: false
          props_overlap: 45%
          dom_overlap: 30%
          import_overlap: 20%
          weighted_score: 23%
      action: PASS — below threshold
```

**Failure behavior**:
- Score 70-100% -> `L3: ARCH-DUPE`. Must extend, compose, or refactor.
- Score 41-69% -> `L2: ARCH-SOFT`. Requires explicit PR justification.
- Score 0-40% -> Pass.

---

## Stage 5: Risk Domain Classification

**Trigger**: Receives all candidates.

**Inputs**:
- Candidate file path and export name
- `/docs/ARCHITECTURE_ENFORCEMENT.md` §5 (high-risk domains)

**Process**:
1. Check if filename matches high-risk patterns:
   - `*Card.tsx` -> Card domain
   - `*Input*`, `*Field*`, `*Form*` -> Input domain
   - `*Picker*`, `*Selector*`, `*Search*` -> Picker domain
   - `*Island*`, `*Client*` -> Island/Client domain
   - `*Skeleton*` -> Skeleton domain
   - `*Metric*` -> Metric display domain
2. Check if candidate is in high-risk directory (e.g., `src/components/ui/` for input primitives).

**Output**:

```yaml
stage_5_output:
  checks:
    - file: src/components/workout/NewRestTimer.tsx
      risk_domain: none
      justification_required: false
      action: PASS
    - file: src/app/_home/NewStatsCard.tsx
      risk_domain: card_components
      justification_required: true
      action: FLAG — requires explicit PR justification
```

**Failure behavior**:
- High-risk domain + no PR justification -> `L2: ARCH-SOFT`.
- High-risk domain + new primitive (e.g., new generic `Input`) -> `L4: ARCH-CANON`.

---

## Stage 6: Final Decision Gate

**Trigger**: Receives outputs from Stages 2-5.

**Decision matrix**:

| Stage 2 | Stage 3 | Stage 4 | Stage 5 | Final Decision | Level |
|---------|---------|---------|---------|----------------|-------|
| PASS | PASS | PASS | PASS | **INTEGRATION PERMITTED** | — |
| FAIL | — | — | — | BLOCK — update registry | L2 |
| PASS | FAIL | — | — | BLOCK — declare secondary or use canonical | L3/L4 |
| PASS | PASS | FAIL (>70%) | — | BLOCK — extend/compose/refactor | L3 |
| PASS | PASS | SOFT (41-69%) | PASS | ALLOW with justification | L2 |
| PASS | PASS | PASS | FAIL (no justif.) | BLOCK — add justification | L2 |

**Output**:

```yaml
stage_6_output:
  decision: BLOCKED
  reasons:
    - level: L3
      code: ARCH-DUPE
      message: "NewRestTimer shares 71% similarity with RestTimerPill. Must extend RestTimerPill or justify override."
    - level: L2
      code: ARCH-SOFT
      message: "NewStatsCard is in high-risk card domain. Justification missing from PR description."
  required_actions:
    - "Extend src/components/workout/RestTimerPill.tsx with new variant, or log override."
    - "Add justification for NewStatsCard in PR description."
```

---

## Implementation Notes

### Recommended Implementation Order

1. **Stage 1 + Stage 2** (easiest) — file diff parser + markdown grep.
2. **Stage 5** (simple) — filename pattern matching.
3. **Stage 3** (medium) — AST export extraction + registry lookup.
4. **Stage 4** (hardest) — AST comparison heuristic. Start with export name + props overlap only.
5. **Stage 6** — decision matrix orchestrator.

### Technology Options

| Layer | Option A | Option B |
|-------|----------|----------|
| Pre-commit | `husky` + custom Node.js script | `lint-staged` + custom validator |
| CI | GitHub Actions workflow | Vercel deploy hook with check |
| AST parsing | `@babel/parser` or `typescript` compiler API | `swc` for speed |
| Registry storage | `FEATURE_REGISTRY.md` (source of truth) | JSON mirror generated at build time |

### Exit Codes

| Code | Meaning |
|------|---------|
| `0` | All gates passed |
| `1` | L1 warning only (non-blocking in CI, but bot posts comment) |
| `2` | L2 soft block (blocking in CI) |
| `3` | L3 hard block (blocking in CI) |
| `4` | L4 critical failure (blocking in CI) |

### Integration Points

| System | Hook Point | Behavior |
|--------|-----------|----------|
| Git pre-commit | `.husky/pre-commit` | Run Stage 1 + Stage 5 locally; fast feedback |
| GitHub Actions | `.github/workflows/architecture-check.yml` | Run full pipeline (Stages 1-6) on PR open/update |
| Vercel build | Build-time check | Run Stage 1 + Stage 2 + Stage 5 before `next build` |
| AI assistant | Prompt preamble | Inject canonical lookup rules before code generation |

---

*Defined in: Architecture Execution Layer Phase 4*
