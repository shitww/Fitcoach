"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanDirectory = scanDirectory;
exports.filterChangedFiles = filterChangedFiles;
const fs_1 = require("fs");
const path_1 = require("path");
function scanDirectory(projectRoot) {
    const srcDir = (0, path_1.join)(projectRoot, 'src');
    const files = [];
    function walk(dir) {
        for (const entry of (0, fs_1.readdirSync)(dir)) {
            const fullPath = (0, path_1.join)(dir, entry);
            const stat = (0, fs_1.statSync)(fullPath);
            if (stat.isDirectory()) {
                if (entry === 'node_modules' || entry === '.next' || entry === 'dist' || entry === 'build')
                    continue;
                walk(fullPath);
            }
            else if (/\.(ts|tsx)$/.test(entry) && !/\.(test|spec)\./.test(entry)) {
                const content = (0, fs_1.readFileSync)(fullPath, 'utf-8');
                const relPath = (0, path_1.relative)(projectRoot, fullPath).replace(/\\/g, '/');
                files.push({ path: relPath, content });
            }
        }
    }
    walk(srcDir);
    return files;
}
function filterChangedFiles(allFiles, diffFilePaths) {
    const set = new Set(diffFilePaths);
    return allFiles.filter(f => set.has(f.path));
}
