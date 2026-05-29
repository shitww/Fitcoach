"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRecommendations = generateRecommendations;
function generateRecommendations(violations, scores, parsedFiles) {
    const recommendations = [];
    for (const v of violations) {
        if (v.level !== 'L3')
            continue;
        const score = scores.find(s => s.candidatePath === v.file);
        if (!score)
            continue;
        const candidate = parsedFiles.get(v.file);
        const target = parsedFiles.get(score.targetPath);
        if (!candidate || !target)
            continue;
        let strategy;
        if (score.propsOverlapPercent > 60) {
            strategy = 'extend';
        }
        else if (score.weightedScore > 80) {
            strategy = 'absorb';
        }
        else {
            strategy = 'replace';
        }
        const domain = v.file.split('/')[2] || 'unknown';
        recommendations.push({
            ticketId: `HEAL-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
            trigger: 'T1',
            domain,
            detectedFiles: [v.file, score.targetPath],
            suggestedCanonical: score.targetPath,
            mergeStrategy: strategy,
            steps: [
                `Compare props of ${v.file} and ${score.targetPath}`,
                `Merge ${v.file} into ${score.targetPath} using strategy: ${strategy}`,
                `Update callers to use unified component`,
                `Delete ${v.file} and update registry`,
            ],
            riskLevel: score.weightedScore > 90 ? 'high' : 'medium',
        });
    }
    return recommendations;
}
