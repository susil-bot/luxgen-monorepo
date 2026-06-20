import { useState } from 'react';
import { useRouter } from 'next/router';

import { PROJECT_WORKFLOW_TEMPLATES } from '../../lib/project-workflows';
import type { UiProjectIteration } from '../../lib/project-map';
import { useProject } from './ProjectProvider';

export function WorkflowList() {
  const router = useRouter();
  const { applyWorkflow, applyingWorkflow } = useProject();
  const [iteration, setIteration] = useState<UiProjectIteration>('current');
  const [lastApplied, setLastApplied] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);

  const handleApply = async (templateId: string) => {
    setApplyError(null);
    setLastApplied(null);
    try {
      const count = await applyWorkflow(templateId, iteration);
      if (count > 0) {
        setLastApplied(templateId);
        const boardPath = iteration === 'current' ? '/project/iteration/current' : '/project/iteration/next';
        const tenant = typeof router.query.tenant === 'string' ? router.query.tenant : 'demo';
        setTimeout(() => {
          void router.push(`${boardPath}?tenant=${encodeURIComponent(tenant)}`);
        }, 600);
      }
    } catch (e) {
      setApplyError(e instanceof Error ? e.message : 'Failed to apply workflow');
    }
  };

  return (
    <div className="lux-project-workflows">
      <p className="lux-project-workflows__intro">
        Creator planning templates for content creators, teachers, and trainers. Apply a workflow to seed cards on your
        iteration board.
      </p>

      <div className="lux-project-workflows__target">
        <span className="lux-project-workflows__target-label">Apply to</span>
        <div className="lux-project-priority__filters" role="group" aria-label="Target iteration">
          <button
            type="button"
            className={`lux-project-priority-chip${iteration === 'current' ? ' lux-project-priority-chip--active' : ''}`}
            onClick={() => setIteration('current')}
          >
            Ongoing iteration
          </button>
          <button
            type="button"
            className={`lux-project-priority-chip${iteration === 'next' ? ' lux-project-priority-chip--active' : ''}`}
            onClick={() => setIteration('next')}
          >
            Next iteration
          </button>
        </div>
      </div>

      {applyError && (
        <p className="lux-project-workflows__error" role="alert">
          {applyError}
        </p>
      )}

      <div className="lux-project-workflows__grid">
        {PROJECT_WORKFLOW_TEMPLATES.map((wf) => (
          <article key={wf.id} className="lux-project-workflow-card">
            <span className="lux-project-workflow-card__persona">{wf.persona.replace('_', ' ')}</span>
            <h3 className="lux-project-workflow-card__title">{wf.name}</h3>
            <p className="lux-project-workflow-card__desc">{wf.description}</p>
            <p className="lux-project-workflow-card__meta">{wf.items.length} cards</p>
            <button
              type="button"
              className="lux-project-workflow-card__btn lux-project-workflow-card__btn--active"
              disabled={applyingWorkflow}
              onClick={() => void handleApply(wf.id)}
            >
              {applyingWorkflow ? 'Applying…' : lastApplied === wf.id ? 'Applied ✓' : 'Apply to board'}
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
