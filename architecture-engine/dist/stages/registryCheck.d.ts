import type { Violation } from '../types';
export declare function loadRegistryPaths(registryPath: string): Set<string>;
export declare function checkRegistry(files: Array<{
    path: string;
}>, registryPaths: Set<string>): Violation[];
