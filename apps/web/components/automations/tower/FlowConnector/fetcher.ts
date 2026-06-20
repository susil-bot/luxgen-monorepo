import { createEmptyFlow } from '@luxgen/automation-flow';

export interface FlowConnectorData {
  flow: ReturnType<typeof createEmptyFlow>;
}

export async function fetchFlowConnectorData(): Promise<FlowConnectorData> {
  return { flow: createEmptyFlow('Tower workflow') };
}
