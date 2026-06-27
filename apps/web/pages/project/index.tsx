export const getServerSideProps = async (context: { query: { tenant?: string } }) => {
  const tenant = (context.query.tenant as string) || 'demo';
  return {
    redirect: {
      destination: `/project/iteration/current?tenant=${encodeURIComponent(tenant)}`,
      permanent: false,
    },
  };
};

export default function ProjectIndexRedirect() {
  return null;
}
