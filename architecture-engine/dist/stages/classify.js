"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classify = classify;
function classify(candidatePath, scores, exports) {
    const violations = [];
    // Only top 3 highest scores per candidate to reduce noise
    // Skip index.ts barrel files as they only re-export and cause false positives
    const isBarrel = (p) => p.endsWith('/index.ts') || p.endsWith('/index.tsx');
    const topScores = scores
        .filter(s => s.weightedScore >= 40 && !isBarrel(s.candidatePath) && !isBarrel(s.targetPath))
        .slice(0, 3);
    for (const score of topScores) {
        const isL3 = score.weightedScore >= 70;
        const level = isL3 ? 'L3' : 'L2';
        const code = isL3 ? 'ARCH-DUPE' : 'ARCH-SOFT';
        violations.push({
            level,
            code,
            file: candidatePath,
            canonical: score.targetPath,
            exportName: exports.find(e => e.length > 0),
            similarity: score.weightedScore,
            message: isL3
                ? `Export collides with ${score.targetPath} (similarity: ${score.weightedScore}%). Declare as SECONDARY or extend canonical.`
                : `Possible duplication with ${score.targetPath} (similarity: ${score.weightedScore}%). Provide justification.`,
        });
    }
    return violations;
}
