"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadRegistryPaths = loadRegistryPaths;
exports.checkRegistry = checkRegistry;
const fs_1 = require("fs");
function loadRegistryPaths(registryPath) {
    const content = (0, fs_1.readFileSync)(registryPath, 'utf-8');
    const paths = new Set();
    const matches = content.matchAll(/`([^`]+)`/g);
    for (const m of matches) {
        const path = m[1].trim();
        if (path.startsWith('src/') && /\.(ts|tsx|js|jsx)$/.test(path)) {
            paths.add(path);
        }
    }
    return paths;
}
function checkRegistry(files, registryPaths) {
    return files
        .filter(f => !registryPaths.has(f.path))
        .map(f => ({
        level: 'L2',
        code: 'ARCH-SOFT',
        file: f.path,
        message: `File not in FEATURE_REGISTRY.md. Add it or move to src/experimental/.`,
    }));
}
