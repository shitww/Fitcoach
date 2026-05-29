export declare function extractExports(file: {
    path: string;
    content: string;
}): {
    exports: string[];
    defaultExport: string | null;
};
