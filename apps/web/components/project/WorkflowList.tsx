import { WORKFLOW_TEMPLATES } from '../../lib/project-types';

export function WorkflowList() {
  return (
    <div className="lux-project-workflows">
      <p className="lux-project-workflows__intro">
        Creator planning templates for content creators, teachers, and trainers. Apply-to-board seeding ships in a
        follow-up PR.
      </p>
      <div className="lux-project-workflows__grid">
        {WORKFLOW_TEMPLATES.map((wf) => (
          <article key={wf.id} className="lux-project-workflow-card">
            <span className="lux-project-workflow-card__persona">{wf.persona.replace('_', ' ')}</span>
            <h3 className="lux-project-workflow-card__title">{wf.name}</h3>
            <p className="lux-project-workflow-card__desc">{wf.description}</p>
            <button type="button" className="lux-project-workflow-card__btn" disabled title="Coming soon">
              Apply to board
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
