"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeSimilarity = computeSimilarity;
const jaccard_1 = require("../utils/jaccard");
const levenshtein_1 = require("../utils/levenshtein");
function computeSimilarity(candidate, allFiles) {
    const scores = [];
    for (const target of allFiles) {
        if (target.path === candidate.path)
            continue;
        let bestExportSimilarity = 0;
        for (const ce of candidate.exports) {
            for (const te of target.exports) {
                const sim = (0, levenshtein_1.levenshteinSimilarity)(ce, te);
                if (sim > bestExportSimilarity)
                    bestExportSimilarity = sim;
            }
        }
        const exportScore = (bestExportSimilarity / 100) * 40;
        const propsJaccard = (0, jaccard_1.jaccardSimilarity)(new Set(candidate.props), new Set(target.props));
        const propsScore = propsJaccard * 30;
        const importJaccard = (0, jaccard_1.jaccardSimilarity)(new Set(candidate.imports), new Set(target.imports));
        const importScore = importJaccard * 10;
        const filenameSim = (0, levenshtein_1.levenshteinSimilarity)(candidate.basename, target.basename);
        const filenameScore = (filenameSim / 100) * 20;
        const weightedScore = Math.round(exportScore + propsScore + importScore + filenameScore);
        scores.push({
            candidatePath: candidate.path,
            targetPath: target.path,
            exportNameMatch: bestExportSimilarity === 100,
            propsOverlapPercent: Math.round(propsJaccard * 100),
            sharedImportsPercent: Math.round(importJaccard * 100),
            filenameSimilarity: Math.round(filenameSim),
            weightedScore,
        });
    }
    return scores.sort((a, b) => b.weightedScore - a.weightedScore);
}
