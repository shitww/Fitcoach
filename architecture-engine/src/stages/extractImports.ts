export function extractImports(file: { path: string; content: string }): string[] {
  const imports: string[] = [];
  const matches = file.content.matchAll(/import\s+(?:[\s\S]*?from\s+)?['"]([^'"]+)['"]/g);
  for (const m of matches) {
    imports.push(m[1]);
  }
  return [...new Set(imports)];
}
