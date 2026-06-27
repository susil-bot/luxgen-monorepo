import { createEmptyFlow } from '@luxgen/automation-flow';

export interface TowerGraphCanvasData {
  flow: ReturnType<typeof createEmptyFlow>;
}

export async function fetchTowerGraphCanvasData(): Promise<TowerGraphCanvasData> {
  return { flow: createEmptyFlow('Tower workflow') };
}
