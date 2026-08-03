import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';

import {
  ARCHIVE_AUTOMATION,
  CREATE_AUTOMATION,
  GET_AUTOMATION,
  PAUSE_AUTOMATION,
  PUBLISH_AUTOMATION,
  UPDATE_AUTOMATION,
} from '../graphql/queries/automations';
import { createEmptyFlow, parseTowerFlowDocument, type TowerFlowDocument } from '../lib/automation-flow';
import { towerFlowToMutationInput } from '../lib/tower-flow-persist';

export type TowerSaveState = 'idle' | 'saving' | 'saved' | 'error';
export type TowerLifecycleStatus = 'draft' | 'live' | 'paused' | 'archived';

interface UseTowerFlowPersistOptions {
  towerId: string;
  tenantId: string;
  onCreated?: (id: string) => void;
}

function normalizeStatus(raw: string | null | undefined, enabled?: boolean): TowerLifecycleStatus {
  if (raw === 'live' || raw === 'paused' || raw === 'draft' || raw === 'archived') return raw;
  return enabled ? 'live' : 'draft';
}

export function useTowerFlowPersist({ towerId, tenantId, onCreated }: UseTowerFlowPersistOptions) {
  const isNew = towerId === 'new';

  const { data, loading: queryLoading, refetch } = useQuery(GET_AUTOMATION, {
    variables: { id: towerId },
    skip: isNew || !towerId,
    fetchPolicy: 'network-only',
  });

  const [createMutation] = useMutation(CREATE_AUTOMATION);
  const [updateMutation] = useMutation(UPDATE_AUTOMATION);
  const [publishMutation] = useMutation(PUBLISH_AUTOMATION);
  const [pauseMutation] = useMutation(PAUSE_AUTOMATION);
  const [archiveMutation] = useMutation(ARCHIVE_AUTOMATION);

  const [flow, setFlow] = useState<TowerFlowDocument>(() => createEmptyFlow());
  const [loaded, setLoaded] = useState(isNew);
  const [saveState, setSaveState] = useState<TowerSaveState>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [persistedId, setPersistedId] = useState<string | null>(isNew ? null : towerId);
  const [lifecycleStatus, setLifecycleStatus] = useState<TowerLifecycleStatus>('draft');
  const [lifecycleBusy, setLifecycleBusy] = useState(false);

  useEffect(() => {
    if (isNew) {
      setLoaded(true);
      setLifecycleStatus('draft');
      return;
    }
    const automation = data?.automation;
    if (!automation) return;

    const parsed = automation.flowDefinition ? parseTowerFlowDocument(automation.flowDefinition) : null;
    setFlow(parsed ?? createEmptyFlow(automation.name));
    setPersistedId(automation.id);
    setLifecycleStatus(normalizeStatus(automation.status, automation.enabled));
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
          if (saved.status) setLifecycleStatus(normalizeStatus(saved.status, saved.enabled));
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
        setLifecycleStatus(normalizeStatus(saved.status, saved.enabled));
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

  const applyLifecycleResult = useCallback(
    (result: { status?: string; enabled?: boolean; flowDefinition?: unknown } | null | undefined) => {
      if (!result) return false;
      setLifecycleStatus(normalizeStatus(result.status, result.enabled));
      if (result.flowDefinition) {
        const parsed = parseTowerFlowDocument(result.flowDefinition);
        if (parsed) setFlow(parsed);
      } else {
        setFlow((prev) => ({
          ...prev,
          meta: { ...prev.meta, enabled: Boolean(result.enabled) },
        }));
      }
      return true;
    },
    [],
  );

  const publish = useCallback(async () => {
    if (!persistedId) return false;
    setLifecycleBusy(true);
    try {
      const { data: result } = await publishMutation({ variables: { id: persistedId } });
      const ok = applyLifecycleResult(result?.publishAutomation);
      if (ok) await refetch();
      return ok;
    } finally {
      setLifecycleBusy(false);
    }
  }, [persistedId, publishMutation, applyLifecycleResult, refetch]);

  const pause = useCallback(async () => {
    if (!persistedId) return false;
    setLifecycleBusy(true);
    try {
      const { data: result } = await pauseMutation({ variables: { id: persistedId } });
      const ok = applyLifecycleResult(result?.pauseAutomation);
      if (ok) await refetch();
      return ok;
    } finally {
      setLifecycleBusy(false);
    }
  }, [persistedId, pauseMutation, applyLifecycleResult, refetch]);

  const archive = useCallback(async () => {
    if (!persistedId) return false;
    setLifecycleBusy(true);
    try {
      const { data: result } = await archiveMutation({ variables: { id: persistedId } });
      const ok = applyLifecycleResult(result?.archiveAutomation);
      if (ok) await refetch();
      return ok;
    } finally {
      setLifecycleBusy(false);
    }
  }, [persistedId, archiveMutation, applyLifecycleResult, refetch]);

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
    lifecycleStatus,
    lifecycleBusy,
    publish,
    pause,
    archive,
  };
}
