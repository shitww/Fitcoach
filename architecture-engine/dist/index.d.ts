export * from './types';
export { runEngine } from './pipeline';
export { scanDirectory } from './stages/fileFilter';
export declare function formatMarkdown(result: {
    blocks: Array<{
        file: string;
        message: string;
        similarity?: number;
    }>;
    warnings: Array<{
        file: string;
        message: string;
        similarity?: number;
    }>;
    recommendations: Array<{
        ticketId: string;
        detectedFiles: string[];
        mergeStrategy: string;
        steps: string[];
        riskLevel: string;
    }>;
    summary: {
        filesScanned: number;
        l2Count: number;
        l3Count: number;
    };
}): string;
