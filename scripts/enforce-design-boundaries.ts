// ═══════════════════════════════════════════════════════════════
// Design Boundary Enforcement Scanner
// KERNEL-LEVEL ARCHITECTURE GUARD
//
// Scans src/ for cross-domain violations:
// - theme importing visualization
// - primitives importing visualization
// - visualization colors used in UI components
// - hex/rgba in theme or primitive files
//
// Output: DESIGN_BOUNDARY_REPORT.md
// ═══════════════════════════════════════════════════════════════
import { readdir, readFile } from "fs/promises";
import { resolve, extname, relative } from "path";

const SRC = resolve(process.cwd(), "src");
const REPORT = resolve(process.cwd(), "DESIGN_BOUNDARY_REPORT.md");

// Files that are allowed to reference viz colors because they are enforcement contracts
const ENFORCEMENT_CONTRACTS = [
  /rules\.ts$/,
  /contract\.ts$/,
  /boundary\.ts$/,
];

// Domain path → allowed import targets
type Domain = "theme" | "primitives" | "visualization" | "ui-components" | "pages" | "other";

const DOMAIN_PATH_MAP: { domain: Domain; patterns: RegExp[] }[] = [
  { domain: "theme", patterns: [/src[\\/]design-system[\\/]theme/] },
  { domain: "primitives", patterns: [
    /src[\\/]design-system[\\/]primitives/,
    /src[\\/]components[\\/]ui[\\/]primitives/,
  ]},
  { domain: "visualization", patterns: [/src[\\/]design-system[\\/]visualization/] },
  { domain: "ui-components", patterns: [/src[\\/]components[\\/](?!ui[\\/]primitives)/] },
  { domain: "pages", patterns: [/src[\\/]app[\\/]/] },
];

function getDomain(filePath: string): Domain {
  for (const { domain, patterns } of DOMAIN_PATH_MAP) {
    if (patterns.some((p) => p.test(filePath))) return domain;
  }
  return "other";
}

// Forbidden import paths per domain
const FORBIDDEN_IMPORTS: Record<Domain, RegExp[]> = {
  theme: [/design-system[\\/]visualization/, /visualization\/(fatigue|intensity|heart-rate|recovery)/],
  primitives: [/design-system[\\/]visualization/, /visualization\/(fatigue|intensity|heart-rate|recovery)/],
  visualization: [], // visualization can import anything (within reason)
  "ui-components": [/design-system[\\/]visualization/], // UI components should consume viz via props, not direct import
  pages: [/design-system[\\/]visualization/],
  other: [],
};

// Known visualization color values that should not appear in theme/primitives
const VIZ_COLOR_PATTERNS = [
  /#B8FF2B/gi,
  /#00E5CC/gi,
  /#FF9940/gi,
  /#FFD700/gi,
  /#8B5CF6/gi,
  /#7CDD00/gi,
  /rgba\(184,\s*255,\s*43/gi,
  /rgba\(0,\s*229,\s*204/gi,
  /rgba\(255,\s*153,\s*64/gi,
  /rgba\(255,\s*215,\s*0/gi,
  /rgba\(139,\s*92,\s*246/gi,
];

// Known domain state words that should not be in theme/primitive files
const DOMAIN_STATE_WORDS = /\b(fatigue|intensity|heartRate|heart_rate|recoveryState|workoutState|energyLevel|restPeriod|overreaching|rpe|zone1|zone2|zone3|zone4|zone5)\b/gi;

interface Violation {
  file: string;
  line: number;
  domain: Domain;
  type: "cross-domain-import" | "viz-color-leak" | "domain-state-leak" | "hex-in-theme";
  detail: string;
  severity: "critical" | "high" | "medium";
}

async function* walk(dir: string): AsyncGenerator<string> {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") continue;
      yield* walk(full);
    } else {
      const ext = extname(full);
      if (ext === ".tsx" || ext === ".ts" || ext === ".css") {
        yield full;
      }
    }
  }
}

async function scan(): Promise<Violation[]> {
  const violations: Violation[] = [];

  for await (const file of walk(SRC)) {
    const rel = relative(process.cwd(), file);
    const domain = getDomain(rel);
    const content = await readFile(file, "utf-8");
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      // 1. Cross-domain import check
      if (line.includes("import ") || line.includes("from ")) {
        const forbidden = FORBIDDEN_IMPORTS[domain];
        for (const pattern of forbidden) {
          if (pattern.test(line)) {
            violations.push({
              file: rel,
              line: lineNum,
              domain,
              type: "cross-domain-import",
              detail: line.trim(),
              severity: "critical",
            });
          }
        }
      }

      const isEnforcementContract = ENFORCEMENT_CONTRACTS.some((p) => p.test(rel));

      // 2. Visualization color leak in theme/primitives
      if ((domain === "theme" || domain === "primitives") && !isEnforcementContract) {
        for (const pattern of VIZ_COLOR_PATTERNS) {
          if (pattern.test(line)) {
            violations.push({
              file: rel,
              line: lineNum,
              domain,
              type: "viz-color-leak",
              detail: line.trim(),
              severity: "critical",
            });
          }
        }

        // 3. Domain state words in theme/primitives
        if (DOMAIN_STATE_WORDS.test(line)) {
          violations.push({
            file: rel,
            line: lineNum,
            domain,
            type: "domain-state-leak",
            detail: line.trim(),
            severity: "high",
          });
        }
      }
    }
  }

  return violations;
}

function severityRank(s: string): number {
  return { critical: 0, high: 1, medium: 2 }[s] ?? 3;
}

async function main() {
  console.log("Enforcing design boundaries...");
  const violations = await scan();
  violations.sort(
    (a, b) =>
      severityRank(a.severity) - severityRank(b.severity) ||
      a.file.localeCompare(b.file) ||
      a.line - b.line
  );

  const byFile = new Map<string, Violation[]>();
  for (const v of violations) {
    const list = byFile.get(v.file) || [];
    list.push(v);
    byFile.set(v.file, list);
  }

  const critical = violations.filter((v) => v.severity === "critical").length;
  const high = violations.filter((v) => v.severity === "high").length;

  let md = `# FitCoach Design Boundary Report\n\n`;
  md += `**Generated:** ${new Date().toISOString()}\n\n`;
  md += `## Architecture Rules\n\n`;
  md += `\`\`\`\n`;
  md += `theme ← (no imports)\n`;
  md += `primitives ← theme\n`;
  md += `visualization ← theme, primitives\n`;
  md += `ui-components ← theme, primitives, visualization (via props only)\n`;
  md += `\`\`\`\n\n`;
  md += `## Summary\n\n`;
  md += `- **Total violations:** ${violations.length}\n`;
  md += `- **Critical:** ${critical}\n`;
  md += `- **High:** ${high}\n`;
  md += `- **Files affected:** ${byFile.size}\n\n`;

  md += `## Violation Types\n\n`;
  md += `- **cross-domain-import:** Theme or primitives importing visualization\n`;
  md += `- **viz-color-leak:** Visualization colors (#B8FF2B, #FF9940, etc.) found in theme/primitives\n`;
  md += `- **domain-state-leak:** Business state words (fatigue, intensity, heartRate) in theme/primitives\n\n`;

  md += `## Quick Fix Guide\n\n`;
  md += `| Violation | Fix |\n`;
  md += `|-----------|-----|\n`;
  md += `| Theme imports visualization | Remove import; use semantic token instead |\n`;
  md += `| Primitives import visualization | Remove import; use semantic token instead |\n`;
  md += `| Viz color in theme file | Replace with semantic token (e.g., #FF9940 → --warning) |\n`;
  md += `| Domain state in primitives | Rename to structural concept (e.g., fatigueLevel → statusLevel) |\n\n`;

  md += `## Violations by File\n\n`;

  for (const [file, list] of byFile) {
    md += `### ${file}\n\n`;
    for (const v of list) {
      md += `- **[${v.severity.toUpperCase()}]** Line ${v.line} (${v.type})\n`;
      md += `  - *Context:* \`\`\`${v.detail}\`\`\`\n\n`;
    }
  }

  md += `---\n\n`;
  md += `## Remediation\n\n`;
  md += `1. Fix all **critical** violations first (cross-domain imports)\n`;
  md += `2. Fix **high** violations next (domain state leakage)\n`;
  md += `3. Run this scanner after each PR to prevent regression\n`;

  const fs = await import("fs");
  fs.writeFileSync(REPORT, md);
  console.log(`Report written to ${REPORT}`);
  console.log(`Found ${violations.length} violations across ${byFile.size} files`);
  console.log(`  Critical: ${critical}, High: ${high}`);
  process.exit(violations.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
