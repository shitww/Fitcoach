"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runEngine = runEngine;
const fileFilter_1 = require("./stages/fileFilter");
const registryCheck_1 = require("./stages/registryCheck");
const extractExports_1 = require("./stages/extractExports");
const extractProps_1 = require("./stages/extractProps");
const extractImports_1 = require("./stages/extractImports");
const similarity_1 = require("./stages/similarity");
const classify_1 = require("./stages/classify");
const recommend_1 = require("./stages/recommend");
function runEngine(rootDir, registryPath, changedFilePaths) {
    const allFiles = (0, fileFilter_1.scanDirectory)(rootDir);
    const filesToAnalyze = changedFilePaths
        ? allFiles.filter(f => changedFilePaths.includes(f.path))
        : allFiles;
    const registryPaths = (0, registryCheck_1.loadRegistryPaths)(registryPath);
    const registryViolations = (0, registryCheck_1.checkRegistry)(filesToAnalyze, registryPaths);
    const parsedFiles = new Map();
    const parsedList = [];
    for (const file of allFiles) {
        const exports = (0, extractExports_1.extractExports)(file);
        const props = (0, extractProps_1.extractProps)(file);
        const imports = (0, extractImports_1.extractImports)(file);
        const basename = file.path.split('/').pop()?.replace(/\.(ts|tsx)$/, '') || '';
        const parsed = {
            path: file.path,
            content: file.content,
            exports: exports.exports,
            defaultExport: exports.defaultExport,
            props,
            imports,
            basename,
        };
        parsedFiles.set(file.path, parsed);
        parsedList.push(parsed);
    }
    const blocks = [];
    const warnings = [...registryViolations];
    const allScores = [];
    const allViolations = [];
    const candidates = changedFilePaths
        ? parsedList.filter(p => changedFilePaths.includes(p.path))
        : parsedList;
    const seenPairs = new Set();
    for (const candidate of candidates) {
        const scores = (0, similarity_1.computeSimilarity)(candidate, parsedList);
        allScores.push(...scores);
        const violations = (0, classify_1.classify)(candidate.path, scores, candidate.exports);
        for (const v of violations) {
            const pairKey = [v.file, v.canonical].sort().join('::');
            if (seenPairs.has(pairKey))
                continue;
            seenPairs.add(pairKey);
            allViolations.push(v);
            if (v.level === 'L3')
                blocks.push(v);
            else
                warnings.push(v);
        }
    }
    const recommendations = (0, recommend_1.generateRecommendations)(allViolations, allScores, parsedFiles);
    return {
        blocks,
        warnings,
        recommendations,
        summary: {
            filesScanned: filesToAnalyze.length,
            l2Count: warnings.length,
            l3Count: blocks.length,
        },
    };
}
