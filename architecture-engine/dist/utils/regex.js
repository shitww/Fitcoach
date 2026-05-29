"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IMPORT_RE = exports.EXPORT_BRACE_RE = exports.EXPORT_NAMED_RE = exports.EXPORT_DEFAULT_RE = void 0;
exports.EXPORT_DEFAULT_RE = /export\s+default\s+(?:function\s+|const\s+|class\s+)?([A-Z][a-zA-Z0-9_]*)/;
exports.EXPORT_NAMED_RE = /export\s+(?:function|const|class)\s+([A-Z][a-zA-Z0-9_]*)/g;
exports.EXPORT_BRACE_RE = /export\s*\{([^}]+)\}/g;
exports.IMPORT_RE = /import\s+(?:[\s\S]*?from\s+)?['"]([^'"]+)['"]/g;
