export interface EngineInput {
  changedFiles: Array<{ path: string; status: 'A' | 'M' | 'R' }>;
  fileContents: Map<string, string>;
  allSourceFiles: Array<{ path: string; content: string }>;
}

export interface EngineOutput {
  blocks: Violation[];
  warnings: Violation[];
  recommendations: Recommendation[];
  summary: {
    filesScanned: number;
    l2Count: number;
    l3Count: number;
  };
}

export interface Violation {
  level: 'L2' | 'L3' | 'L4';
  code: string;
  file: string;
  message: string;
  canonical?: string;
  exportName?: string;
  similarity?: number;
}

export interface Recommendation {
  ticketId: string;
  trigger: string;
  domain: string;
  detectedFiles: string[];
  suggestedCanonical: string;
  mergeStrategy: 'extend' | 'absorb' | 'replace';
  steps: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export interface ParsedFile {
  path: string;
  content: string;
  exports: string[];
  defaultExport: string | null;
  props: string[];
  imports: string[];
  basename: string;
}

export interface SimilarityScore {
  candidatePath: string;
  targetPath: string;
  exportNameMatch: boolean;
  propsOverlapPercent: number;
  sharedImportsPercent: number;
  filenameSimilarity: number;
  weightedScore: number;
}
