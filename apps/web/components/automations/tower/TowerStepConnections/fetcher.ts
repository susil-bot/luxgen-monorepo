import { createEmptyFlow } from '@luxgen/automation-flow';

export interface TowerStepConnectionsData {
  flow: ReturnType<typeof createEmptyFlow>;
}

export async function fetchTowerStepConnectionsData(): Promise<TowerStepConnectionsData> {
  return { flow: createEmptyFlow('Tower workflow') };
}
