import { createEmptyFlow } from '@luxgen/automation-flow';

export interface AddStepPickerData {
  flow: ReturnType<typeof createEmptyFlow>;
}

export async function fetchAddStepPickerData(): Promise<AddStepPickerData> {
  return { flow: createEmptyFlow('Tower workflow') };
}
