import { GetServerSideProps } from 'next';

export default function OrganizationIndex() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: { destination: '/organization/users', permanent: false },
});
