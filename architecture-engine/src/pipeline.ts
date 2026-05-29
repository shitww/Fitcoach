import type { EngineOutput, ParsedFile, SimilarityScore, Violation } from './types';
import { scanDirectory } from './stages/fileFilter';
import { loadRegistryPaths, checkRegistry } from './stages/registryCheck';
import { extractExports } from './stages/extractExports';
import { extractProps } from './stages/extractProps';
import { extractImports } from './stages/extractImports';
import { computeSimilarity } from './stages/similarity';
import { classify } from './stages/classify';
import { generateRecommendations } from './stages/recommend';

export function runEngine(
  rootDir: string,
  registryPath: string,
  changedFilePaths?: string[]
): EngineOutput {
  const allFiles = scanDirectory(rootDir);
  const filesToAnalyze = changedFilePaths
    ? allFiles.filter(f => changedFilePaths.includes(f.path))
    : allFiles;

  const registryPaths = loadRegistryPaths(registryPath);
  const registryViolations = checkRegistry(filesToAnalyze, registryPaths);

  const parsedFiles = new Map<string, ParsedFile>();
  const parsedList: ParsedFile[] = [];

  for (const file of allFiles) {
    const exports = extractExports(file);
    const props = extractProps(file);
    const imports = extractImports(file);
    const basename = file.path.split('/').pop()?.replace(/\.(ts|tsx)$/, '') || '';

    const parsed: ParsedFile = {
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

  const blocks: Violation[] = [];
  const warnings: Violation[] = [...registryViolations];
  const allScores: SimilarityScore[] = [];
  const allViolations: Violation[] = [];

  const candidates = changedFilePaths
    ? parsedList.filter(p => changedFilePaths.includes(p.path))
    : parsedList;

  const seenPairs = new Set<string>();

  for (const candidate of candidates) {
    const scores = computeSimilarity(candidate, parsedList);
    allScores.push(...scores);

    const violations = classify(candidate.path, scores, candidate.exports);

    for (const v of violations) {
      const pairKey = [v.file, v.canonical!].sort().join('::');
      if (seenPairs.has(pairKey)) continue;
      seenPairs.add(pairKey);

      allViolations.push(v);
      if (v.level === 'L3') blocks.push(v);
      else warnings.push(v);
    }
  }

  const recommendations = generateRecommendations(
    allViolations,
    allScores,
    parsedFiles
  );

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
