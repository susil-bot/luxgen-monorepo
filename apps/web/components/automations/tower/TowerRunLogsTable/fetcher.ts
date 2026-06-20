import { createEmptyFlow } from '@luxgen/automation-flow';

export interface TowerRunLogsTableData {
  flow: ReturnType<typeof createEmptyFlow>;
}

export async function fetchTowerRunLogsTableData(): Promise<TowerRunLogsTableData> {
  return { flow: createEmptyFlow('Tower workflow') };
}
