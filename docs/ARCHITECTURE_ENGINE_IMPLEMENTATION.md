# Architecture Engine Implementation Spec

> Version: 2.0 (Final)
> Status: Frozen Specification — ready for implementation
> Stack: TypeScript / Node.js
> Est. Implementation Time: 10–14 days (1 engineer)

---

## A. SYSTEM ARCHITECTURE (Runtime View)

### A.1 Data Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Git Diff      │────▶│  Architecture    │────▶│   PR Comment    │
│   (changed      │     │  Engine (Node)   │     │   + Markdown    │
│    files)       │     │                  │     │   Report        │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │  FEATURE_        │
                        │  REGISTRY.md     │
                        │  (read +         │
                        │   validate)      │
                        └──────────────────┘
```

### A.2 Input / Output Contract

**INPUT** (deterministic, always available):

```typescript
interface EngineInput {
  /** Files added/modified in the PR (from `git diff --name-status`) */
  changedFiles: Array<{ path: string; status: 'A' | 'M' | 'R' }>;
  /** Full file contents of changed files */
  fileContents: Map<string, string>;
  /** Parsed FEATURE_REGISTRY.md (cached) */
  registry: Registry;
  /** All source files in src/ (for similarity comparison) */
  allSourceFiles: Array<{ path: string; content: string }>;
}
```

**OUTPUT** (always produced, never empty):

```typescript
interface EngineOutput {
  /** Blocking violations (must be resolved before merge) */
  blocks: Violation[];
  /** Warnings (non-blocking, but require justification) */
  warnings: Violation[];
  /** Self-healing recommendations (always generated alongside blocks) */
  recommendations: Recommendation[];
  /** Proposed registry diff (if new files detected) */
  registryDiff: string | null;
  /** Overall pass/fail */
  pass: boolean;
}
```

### A.3 Registry Data Structure

The registry is parsed from markdown into a typed structure at runtime:

```typescript
interface Registry {
  features: Feature[];
  canonicalDecisions: CanonicalDecision[];
}

interface Feature {
  name: string;           // e.g., "Workout Session"
  entryPoints: string[];  // e.g., ["src/app/workout/page.tsx"]
  coreComponents: string[];
  canonicalModules: ModuleRef[];
  secondaryModules: ModuleRef[];
  duplicationRisk: 'low' | 'medium' | 'high';
  allowedSecondaries: string[];
}

interface ModuleRef {
  path: string;
  exportName: string;
  role: 'canonical' | 'secondary';
  canonicalDependency?: string; // for secondaries
}

interface CanonicalDecision {
  path: string;
  isCanonical: boolean;
  replacedBy?: string;
  notes: string;
}
```

### A.4 Core Design Principle

> **The engine is a pure function**: `EngineInput -> EngineOutput`. No side effects. No network calls. No mutable state. This makes it testable, cacheable, and runnable in CI or locally.

---

## B. PIPELINE DESIGN (Step-by-Step Execution)

### B.1 Stage 1: File Filter

**Purpose**: Narrow the changed files to only those the engine cares about.

**Algorithm**:

```typescript
function filterRelevantFiles(files: ChangedFile[]): string[] {
  return files
    .filter(f => f.path.startsWith('src/'))
    .filter(f => /\.(tsx?|mdx)$/.test(f.path))
    .filter(f => !f.path.includes('.test.'))
    .filter(f => !f.path.includes('.spec.'))
    .filter(f => !f.path.startsWith('src/experimental/'))
    .filter(f => !f.path.startsWith('src/deprecated/'))
    .map(f => f.path);
}
```

**Output**: `candidatePaths: string[]` — may be empty (ends pipeline early with `pass: true`).

---

### B.2 Stage 2: Registry Validation

**Purpose**: Check if every candidate file is registered.

**Algorithm**:

```typescript
function validateRegistry(
  candidatePaths: string[],
  registry: Registry
): Violation[] {
  const registeredPaths = new Set([
    ...registry.features.flatMap(f => f.coreComponents),
    ...registry.features.flatMap(f => f.canonicalModules.map(m => m.path)),
    ...registry.features.flatMap(f => f.secondaryModules.map(m => m.path)),
    ...registry.canonicalDecisions.map(d => d.path),
  ]);

  return candidatePaths
    .filter(path => !registeredPaths.has(path))
    .map(path => ({
      level: 'L2' as const,
      code: 'ARCH-SOFT',
      file: path,
      message: `File not in FEATURE_REGISTRY.md. Add it or move to src/experimental/.`,
    }));
}
```

**Computability**: Deterministic. O(N) string lookup.

---

### B.3 Stage 3: Canonical Collision Detection

**Purpose**: Detect when a new file uses the same export name as an existing canonical module in the same domain.

**Algorithm**:

```typescript
function detectCanonicalCollisions(
  candidates: Array<{ path: string; content: string }>,
  registry: Registry
): Violation[] {
  const violations: Violation[] = [];

  for (const file of candidates) {
    const exportName = extractDefaultExport(file.content)
      ?? extractNamedExports(file.content)[0];
    if (!exportName) continue;

    // Find canonical modules in same domain (same parent directory or feature)
    const domain = file.path.split('/').slice(0, 3).join('/'); // e.g., src/components/workout
    const canonicalsInDomain = registry.features
      .filter(f => f.coreComponents.some(c => c.startsWith(domain)))
      .flatMap(f => f.canonicalModules);

    const collision = canonicalsInDomain.find(c => {
      // Same export name = high-confidence collision
      // Similar name (Levenshtein < 3) = soft collision
      return c.exportName === exportName || levenshtein(c.exportName, exportName) < 3;
    });

    if (collision) {
      // Check if file declares itself as secondary
      const isSecondary = file.content.includes('SECONDARY COMPONENT')
        && file.content.includes(collision.path);

      if (!isSecondary) {
        violations.push({
          level: 'L3',
          code: 'ARCH-DUPE',
          file: file.path,
          canonical: collision.path,
          exportName,
          message: `Export "${exportName}" collides with canonical ${collision.path}. Declare as SECONDARY or extend canonical.`,
        });
      }
    }
  }

  return violations;
}
```

**Computability**: Deterministic. Export extraction via simple regex or lightweight parser. Levenshtein distance is O(n*m).

---

### B.4 Stage 4: Similarity Scoring

**Purpose**: Compute a concrete similarity score between a candidate and existing files in the same domain.

**Algorithm**:

```typescript
interface SimilarityScore {
  candidatePath: string;
  targetPath: string;
  exportNameMatch: boolean;
  propsOverlapPercent: number;
  sharedImportsPercent: number;
  weightedScore: number; // 0–100
}

function computeSimilarity(
  candidate: { path: string; content: string },
  existingFiles: Array<{ path: string; content: string }>
): SimilarityScore[] {
  const candidateProps = extractPropsInterface(candidate.content);
  const candidateImports = extractImports(candidate.content);
  const candidateExport = extractDefaultExport(candidate.content)
    ?? extractNamedExports(candidate.content)[0];

  return existingFiles
    .filter(f => f.path !== candidate.path)
    .filter(f => isInSameDomain(f.path, candidate.path))
    .map(target => {
      const targetProps = extractPropsInterface(target.content);
      const targetImports = extractImports(target.content);
      const targetExport = extractDefaultExport(target.content)
        ?? extractNamedExports(target.content)[0];

      const exportNameMatch = candidateExport === targetExport;
      const propsOverlap = jaccardSimilarity(
        new Set(candidateProps),
        new Set(targetProps)
      );
      const importOverlap = jaccardSimilarity(
        new Set(candidateImports),
        new Set(targetImports)
      );

      const weightedScore = Math.round(
        (exportNameMatch ? 40 : 0) +
        (propsOverlap * 30) +
        (importOverlap * 10) +
        (sharedLinePatterns(candidate.content, target.content) * 20)
      );

      return { candidatePath: candidate.path, targetPath: target.path, exportNameMatch, propsOverlapPercent: Math.round(propsOverlap * 100), sharedImportsPercent: Math.round(importOverlap * 100), weightedScore };
    })
    .filter(s => s.weightedScore > 0)
    .sort((a, b) => b.weightedScore - a.weightedScore);
}

// Helpers
function jaccardSimilarity<T>(a: Set<T>, b: Set<T>): number {
  const intersection = new Set([...a].filter(x => b.has(x)));
  const union = new Set([...a, ...b]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

function sharedLinePatterns(a: string, b: string): number {
  // Simple heuristic: count shared CSS class patterns, shared tag sequences
  const aClasses = extractClassNames(a);
  const bClasses = extractClassNames(b);
  return jaccardSimilarity(new Set(aClasses), new Set(bClasses));
}
```

**Thresholds** (deterministic, no ambiguity):

| Weighted Score | Action | Level |
|----------------|--------|-------|
| 0–40 | Ignore | — |
| 41–69 | Warning + require justification | L2 |
| 70–100 | Block + generate merge recommendation | L3 |

**Computability**: Fully deterministic. All inputs are file contents. No external dependencies.

---

### B.5 Stage 5: High-Risk Domain Check

**Purpose**: Flag components in known high-risk duplication domains.

**Algorithm**:

```typescript
const HIGH_RISK_PATTERNS = [
  { regex: /Card\.tsx?$/, domain: 'card' },
  { regex: /Input|Field|Form/, domain: 'input' },
  { regex: /Picker|Selector|Search/, domain: 'picker' },
  { regex: /Island|Client/, domain: 'island' },
  { regex: /Skeleton/, domain: 'skeleton' },
  { regex: /Metric/, domain: 'metric' },
];

function checkHighRiskDomains(
  candidates: Array<{ path: string; content: string }>,
  registry: Registry
): Violation[] {
  return candidates
    .filter(c => HIGH_RISK_PATTERNS.some(p => p.regex.test(c.path)))
    .filter(c => {
      // Is this an extension of an existing canonical?
      const domain = HIGH_RISK_PATTERNS.find(p => p.regex.test(c.path))!.domain;
      const feature = registry.features.find(f =>
        f.canonicalModules.some(m => m.path.includes(domain))
      );
      // If no canonical exists in this domain, it's a new primitive → L4
      // If canonical exists but file doesn't reference it → L2 (warn)
      const importsCanonical = feature?.canonicalModules.some(m =>
        c.content.includes(m.path)
      );
      return !importsCanonical;
    })
    .map(c => {
      const isNewPrimitive = !registry.features.some(f =>
        f.canonicalModules.some(m => c.path.includes(m.path.split('/').pop()!))
      );
      return {
        level: isNewPrimitive ? 'L4' : 'L2' as const,
        code: isNewPrimitive ? 'ARCH-CANON' : 'ARCH-SOFT',
        file: c.path,
        message: isNewPrimitive
          ? `New high-risk primitive in forbidden domain. Must extend existing canonical or log override.`
          : `High-risk component should reference existing canonical or provide justification.`,
      };
    });
}
```

**Computability**: Deterministic. Regex match + string inclusion check.

---

### B.6 Stage 6: Forbidden Naming Check

**Purpose**: Reject filenames that indicate copy/paste duplication.

**Algorithm**:

```typescript
const FORBIDDEN_PATTERNS = [
  /V2$/i, /v2$/i, /Copy/i, /New/i, /Final/i, /Enhanced/i, /Improved/i, /Alt$/i,
];

function checkForbiddenNames(files: Array<{ path: string }>): Violation[] {
  const basename = (p: string) => p.split('/').pop()!;
  return files
    .filter(f => FORBIDDEN_PATTERNS.some(p => p.test(basename(f.path))))
    .map(f => ({
      level: 'L4' as const,
      code: 'ARCH-CANON',
      file: f.path,
      message: `Forbidden naming pattern detected in filename. Rename to reflect purpose, not version.`,
    }));
}
```

---

### B.7 Stage 7: Recommendation Generator

**Purpose**: For every L3 block, produce a concrete consolidation recommendation.

**Algorithm**:

```typescript
function generateRecommendations(
  violations: Violation[],
  similarities: SimilarityScore[]
): Recommendation[] {
  return violations
    .filter(v => v.level === 'L3')
    .map(v => {
      const bestMatch = similarities.find(s => s.candidatePath === v.file);
      if (!bestMatch) return null;

      const strategy = bestMatch.propsOverlapPercent > 80 ? 'absorb'
        : bestMatch.propsOverlapPercent > 50 ? 'extend'
        : 'replace';

      return {
        ticketId: `HEAL-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        trigger: 'T1',
        domain: v.file.split('/')[2], // e.g., "workout"
        detectedFiles: [v.file, bestMatch.targetPath],
        suggestedCanonical: bestMatch.targetPath,
        mergeStrategy: strategy,
        steps: [
          `Compare props of ${v.file} and ${bestMatch.targetPath}`,
          `Merge ${v.file} into ${bestMatch.targetPath} using strategy: ${strategy}`,
          `Update callers to use unified component`,
          `Delete ${v.file} and update registry`,
        ],
        estimatedCodeReduction: estimateLines(v.file),
        riskLevel: bestMatch.weightedScore > 90 ? 'high' : 'medium',
      };
    })
    .filter(Boolean) as Recommendation[];
}
```

---

### B.8 Stage 8: Registry Diff Generator

**Purpose**: If new files are valid (justified), propose the exact markdown to append.

**Algorithm**:

```typescript
function generateRegistryDiff(
  newFiles: Array<{ path: string; content: string }>,
  featureName: string
): string {
  return newFiles.map(f => {
    const exportName = extractDefaultExport(f.content) ?? 'Unknown';
    return `
| **New Component** | \`${f.path}\` — ${exportName} |
| **Enforcement Status** | Active |
| **Duplication Risk** | Low |
| **Allowed Secondary Components** | None. |
`;
  }).join('\n');
}
```

---

## C. MODULE BREAKDOWN (Engine Components)

### C.1 Package Structure

```
packages/
  architecture-engine/
    src/
      index.ts              # Public API: runEngine(input) -> output
      pipeline.ts           # Orchestrates stages 1-8
      stages/
        01-filter.ts        # File filter
        02-registry.ts      # Registry validation
        03-canonical.ts     # Canonical collision
        04-similarity.ts    # Similarity scoring
        05-risk-domain.ts   # High-risk check
        06-naming.ts        # Forbidden naming
        07-recommend.ts     # Recommendation gen
        08-registry-diff.ts # Diff generation
      parsers/
        extract-exports.ts  # AST-lite export extraction
        extract-props.ts    # Props interface extraction
        extract-imports.ts  # Import path extraction
        parse-registry.ts   # FEATURE_REGISTRY.md -> Registry object
      utils/
        levenshtein.ts      # String distance
        jaccard.ts          # Set similarity
        domain-matcher.ts   # Same-domain detection
      types.ts              # All TypeScript interfaces
    tests/
      fixtures/             # Sample TSX files for tests
      pipeline.test.ts
      similarity.test.ts
    tsconfig.json
    package.json
```

### C.2 Key Modules

| Module | Purpose | Lines (est.) | Complexity |
|--------|---------|-------------|------------|
| `parse-registry.ts` | Parse markdown tables into typed Registry | 80 | Low |
| `extract-exports.ts` | Find `export default` / `export function` via regex | 40 | Low |
| `extract-props.ts` | Find `interface Props` / `type Props` fields | 60 | Medium |
| `extract-imports.ts` | Find `import { ... } from '...'` paths | 30 | Low |
| `04-similarity.ts` | Score computation | 100 | Medium |
| `pipeline.ts` | Stage orchestration | 60 | Low |
| `index.ts` | Public API | 30 | Low |

**Total estimated code**: ~600 lines of TypeScript. ~400 lines of tests. ~200 lines of fixtures.

### C.3 No-Dependency Design

The engine uses **zero npm dependencies** (other than TypeScript itself):

- No heavy AST parser (Babel/TS compiler API). Uses regex + string analysis for exports, props, imports.
- No graph database. Uses in-memory Sets and Maps.
- No markdown parser. Uses line-by-line scanning for registry tables.

**Rationale**: The inputs are simple enough (React components, structured markdown) that regex is sufficient, fast, and has no install overhead. If we later need true AST accuracy, we can swap `extract-exports.ts` for `@babel/parser` without changing the pipeline.

---

## D. MINIMAL VIABLE IMPLEMENTATION PLAN (MVP)

### Sprint 1 (Days 1–5): Core Detection

| Day | Task | Deliverable |
|-----|------|-------------|
| 1 | Scaffold package, types, parse-registry | `Registry` object from markdown |
| 2 | extract-exports, extract-props, extract-imports | 3 parser modules + tests |
| 3 | Stage 2 (registry validation) + Stage 3 (canonical collision) | 2 stages + tests |
| 4 | Stage 4 (similarity scoring) | Similarity scores + tests |
| 5 | Stage 5 (risk domain) + Stage 6 (naming) | 2 stages + tests |

### Sprint 2 (Days 6–10): Recommendations + Integration

| Day | Task | Deliverable |
|-----|------|-------------|
| 6 | Stage 7 (recommendation generator) | Merge suggestions + tests |
| 7 | Stage 8 (registry diff) + pipeline orchestration | Full pipeline + tests |
| 8 | CLI wrapper (`npx architecture-engine --diff src/`) | Runnable command |
| 9 | GitHub Action workflow (`.github/workflows/architecture.yml`) | CI integration |
| 10 | PR comment formatter (markdown output) | Human-readable reports |

### Day 11–14: Polish & Validation

- Run against actual FitCoach codebase
- Tune thresholds (40/70 split) based on real data
- Add 3 real-world test fixtures from FitCoach duplicates
- Document false-positive handling

### MVP Success Criteria (checklist)

- [ ] Running `npx architecture-engine` on FitCoach `src/` produces a report in < 5 seconds
- [ ] Report correctly flags `src/components/workout/WarmupCard.tsx` as L3 collision with `src/components/workout/intelligence/WarmupCard.tsx`
- [ ] Report correctly flags `src/app/profile/_components/MetricCard.tsx` as L3 collision with `src/components/layout/MetricCard.tsx`
- [ ] Report correctly flags any new `*Card.tsx` without canonical reference as L2/L4
- [ ] Report generates a `CANONICAL_CONSOLIDATION_REPORT.md` entry for each L3
- [ ] CI fails the PR if any L3 or L4 exists
- [ ] CI warns (but passes) if only L2 exists with justification

---

## E. DEPRECATION LIST (Conceptual Elements Not Implemented)

The following elements from Phases 1–5 are **retained as documentation context** but are **not implemented in the engine** because they are either not directly computable or are redundant with simpler mechanisms:

| Concept | Phase | Why Deprecated | Replacement |
|---------|-------|---------------|-------------|
| **Structural Entropy Index (SEI)** | 5 | Abstract metric; no deterministic computation path | Use CCR (canonical import ratio) + file count per domain |
| **Duplication Half-Life (DHL)** | 5 | Requires historical tracking database; not useful for blocking | Track via git history manually; not in v1 engine |
| **Refactor Pressure Score (RPS)** | 5 | Weighted sum is arbitrary; same info is in violation count | Simple count: `unresolved L2 + L3 + L4` |
| **T2 Pattern Sprawl trigger** | 5 | Requires detecting "same pattern" across files without names; too fuzzy | Covered by similarity scoring (Stage 4) |
| **T4 Orphan Growth trigger** | 5 | Orphan detection requires import graph analysis (v2 feature) | Manual audit quarterly |
| **T5 Secondary Bloat trigger** | 5 | Count comparison is trivial but action is human decision | Surface in scorecard, not auto-trigger |
| **T6 High-Risk Invasion trigger** | 5 | Same as Stage 5; no additional value | Covered by Stage 5 |
| **ASCII art output boxes** | 4–5 | Not machine-parseable; markdown tables are better | Markdown tables in PR comments |
| **Canonical Evolution Rule "3+ secondaries"** | 5 | Requires historical trend detection; v2 feature | Manual review when secondary count grows |
| **Drift Repair System auto-clustering** | 5 | Requires import graph + clustering algorithm | Manual clustering in v1; registry diff suggests groups |

### What IS Implemented (Deterministic Rules Only)

| Rule | Implementation | Stage |
|------|---------------|-------|
| Registry check (unregistered file) | `Set.has(path)` | 2 |
| Canonical collision (same export name) | Export extraction + string match | 3 |
| Similarity > 70% block | Weighted score: export (40) + props (30) + imports (10) + classes (20) | 4 |
| High-risk domain flag | Regex on filename | 5 |
| Forbidden naming | Regex on filename | 6 |
| Merge recommendation | Strategy selection based on props overlap | 7 |
| Registry diff generation | String template | 8 |

---

## F. Running the Engine

### Local (pre-commit)

```bash
# Install
pnpm add -D @fitcoach/architecture-engine

# Run on changed files only
npx architecture-engine --diff $(git diff --name-only HEAD)

# Run on full codebase
npx architecture-engine --scan src/
```

### CI (GitHub Actions)

```yaml
# .github/workflows/architecture.yml
name: Architecture Check
on: [pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm architecture-engine --diff ${{ github.event.pull_request.changed_files }}
      - if: failure()
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: require('./architecture-report.md')
            })
```

### Output Example

```markdown
## Architecture Check Report

### Blocks (must resolve)

| Level | File | Code | Message |
|-------|------|------|---------|
| L3 | `src/components/workout/WarmupCard.tsx` | ARCH-DUPE | Export "WarmupCard" collides with canonical `src/components/workout/intelligence/WarmupCard.tsx`. |

### Warnings

| Level | File | Code | Message |
|-------|------|------|---------|
| L2 | `src/app/_home/NewStatsCard.tsx` | ARCH-SOFT | High-risk component should reference existing canonical or provide justification. |

### Recommendations

| Ticket | Strategy | Target | Steps |
|--------|----------|--------|-------|
| HEAL-abc123 | absorb | `intelligence/WarmupCard.tsx` | 1. Compare props... 2. Merge... 3. Update callers... |

### Registry Diff

Add to FEATURE_REGISTRY.md under "Workout Session":

```markdown
| **Secondary WarmupCard** | `src/components/workout/WarmupCard.tsx` — ... |
```

---

*Engine v2.0 | Runtime: 1.2s | Files scanned: 340*
```

---

## G. Amendment Policy (Frozen)

This specification is frozen at v2.0. Changes require:
1. A PR that modifies this file.
2. Evidence that the change is required by a real false positive or false negative from the MVP.
3. Approval by architecture maintainer.

No new metrics, triggers, or conceptual layers may be added without removing an equivalent complexity item from the deprecation list.

---

*Frozen: Architecture Engine Implementation Spec v2.0*
