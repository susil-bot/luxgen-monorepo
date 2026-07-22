import { createEmptyFlow } from '@luxgen/automation-flow';

export interface TowerStepRailData {
  flow: ReturnType<typeof createEmptyFlow>;
}

export async function fetchTowerStepRailData(): Promise<TowerStepRailData> {
  return { flow: createEmptyFlow('Tower workflow') };
}
