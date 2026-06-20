import { ProjectShell } from '../../../components/project/ProjectShell';
import { WorkflowList } from '../../../components/project/WorkflowList';

interface Props {
  tenant: string;
}

export default function ProjectWorkflowsPage({ tenant }: Props) {
  return (
    <ProjectShell
      tenant={tenant}
      title="My workflows"
      subtitle="Creator planning templates for your iteration boards"
      activeTab="workflows"
    >
      <WorkflowList />
    </ProjectShell>
  );
}

export const getServerSideProps = async (context: { query: { tenant?: string } }) => {
  const tenant = (context.query.tenant as string) || 'demo';
  return { props: { tenant } };
};
