export declare function scanDirectory(projectRoot: string): Array<{
    path: string;
    content: string;
}>;
export declare function filterChangedFiles(allFiles: Array<{
    path: string;
    content: string;
}>, diffFilePaths: string[]): Array<{
    path: string;
    content: string;
}>;
