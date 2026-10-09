import fs from 'node:fs';
import path from 'node:path';
import type { TaskWorkspaceMetadata } from '@engineering-simulator/contracts';

export const WORKSPACE_FILE = '.engsim.json';

export interface WorkspaceLocation {
  dirPath: string;
  filePath: string;
  metadata: TaskWorkspaceMetadata;
}

export function findWorkspace(startDir: string = process.cwd()): WorkspaceLocation | null {
  let current = path.resolve(startDir);
  const root = path.parse(current).root;

  while (current) {
    const candidatePath = path.join(current, WORKSPACE_FILE);
    if (fs.existsSync(candidatePath)) {
      try {
        const raw = fs.readFileSync(candidatePath, 'utf-8');
        const metadata = JSON.parse(raw) as TaskWorkspaceMetadata;
        return {
          dirPath: current,
          filePath: candidatePath,
          metadata,
        };
      } catch {
        return null;
      }
    }

    if (current === root) {
      break;
    }
    const parent = path.dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }

  return null;
}

export function writeWorkspace(dirPath: string, metadata: TaskWorkspaceMetadata): void {
  const filePath = path.join(dirPath, WORKSPACE_FILE);
  fs.writeFileSync(filePath, JSON.stringify(metadata, null, 2), { mode: 0o644 });
}

export function updateWorkspace(
  update: Partial<TaskWorkspaceMetadata>,
  startDir: string = process.cwd()
): boolean {
  const workspace = findWorkspace(startDir);
  if (!workspace) {
    return false;
  }

  const updated: TaskWorkspaceMetadata = {
    ...workspace.metadata,
    ...update,
  };

  writeWorkspace(workspace.dirPath, updated);
  return true;
}
