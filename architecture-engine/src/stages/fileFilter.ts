import { readdirSync, statSync, readFileSync } from 'fs';
import { join, relative } from 'path';

export function scanDirectory(projectRoot: string): Array<{ path: string; content: string }> {
  const srcDir = join(projectRoot, 'src');
  const files: Array<{ path: string; content: string }> = [];

  function walk(dir: string) {
    for (const entry of readdirSync(dir)) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        if (entry === 'node_modules' || entry === '.next' || entry === 'dist' || entry === 'build') continue;
        walk(fullPath);
      } else if (/\.(ts|tsx)$/.test(entry) && !/\.(test|spec)\./.test(entry)) {
        const content = readFileSync(fullPath, 'utf-8');
        const relPath = relative(projectRoot, fullPath).replace(/\\/g, '/');
        files.push({ path: relPath, content });
      }
    }
  }

  walk(srcDir);
  return files;
}

export function filterChangedFiles(
  allFiles: Array<{ path: string; content: string }>,
  diffFilePaths: string[]
): Array<{ path: string; content: string }> {
  const set = new Set(diffFilePaths);
  return allFiles.filter(f => set.has(f.path));
}
