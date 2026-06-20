import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { ProjectShell } from '../../../components/project/ProjectShell';
import { IterationBoard, NewItemModal } from '../../../components/project/IterationBoard';

interface Props {
  tenant: string;
}

export default function NextIterationPage({ tenant }: Props) {
  const router = useRouter();
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    if (router.query.new === '1') setShowNew(true);
  }, [router.query.new]);

  const closeNew = () => {
    setShowNew(false);
    const { new: _n, ...rest } = router.query;
    router.replace({ pathname: router.pathname, query: rest }, undefined, { shallow: true });
  };

  return (
    <ProjectShell
      tenant={tenant}
      title="Next iteration"
      subtitle="Plan upcoming work before the current sprint closes"
      activeTab="next"
    >
      <IterationBoard iteration="next" />
      {showNew && <NewItemModal iteration="next" onClose={closeNew} />}
    </ProjectShell>
  );
}

export const getServerSideProps = async (context: { query: { tenant?: string } }) => {
  const tenant = (context.query.tenant as string) || 'demo';
  return { props: { tenant } };
};
