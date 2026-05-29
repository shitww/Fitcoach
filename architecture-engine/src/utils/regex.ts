export const EXPORT_DEFAULT_RE = /export\s+default\s+(?:function\s+|const\s+|class\s+)?([A-Z][a-zA-Z0-9_]*)/;
export const EXPORT_NAMED_RE = /export\s+(?:function|const|class)\s+([A-Z][a-zA-Z0-9_]*)/g;
export const EXPORT_BRACE_RE = /export\s*\{([^}]+)\}/g;
export const IMPORT_RE = /import\s+(?:[\s\S]*?from\s+)?['"]([^'"]+)['"]/g;
