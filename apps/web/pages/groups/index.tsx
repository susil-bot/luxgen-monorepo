import { GetServerSideProps } from 'next';

/** @deprecated Use /organization/groups */
export default function GroupsRedirect() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const search = context.resolvedUrl.includes('?') ? context.resolvedUrl.slice(context.resolvedUrl.indexOf('?')) : '';
  return {
    redirect: { destination: `/organization/groups${search}`, permanent: false },
  };
};
