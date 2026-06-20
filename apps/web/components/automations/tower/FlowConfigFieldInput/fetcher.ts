import { createEmptyFlow } from '@luxgen/automation-flow';

export interface FlowConfigFieldInputData {
  flow: ReturnType<typeof createEmptyFlow>;
}

export async function fetchFlowConfigFieldInputData(): Promise<FlowConfigFieldInputData> {
  return { flow: createEmptyFlow('Tower workflow') };
}
