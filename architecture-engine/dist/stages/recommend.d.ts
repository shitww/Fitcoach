import type { Recommendation, SimilarityScore, ParsedFile } from '../types';
export declare function generateRecommendations(violations: Array<{
    file: string;
    similarity?: number;
    level: string;
}>, scores: SimilarityScore[], parsedFiles: Map<string, ParsedFile>): Recommendation[];
