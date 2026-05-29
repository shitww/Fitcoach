"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractImports = extractImports;
function extractImports(file) {
    const imports = [];
    const matches = file.content.matchAll(/import\s+(?:[\s\S]*?from\s+)?['"]([^'"]+)['"]/g);
    for (const m of matches) {
        imports.push(m[1]);
    }
    return [...new Set(imports)];
}
