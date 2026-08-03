import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';

import {
  ARCHIVE_AUTOMATION,
  CREATE_AUTOMATION,
  GET_AUTOMATION,
  PAUSE_AUTOMATION,
  PUBLISH_AUTOMATION,
  TEST_AUTOMATION,
  UPDATE_AUTOMATION,
} from '../graphql/queries/automations';
import { createEmptyFlow, parseTowerFlowDocument, type TowerFlowDocument } from '../lib/automation-flow';
import { normalizeAutomationStatus, type AutomationLifecycleStatus } from '../lib/automation-status';
import { towerFlowToMutationInput } from '../lib/tower-flow-persist';

export type TowerSaveState = 'idle' | 'saving' | 'saved' | 'error';
export type TowerLifecycleStatus = AutomationLifecycleStatus;

interface UseTowerFlowPersistOptions {
  towerId: string;
  tenantId: string;
  onCreated?: (id: string) => void;
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
  const [testMutation] = useMutation(TEST_AUTOMATION);
  const [testBusy, setTestBusy] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);

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
    setLifecycleStatus(normalizeAutomationStatus(automation.status, automation.enabled));
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
          if (saved.status) setLifecycleStatus(normalizeAutomationStatus(saved.status, saved.enabled));
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
        setLifecycleStatus(normalizeAutomationStatus(saved.status, saved.enabled));
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
      setLifecycleStatus(normalizeAutomationStatus(result.status, result.enabled));
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

  /** Sample payload test-run — creates AutomationRun without a live trigger. */
  const testRun = useCallback(
    async (testData?: Record<string, unknown>) => {
      if (!persistedId) {
        setTestError('Save the tower before running a test');
        return null;
      }
      setTestBusy(true);
      setTestError(null);
      try {
        const sample =
          testData ??
          ({
            studentEmail: 'test-run@example.com',
            courseTitle: 'Sample Course',
            note: 'Manual test run from Tower editor',
          } as Record<string, unknown>);
        const { data: result, errors } = await testMutation({
          variables: { id: persistedId, testData: sample },
        });
        if (errors?.length) {
          setTestError(errors[0]?.message ?? 'Test run failed');
          return null;
        }
        const payload = result?.testAutomation;
        if (!payload?.run?.id) {
          setTestError('Test run did not return a run id');
          return null;
        }
        if (payload.errors?.length) {
          setTestError(payload.errors.join('; '));
        }
        return payload.run as { id: string; status: string; error?: string | null };
      } catch (e: unknown) {
        setTestError(e instanceof Error ? e.message : 'Test run failed');
        return null;
      } finally {
        setTestBusy(false);
      }
    },
    [persistedId, testMutation],
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
    lifecycleStatus,
    lifecycleBusy,
    publish,
    pause,
    archive,
    testRun,
    testBusy,
    testError,
  };
}
