#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const pipeline_1 = require("./pipeline");
const index_1 = require("./index");
const args = process.argv.slice(2);
const command = args[0];
if (!command || (command !== 'scan' && command !== 'diff')) {
    console.error('Usage: architecture-engine <scan|diff> [target]');
    console.error('  scan [dir]     Scan full directory (default: cwd)');
    console.error('  diff <file>    Scan only files listed in <file> (one per line)');
    process.exit(1);
}
const projectRoot = process.cwd();
const registryPath = `${projectRoot}/docs/FEATURE_REGISTRY.md`;
try {
    let result;
    if (command === 'scan') {
        const scanRoot = args[1] || projectRoot;
        result = (0, pipeline_1.runEngine)(scanRoot, registryPath);
    }
    else {
        if (!args[1]) {
            console.error('Usage: architecture-engine diff <file-list.txt>');
            process.exit(1);
        }
        const listContent = (0, fs_1.readFileSync)(args[1], 'utf-8');
        const changedFiles = listContent.split('\n').map(l => l.trim()).filter(Boolean);
        result = (0, pipeline_1.runEngine)(projectRoot, registryPath, changedFiles);
    }
    console.log(JSON.stringify(result, null, 2));
    console.log('\n---\n');
    console.log((0, index_1.formatMarkdown)(result));
    process.exit(result.blocks.length > 0 ? 1 : 0);
}
catch (err) {
    console.error('Error:', err instanceof Error ? err.message : String(err));
    process.exit(1);
}
