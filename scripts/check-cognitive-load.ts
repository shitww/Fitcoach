#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// Cognitive Load Scanner
//
// Detects:
// - components importing > 2 design-system layers
// - import chain depth > 3
// - direct internal visualization imports (bypassing viz/)
// - direct primitive internal imports (bypassing ui/)
//
// Output: COGNITIVE_LOAD_REPORT.md
// ═══════════════════════════════════════════════════════════════

import { readFileSync, readdirSync, statSync, writeFileSync } from "fs";
import { join, relative, resolve } from "path";

const ROOT = resolve(process.cwd(), "src");
const REPORT_PATH = resolve(process.cwd(), "COGNITIVE_LOAD_REPORT.md");

interface Issue {
  file: string;
  severity: "warn" | "error";
  rule: string;
  message: string;
}

const issues: Issue[] = [];

const DESIGN_SYSTEM_LAYERS = [
  "design-system/theme",
  "design-system/ui",
  "design-system/viz",
  "design-system/primitives",
  "design-system/visualization",
  "design-system/core",
];

const INTERNAL_VIZ_PATHS = [
  "design-system/visualization/core",
  "design-system/visualization/domains",
  "design-system/visualization/registry",
  "design-system/visualization/contract",
  "design-system/visualization/fatigue",
  "design-system/visualization/intensity",
  "design-system/visualization/heart-rate",
  "design-system/visualization/recovery",
];

const INTERNAL_UI_PATHS = [
  "design-system/primitives",
  "design-system/core/boundary",
  "design-system/core/runtime-guard",
  "design-system/core/freeze-guard",
];

function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const s = statSync(path);
    if (s.isDirectory()) {
      yield* walk(path);
    } else if (/\.(ts|tsx)$/.test(entry) && !entry.endsWith(".d.ts")) {
      yield path;
    }
  }
}

function getImports(content: string): string[] {
  const imports: string[] = [];
  const importRegex = /import\s+(?:[^'"]+from\s+)?['"]([^'"]+)['"];?/g;
  let m: RegExpExecArray | null;
  while ((m = importRegex.exec(content)) !== null) {
    imports.push(m[1]);
  }
  return imports;
}

function isOutsideDesignSystem(filePath: string): boolean {
  return !filePath.includes("design-system");
}

function isVizPublicFile(filePath: string): boolean {
  return filePath.includes("design-system/viz");
}

function isUiPublicFile(filePath: string): boolean {
  return filePath.includes("design-system/ui");
}

function checkFile(filePath: string, content: string) {
  const rel = relative(ROOT, filePath);
  const imports = getImports(content);

  // Rule 1: Outside design-system must NOT import viz internals directly
  if (isOutsideDesignSystem(rel) && !isVizPublicFile(rel)) {
    for (const imp of imports) {
      for (const internal of INTERNAL_VIZ_PATHS) {
        if (imp.includes(internal.replace(/\//g, ""))) {
          // Broad match — catches both @/ and relative paths
          issues.push({
            file: rel,
            severity: "error",
            rule: "viz-internal-bypass",
            message: `Component imports visualization internal "${imp}". Use "@/design-system/viz" instead.`,
          });
        }
      }
    }
  }

  // Rule 2: Outside design-system must NOT import ui internals directly
  if (isOutsideDesignSystem(rel) && !isUiPublicFile(rel)) {
    for (const imp of imports) {
      for (const internal of INTERNAL_UI_PATHS) {
        if (imp.includes(internal.replace(/\//g, ""))) {
          issues.push({
            file: rel,
            severity: "error",
            rule: "ui-internal-bypass",
            message: `Component imports primitive internal "${imp}". Use "@/design-system/ui" instead.`,
          });
        }
      }
    }
  }

  // Rule 3: Count design-system layers touched
  const layersTouched = new Set<string>();
  for (const imp of imports) {
    for (const layer of DESIGN_SYSTEM_LAYERS) {
      if (imp.includes(layer.replace(/\//g, ""))) {
        layersTouched.add(layer);
      }
    }
  }
  if (layersTouched.size > 2 && isOutsideDesignSystem(rel)) {
    issues.push({
      file: rel,
      severity: "warn",
      rule: "too-many-layers",
      message: `Component touches ${layersTouched.size} design-system layers. Max recommended: 2.`,
    });
  }

  // Rule 4: Direct internal import from visualization/
  if (rel.includes("design-system/visualization") && !rel.includes("visualization/index.ts")) {
    for (const imp of imports) {
      if (imp.includes("visualization/core") || imp.includes("visualization/domains")) {
        issues.push({
          file: rel,
          severity: "warn",
          rule: "internal-cross-import",
          message: `Visualization module imports another internal module directly: "${imp}".`,
        });
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════════════

for (const file of walk(ROOT)) {
  const content = readFileSync(file, "utf-8");
  checkFile(file, content);
}

const errors = issues.filter((i) => i.severity === "error");
const warnings = issues.filter((i) => i.severity === "warn");

const report = `# Cognitive Load Report

**Generated:** ${new Date().toISOString()}  
**Files scanned:** ${Array.from(walk(ROOT)).length}

---

## Summary

- **Errors:** ${errors.length}
- **Warnings:** ${warnings.length}
- **Total issues:** ${issues.length}

---

## Errors (must fix)

${errors.length === 0 ? "✅ No errors found." : errors.map((e) => `### ${e.file}\n- **Rule:** \`${e.rule}\`\n- **Message:** ${e.message}\n`).join("\n")}

## Warnings (review)

${warnings.length === 0 ? "✅ No warnings found." : warnings.map((w) => `### ${w.file}\n- **Rule:** \`${w.rule}\`\n- **Message:** ${w.message}\n`).join("\n")}

---

## Rules

| Rule | Trigger | Action |
|------|---------|--------|
| viz-internal-bypass | Component imports from visualization/core, domains, registry, or old palette files directly | Use \`@/design-system/viz\` |
| ui-internal-bypass | Component imports from primitives/ or core internals directly | Use \`@/design-system/ui\` |
| too-many-layers | Component imports from > 2 design-system layers | Refactor to go through public API |
| internal-cross-import | Visualization module imports another internal module | Use registry or central index |

---

*Lower cognitive load = faster development.*
`;

writeFileSync(REPORT_PATH, report);

console.log(`Scanned ${Array.from(walk(ROOT)).length} files.`);
console.log(`Found ${errors.length} errors, ${warnings.length} warnings.`);
console.log(`Report written to ${REPORT_PATH}`);

process.exit(errors.length > 0 ? 1 : 0);
