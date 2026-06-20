import { ProjectShell } from '../../../components/project/ProjectShell';
import { PriorityView } from '../../../components/project/PriorityView';

interface Props {
  tenant: string;
}

export default function ProjectPriorityPage({ tenant }: Props) {
  return (
    <ProjectShell
      tenant={tenant}
      title="Priority"
      subtitle="Cross-iteration view sorted by P0 → P3"
      activeTab="priority"
    >
      <PriorityView />
    </ProjectShell>
  );
}

export const getServerSideProps = async (context: { query: { tenant?: string } }) => {
  const tenant = (context.query.tenant as string) || 'demo';
  return { props: { tenant } };
};
