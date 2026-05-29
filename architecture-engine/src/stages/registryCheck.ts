import { readFileSync } from 'fs';
import type { Violation } from '../types';

export function loadRegistryPaths(registryPath: string): Set<string> {
  const content = readFileSync(registryPath, 'utf-8');
  const paths = new Set<string>();

  const matches = content.matchAll(/`([^`]+)`/g);
  for (const m of matches) {
    const path = m[1].trim();
    if (path.startsWith('src/') && /\.(ts|tsx|js|jsx)$/.test(path)) {
      paths.add(path);
    }
  }

  return paths;
}

export function checkRegistry(
  files: Array<{ path: string }>,
  registryPaths: Set<string>
): Violation[] {
  return files
    .filter(f => !registryPaths.has(f.path))
    .map(f => ({
      level: 'L2' as const,
      code: 'ARCH-SOFT',
      file: f.path,
      message: `File not in FEATURE_REGISTRY.md. Add it or move to src/experimental/.`,
    }));
}
