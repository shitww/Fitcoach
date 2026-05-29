"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jaccardSimilarity = jaccardSimilarity;
function jaccardSimilarity(a, b) {
    if (a.size === 0 || b.size === 0)
        return 0;
    const intersection = new Set([...a].filter(x => b.has(x)));
    const union = new Set([...a, ...b]);
    return intersection.size / union.size;
}
