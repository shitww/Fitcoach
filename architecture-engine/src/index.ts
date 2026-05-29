export * from './types';
export { runEngine } from './pipeline';
export { scanDirectory } from './stages/fileFilter';

export function formatMarkdown(result: {
  blocks: Array<{ file: string; message: string; similarity?: number }>;
  warnings: Array<{ file: string; message: string; similarity?: number }>;
  recommendations: Array<{
    ticketId: string;
    detectedFiles: string[];
    mergeStrategy: string;
    steps: string[];
    riskLevel: string;
  }>;
  summary: { filesScanned: number; l2Count: number; l3Count: number };
}): string {
  const lines: string[] = [
    '# Architecture Engine Report',
    '',
    `**Files Scanned**: ${result.summary.filesScanned}`,
    `**L2 Warnings**: ${result.summary.l2Count}`,
    `**L3 Blocks**: ${result.summary.l3Count}`,
    '',
  ];

  if (result.blocks.length > 0) {
    lines.push('## Blocks (must resolve before merge)', '');
    for (const b of result.blocks) {
      lines.push(`- **${b.file}** — ${b.message}${b.similarity ? ` (similarity: ${b.similarity}%)` : ''}`);
    }
    lines.push('');
  }

  if (result.warnings.length > 0) {
    lines.push('## Warnings (require justification)', '');
    for (const w of result.warnings) {
      lines.push(`- **${w.file}** — ${w.message}${w.similarity ? ` (similarity: ${w.similarity}%)` : ''}`);
    }
    lines.push('');
  }

  if (result.recommendations.length > 0) {
    lines.push('## Recommendations', '');
    for (const r of result.recommendations) {
      lines.push(`### ${r.ticketId} — ${r.mergeStrategy.toUpperCase()}`);
      lines.push(`- **Files**: ${r.detectedFiles.join(' ↔ ')}`);
      lines.push(`- **Strategy**: ${r.mergeStrategy}`);
      lines.push(`- **Steps**: ${r.steps.join(' → ')}`);
      lines.push(`- **Risk**: ${r.riskLevel}`);
      lines.push('');
    }
  }

  if (result.blocks.length === 0 && result.warnings.length === 0) {
    lines.push('✅ No architecture issues detected.');
  }

  return lines.join('\n');
}
