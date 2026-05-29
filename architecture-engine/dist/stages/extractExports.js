"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractExports = extractExports;
function extractExports(file) {
    const exports = [];
    let defaultExport = null;
    const defaultMatch = file.content.match(/export\s+default\s+(?:function\s+|const\s+|class\s+)?([A-Z][a-zA-Z0-9_]*)/);
    if (defaultMatch) {
        defaultExport = defaultMatch[1];
        exports.push(defaultMatch[1]);
    }
    const namedMatches = file.content.matchAll(/export\s+(?:function|const|class)\s+([A-Z][a-zA-Z0-9_]*)/g);
    for (const m of namedMatches) {
        exports.push(m[1]);
    }
    const braceMatches = file.content.matchAll(/export\s*\{([^}]+)\}/g);
    for (const m of braceMatches) {
        const names = m[1].split(',').map(s => s.trim().split(/\s+as\s+/).pop());
        for (const name of names) {
            if (/^[A-Z]/.test(name)) {
                exports.push(name);
            }
        }
    }
    return { exports: [...new Set(exports)], defaultExport };
}
