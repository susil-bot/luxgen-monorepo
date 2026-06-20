import { createEmptyFlow } from '@luxgen/automation-flow';

export interface TowerShellData {
  flow: ReturnType<typeof createEmptyFlow>;
}

export async function fetchTowerShellData(): Promise<TowerShellData> {
  return { flow: createEmptyFlow('Tower workflow') };
}
