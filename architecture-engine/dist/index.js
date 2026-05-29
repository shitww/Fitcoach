"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanDirectory = exports.runEngine = void 0;
exports.formatMarkdown = formatMarkdown;
__exportStar(require("./types"), exports);
var pipeline_1 = require("./pipeline");
Object.defineProperty(exports, "runEngine", { enumerable: true, get: function () { return pipeline_1.runEngine; } });
var fileFilter_1 = require("./stages/fileFilter");
Object.defineProperty(exports, "scanDirectory", { enumerable: true, get: function () { return fileFilter_1.scanDirectory; } });
function formatMarkdown(result) {
    const lines = [
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
