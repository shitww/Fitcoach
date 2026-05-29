// Theme Violation Scanner
// Scans src/**/* for hardcoded colors and theme escapes
// Outputs: THEME_VIOLATIONS_REPORT.md
import { readdir, readFile, stat } from "fs/promises";
import { resolve, extname, relative } from "path";

const SRC = resolve(process.cwd(), "src");
const REPORT = resolve(process.cwd(), "THEME_VIOLATIONS_REPORT.md");

const VIOLATION_PATTERNS = [
  // Tailwind hardcoded colors (in className strings or template literals)
  {
    name: "hardcoded-tailwind-black-white",
    regex:
      /(?<!\w)(?:text|bg|border|ring|fill|stroke|from|to|via|shadow)-(?:black|white)(?!\w)/g,
    severity: "critical",
    suggestion:
      "Use semantic tokens: text-foreground, bg-background, bg-card, border-border",
  },
  {
    name: "hardcoded-tailwind-gray",
    regex:
      /(?<!\w)(?:text|bg|border|ring|fill|stroke|from|to|via|shadow)-(?:gray|zinc|slate|neutral|stone)-\d{2,3}(?!\w)/g,
    severity: "critical",
    suggestion:
      "Use semantic tokens: text-muted-foreground, bg-muted, bg-secondary, border-border",
  },
  {
    name: "hardcoded-tailwind-hex-in-class",
    regex:
      /\b(?:bg|text|border|ring|fill|stroke)\-[#][0-9a-fA-F]{3,8}\b/g,
    severity: "critical",
    suggestion: "Use semantic tokens instead of hex in className",
  },
  // Inline styles with colors
  {
    name: "inline-style-color",
    regex:
      /style=\{\{[^}]*(?:color|background(?:Color)?|borderColor)\s*:\s*['"](#|rgb|rgba|hsl)/g,
    severity: "high",
    suggestion: "Use CSS variables via className or theme tokens",
  },
  // CSS files with hardcoded values
  {
    name: "css-hardcoded-rgba",
    regex:
      /rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(?:\s*,\s*[\d.]+)?\s*\)/g,
    severity: "high",
    suggestion: "Use CSS custom properties or semantic tokens",
  },
  {
    name: "css-hardcoded-hex",
    regex: /#[0-9a-fA-F]{3,8}/g,
    severity: "high",
    suggestion: "Use CSS custom properties or semantic tokens",
  },
  // Specific theme escapes
  {
    name: "theme-escape-white-black",
    regex:
      /\b(?:white|black)\b/g,
    severity: "medium",
    suggestion:
      "Verify this is not a UI color. Use foreground/background tokens if it is.",
  },
];

const ALLOWED_FILES = [
  // Data visualization, charts, and brand assets are exempt
  /recharts|chart|graph/i,
  /logo|brand/i,
  /gradient.*preview/i,
  // CSS variables definitions themselves are allowed
  /theme-tokens|globals\.css/,
];

const ALLOWED_CONTEXTS = [
  // Comments
  /\/\/.*$/gm,
  /\/\*[\s\S]*?\*\//g,
  // CSS custom property definitions
  /--[\w-]+:\s*/g,
];

async function* walk(dir: string): AsyncGenerator<string> {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") continue;
      yield* walk(full);
    } else {
      const ext = extname(full);
      if (
        ext === ".tsx" ||
        ext === ".ts" ||
        ext === ".css" ||
        ext === ".scss"
      ) {
        yield full;
      }
    }
  }
}

interface Violation {
  file: string;
  line: number;
  column: number;
  match: string;
  pattern: string;
  severity: string;
  suggestion: string;
  context: string;
}

async function scan(): Promise<Violation[]> {
  const violations: Violation[] = [];

  for await (const file of walk(SRC)) {
    const rel = relative(process.cwd(), file);
    if (ALLOWED_FILES.some((p) => p.test(rel))) continue;

    const content = await readFile(file, "utf-8");
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      for (const pattern of VIOLATION_PATTERNS) {
        const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
        let match: RegExpExecArray | null;
        while ((match = regex.exec(line)) !== null) {
          // Skip if inside an allowed context (simple heuristic)
          const contextStart = Math.max(0, match.index - 30);
          const contextEnd = Math.min(line.length, match.index + match[0].length + 30);
          const context = line.slice(contextStart, contextEnd);

          violations.push({
            file: rel,
            line: lineNum,
            column: match.index + 1,
            match: match[0],
            pattern: pattern.name,
            severity: pattern.severity,
            suggestion: pattern.suggestion,
            context,
          });
        }
      }
    }
  }

  return violations;
}

function severityRank(s: string): number {
  return { critical: 0, high: 1, medium: 2, low: 3 }[s] ?? 4;
}

async function main() {
  console.log("Scanning for theme violations...");
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
  const medium = violations.filter((v) => v.severity === "medium").length;

  let md = `# FitCoach Theme Violations Report\n\n`;
  md += `**Generated:** ${new Date().toISOString()}\n\n`;
  md += `## Summary\n\n`;
  md += `- **Total violations:** ${violations.length}\n`;
  md += `- **Critical:** ${critical}\n`;
  md += `- **High:** ${high}\n`;
  md += `- **Medium:** ${medium}\n`;
  md += `- **Files affected:** ${byFile.size}\n\n`;

  md += `## Severity Legend\n\n`;
  md += `- **Critical:** Will break one or both themes (text-white, bg-zinc-950, etc.)\n`;
  md += `- **High:** Hardcoded colors in CSS or inline styles that don't adapt\n`;
  md += `- **Medium:** Potential theme escape — verify context\n\n`;

  md += `## Quick Fixes\n\n`;
  md += `| Hardcoded | → Semantic Token |\n`;
  md += `|-----------|------------------|\n`;
  md += `| \`text-white\` | \`text-foreground\` or \`text-primary-foreground\` |\n`;
  md += `| \`text-black\` | \`text-foreground\` (light) or \`text-primary-foreground\` |\n`;
  md += `| \`bg-black\` | \`bg-background\` |\n`;
  md += `| \`bg-white\` | \`bg-card\` or \`bg-background\` |\n`;
  md += `| \`bg-zinc-900/950\` | \`bg-card\` or \`bg-secondary\` |\n`;
  md += `| \`border-zinc-800\` | \`border-border\` |\n`;
  md += `| \`text-gray-400\` | \`text-muted-foreground\` |\n`;
  md += `| \`text-zinc-400\` | \`text-muted-foreground\` |\n\n`;

  md += `## Violations by File\n\n`;

  for (const [file, list] of byFile) {
    md += `### ${file}\n\n`;
    for (const v of list) {
      md += `- **[${v.severity.toUpperCase()}]** Line ${v.line}: \`${v.match}\`\n`;
      md += `  - *Pattern:* ${v.pattern}\n`;
      md += `  - *Context:* \`...${v.context}...\`\n`;
      md += `  - *Suggestion:* ${v.suggestion}\n\n`;
    }
  }

  md += `---\n\n`;
  md += `## Remediation Strategy\n\n`;
  md += `1. **Fix Critical first** — these break themes outright\n`;
  md += `2. **Fix High next** — hardcoded CSS colors in .css files\n`;
  md += `3. **Audit Medium last** — many may be false positives (comments, data viz)\n`;
  md += `4. **Run this script after each PR** to prevent regression\n`;

  const fs = await import("fs");
  fs.writeFileSync(REPORT, md);
  console.log(`Report written to ${REPORT}`);
  console.log(`Found ${violations.length} violations across ${byFile.size} files`);
  console.log(`  Critical: ${critical}, High: ${high}, Medium: ${medium}`);
  process.exit(violations.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
