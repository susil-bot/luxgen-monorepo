import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';

import { CREATE_AUTOMATION, GET_AUTOMATION, UPDATE_AUTOMATION } from '../graphql/queries/automations';
import { createEmptyFlow, parseTowerFlowDocument, type TowerFlowDocument } from '../lib/automation-flow';
import { towerFlowToMutationInput } from '../lib/tower-flow-persist';

export type TowerSaveState = 'idle' | 'saving' | 'saved' | 'error';

interface UseTowerFlowPersistOptions {
  towerId: string;
  tenantId: string;
  onCreated?: (id: string) => void;
}

export function useTowerFlowPersist({ towerId, tenantId, onCreated }: UseTowerFlowPersistOptions) {
  const isNew = towerId === 'new';

  const { data, loading: queryLoading } = useQuery(GET_AUTOMATION, {
    variables: { id: towerId },
    skip: isNew || !towerId,
    fetchPolicy: 'network-only',
  });

  const [createMutation] = useMutation(CREATE_AUTOMATION);
  const [updateMutation] = useMutation(UPDATE_AUTOMATION);

  const [flow, setFlow] = useState<TowerFlowDocument>(() => createEmptyFlow());
  const [loaded, setLoaded] = useState(isNew);
  const [saveState, setSaveState] = useState<TowerSaveState>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [persistedId, setPersistedId] = useState<string | null>(isNew ? null : towerId);

  useEffect(() => {
    if (isNew) {
      setLoaded(true);
      return;
    }
    const automation = data?.automation;
    if (!automation) return;

    const parsed = automation.flowDefinition ? parseTowerFlowDocument(automation.flowDefinition) : null;
    setFlow(parsed ?? createEmptyFlow(automation.name));
    setPersistedId(automation.id);
    setLoaded(true);
  }, [data, isNew]);

  const save = useCallback(
    async (nextFlow: TowerFlowDocument) => {
      if (!tenantId) {
        setSaveError('Tenant context required');
        setSaveState('error');
        return null;
      }

      const prepared = towerFlowToMutationInput(nextFlow);
      if (!prepared.ok) {
        setSaveError(prepared.errors.join('; '));
        setSaveState('error');
        return null;
      }

      setSaveState('saving');
      setSaveError(null);

      try {
        if (persistedId) {
          const { data: result } = await updateMutation({
            variables: { id: persistedId, input: prepared.input },
          });
          const saved = result?.updateAutomation;
          if (!saved) throw new Error('Update failed');
          setSaveState('saved');
          return saved.id as string;
        }

        const { data: result } = await createMutation({
          variables: {
            input: {
              tenantId,
              ...prepared.input,
            },
          },
        });
        const saved = result?.createAutomation;
        if (!saved) throw new Error('Create failed');
        setPersistedId(saved.id);
        setSaveState('saved');
        onCreated?.(saved.id);
        return saved.id as string;
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : 'Save failed');
        setSaveState('error');
        return null;
      }
    },
    [tenantId, persistedId, createMutation, updateMutation, onCreated],
  );

  return {
    flow,
    setFlow,
    loaded,
    loading: !isNew && (queryLoading || !loaded),
    isNew,
    persistedId,
    save,
    saveState,
    saveError,
  };
}
