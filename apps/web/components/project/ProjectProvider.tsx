import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useMutation, useQuery } from '@apollo/client';

import {
  CREATE_PROJECT_ITEM,
  DELETE_PROJECT_ITEM,
  GET_PROJECT_ITEMS,
  MOVE_PROJECT_ITEM,
  UPDATE_PROJECT_ITEM,
} from '../../graphql/queries/project';
import {
  dateInputToIso,
  itemFromGql,
  iterationToGql,
  type UiProjectItem,
  type UiProjectIteration,
  type UiProjectPriority,
} from '../../lib/project-map';
import { getWorkflowTemplate, workflowItemToCreateInput } from '../../lib/project-workflows';
import type { ProjectIterationScope, ProjectPriority, ProjectStatus } from '../../lib/project-types';

interface ProjectContextValue {
  tenant: string;
  items: UiProjectItem[];
  loading: boolean;
  error?: string;
  filterQuery: string;
  setFilterQuery: (q: string) => void;
  addItem: (partial: {
    title: string;
    status: ProjectStatus;
    iteration: ProjectIterationScope;
    priority?: ProjectPriority;
    assignee?: string;
    startDate?: string;
    endDate?: string;
    estimate?: number;
    description?: string;
    labels?: string[];
  }) => Promise<void>;
  updateItem: (
    id: string,
    patch: {
      title?: string;
      status?: ProjectStatus;
      iteration?: ProjectIterationScope;
      priority?: ProjectPriority;
      assignee?: string;
      startDate?: string;
      endDate?: string;
      estimate?: number;
      description?: string;
      labels?: string[];
    },
  ) => Promise<void>;
  moveItem: (id: string, status: ProjectStatus) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  applyWorkflow: (templateId: string, iteration: UiProjectIteration) => Promise<number>;
  applyingWorkflow: boolean;
  itemsForIteration: (iteration: ProjectIterationScope) => UiProjectItem[];
  filteredItems: UiProjectItem[];
  refetch: () => void;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ tenant, children }: { tenant: string; children: ReactNode }) {
  const [filterQuery, setFilterQuery] = useState('');

  const { data, loading, error, refetch } = useQuery(GET_PROJECT_ITEMS, {
    variables: {
      tenantId: tenant,
      search: filterQuery.trim() || undefined,
    },
    fetchPolicy: 'cache-and-network',
    skip: !tenant,
  });

  const [createItem] = useMutation(CREATE_PROJECT_ITEM);
  const [updateItemMutation] = useMutation(UPDATE_PROJECT_ITEM);
  const [moveItemMutation] = useMutation(MOVE_PROJECT_ITEM);
  const [deleteItemMutation] = useMutation(DELETE_PROJECT_ITEM);
  const [applyingWorkflow, setApplyingWorkflow] = useState(false);

  const items = useMemo(
    () => (data?.projectItems ?? []).map((raw: Parameters<typeof itemFromGql>[0]) => itemFromGql(raw)),
    [data],
  );

  const filteredItems = items;

  const itemsForIteration = useCallback(
    (iteration: ProjectIterationScope) => filteredItems.filter((item) => item.iteration === iteration),
    [filteredItems],
  );

  const addItem = useCallback(
    async (partial: {
      title: string;
      status: ProjectStatus;
      iteration: ProjectIterationScope;
      priority?: ProjectPriority;
      assignee?: string;
      startDate?: string;
      endDate?: string;
      estimate?: number;
      description?: string;
      labels?: string[];
    }) => {
      await createItem({
        variables: {
          input: {
            tenantId: tenant,
            title: partial.title,
            description: partial.description,
            status: partial.status,
            iteration: iterationToGql(partial.iteration),
            priority: partial.priority ?? 'P2',
            assigneeName: partial.assignee,
            startDate: dateInputToIso(partial.startDate),
            endDate: dateInputToIso(partial.endDate),
            estimate: partial.estimate,
            labels: partial.labels ?? [],
          },
        },
      });
      await refetch();
    },
    [createItem, tenant, refetch],
  );

  const updateItem = useCallback(
    async (
      id: string,
      patch: {
        title?: string;
        status?: ProjectStatus;
        iteration?: ProjectIterationScope;
        priority?: ProjectPriority;
        assignee?: string;
        startDate?: string;
        endDate?: string;
        estimate?: number;
        description?: string;
        labels?: string[];
      },
    ) => {
      await updateItemMutation({
        variables: {
          id,
          tenantId: tenant,
          input: {
            title: patch.title,
            description: patch.description,
            status: patch.status,
            iteration: patch.iteration ? iterationToGql(patch.iteration) : undefined,
            priority: patch.priority,
            assigneeName: patch.assignee,
            startDate: patch.startDate ? dateInputToIso(patch.startDate) : undefined,
            endDate: patch.endDate ? dateInputToIso(patch.endDate) : undefined,
            estimate: patch.estimate,
            labels: patch.labels,
          },
        },
      });
      await refetch();
    },
    [updateItemMutation, tenant, refetch],
  );

  const moveItem = useCallback(
    async (id: string, status: ProjectStatus) => {
      await moveItemMutation({
        variables: { id, tenantId: tenant, status },
      });
      await refetch();
    },
    [moveItemMutation, tenant, refetch],
  );

  const deleteItem = useCallback(
    async (id: string) => {
      await deleteItemMutation({
        variables: { id, tenantId: tenant },
      });
      await refetch();
    },
    [deleteItemMutation, tenant, refetch],
  );

  const applyWorkflow = useCallback(
    async (templateId: string, iteration: UiProjectIteration) => {
      const template = getWorkflowTemplate(templateId);
      if (!template) return 0;

      setApplyingWorkflow(true);
      try {
        await Promise.all(
          template.items.map((item) =>
            createItem({
              variables: {
                input: workflowItemToCreateInput(tenant, iteration, item),
              },
            }),
          ),
        );
        await refetch();
        return template.items.length;
      } finally {
        setApplyingWorkflow(false);
      }
    },
    [createItem, tenant, refetch],
  );

  const value = useMemo(
    () => ({
      tenant,
      items,
      loading,
      error: error?.message,
      filterQuery,
      setFilterQuery,
      addItem,
      updateItem,
      moveItem,
      deleteItem,
      applyWorkflow,
      applyingWorkflow,
      itemsForIteration,
      filteredItems,
      refetch: () => {
        void refetch();
      },
    }),
    [
      tenant,
      items,
      loading,
      error,
      filterQuery,
      addItem,
      updateItem,
      moveItem,
      deleteItem,
      applyWorkflow,
      applyingWorkflow,
      itemsForIteration,
      filteredItems,
      refetch,
    ],
  );

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProject(): ProjectContextValue {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject must be used within ProjectProvider');
  return ctx;
}

export function priorityRank(p: UiProjectPriority): number {
  return { P0: 0, P1: 1, P2: 2, P3: 3 }[p];
}
